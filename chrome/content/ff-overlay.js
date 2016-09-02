/**
 * @file ff-overlay.js
 *
 * @desc Initialize top-level properties and methods of the extension.
 *
 * @external OpenAjax.a11y.RulesetInfo
 * @external OpenAjax.a11y.RulesetManager
 */

/* global SidebarUI */

// create ainspector top-level namespace
Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

// create namespace for utilities imports
ainspector.utils = {};

// import getLogger
Components.utils.import("chrome://ai-sidebar/content/utilities/logger.js", ainspector.utils);

// import getProperties, getMethods, et al.
Components.utils.import("chrome://ai-sidebar/content/utilities/inspection.js", ainspector.utils);

// import PrefListener and PrefUtils objects
Components.utils.import("chrome://ai-sidebar/content/utilities/preferences.js", ainspector.utils);

// import Enum and inherits
Components.utils.import("chrome://ai-sidebar/content/utilities/utils.js", ainspector.utils);

// create constants for view selection
ainspector.viewEnum = new ainspector.utils.Enum(ainspector.viewStrings);

// create constants for view types
ainspector.viewType = new ainspector.utils.Enum(['SUMMARY', 'CATEGORY', 'DETAILS']);

// create special constant for details view
// IMPORTANT: value must be distinct from those in viewEnum
ainspector.viewConst = { DETAILS: -1 };

// create constant for tab attribute
ainspector.tabAttrName = "aisopen";

// create namespace in parent window context
parent.AINSPECTOR = {
  currentView:   null,
  previousView:  null,
  lastCategory:    -1,
  lastGuideline:   -1,
  startTime:        0,
  startup:       true,
  timeoutId:        0
};

// initialize RulesetInfo objects
ainspector.ariaStrictInfo = OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT').getRulesetInfo();
ainspector.ariaTransInfo  = OpenAjax.a11y.RulesetManager.getRuleset('ARIA_TRANS').getRulesetInfo();

// get the root branch of preferences
ainspector.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefBranch);

// instantiate advancedPrefs object
ainspector.advancedPrefs = (function () {
  // private member
  var prefUtils = new ainspector.utils.PrefUtils("extensions.ainspector.advanced.");

  // public methods
  return {
    getPref: function (name) {
      if (name === 'firstRun')
        return prefUtils.getBoolPref(name);
      if (name === 'selectLastView')
        return prefUtils.getBoolPref(name);
      if (name === 'hideVersionId')
        return prefUtils.getBoolPref(name);

      ainspector.reportError("advancedPrefs.getPref: unmatched preference: " + name);
      return undefined;
    },

    setPref: function (name, value) {
      if (name === 'firstRun')
        prefUtils.setBoolPref(name, value);
    },

    hasUserValues: function () {
      return prefUtils.hasUserValues();
    },

    resetAll: function () {
      prefUtils.restoreDefaults();
    }
  }; // end return
}());

/**
 * @function setupOnFirstRun
 *
 * @memberOf ainspector
 *
 * @desc Checks preference firstRun; if firstRun, checks whether toolbar button is
 *       installed; if not, installs it at the end of the navigation toolbar.
 */

ainspector.setupOnFirstRun = function () {
  if (ainspector.advancedPrefs.getPref("firstRun")) {
    // set false for all subsequent invocations
    ainspector.advancedPrefs.setPref("firstRun", false);

    // add AI button to navigation toolbar
    var buttonId = "ainspector-sidebar-button";
    if (!document.getElementById(buttonId)) {
      var toolbar = document.getElementById("nav-bar");
      toolbar.insertItem(buttonId, null);
      toolbar.setAttribute("currentset", toolbar.currentSet);
      document.persist(toolbar.id, "currentset");
    }
  }
};

/**
 * @function getViewName
 *
 * @memberOf ainspector
 *
 * @desc Helper function used mainly for logging.
 */

ainspector.getViewName = function (index) {
  var name = (index === ainspector.viewConst.DETAILS) ?
    "DETAILS" : ainspector.viewStrings[index];

  return name;
};

/**
 * @function isSidebarVisible
 *
 * @memberOf parent.AINSPECTOR
 *
 * @desc Helper function used by closeSidebarIfOpen.
 */

parent.AINSPECTOR.isSidebarVisible = function () {
  var sidebarUrl, sidebarWindow;

  sidebarUrl = "chrome://ai-sidebar/content/ai-sidebar.xul";
  sidebarWindow = document.getElementById("sidebar").contentWindow;

  return (sidebarWindow.location.href == sidebarUrl);
};

/**
 * @function onTabSelect
 *
 * @memberOf ainspector
 *
 * @desc React to changing tab selection in browser window.
 */

parent.AINSPECTOR.onTabSelect = function () {
  var isVisible, shouldBeVisible;

  isVisible = parent.AINSPECTOR.isSidebarVisible();
  shouldBeVisible = parent.gBrowser.selectedTab.getAttribute(ainspector.tabAttrName) == "true";

  if (parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS) {
    parent.AINSPECTOR.currentView = parent.AINSPECTOR.previousView;
  }

  if ((!isVisible && shouldBeVisible) || (isVisible && !shouldBeVisible)) {
    parent.SidebarUI.toggle('ainspector-view-sidebar');
  }
  else {
    if (isVisible && parent.AINSPECTOR.updateContext)
      parent.AINSPECTOR.updateContext();
  }
};

/**
 * @function closeSidebarIfOpen
 *
 * @memberOf ainspector
 *
 * @desc Used only at startup (when new window is opened) to avoid Firefox default behavior.
 */

ainspector.closeSidebarIfOpen = function () {
  var elapsed;

  if (parent.AINSPECTOR.startup && parent.AINSPECTOR.isSidebarVisible()) {
    parent.AINSPECTOR.startup = false;
    elapsed = Date.now() - parent.AINSPECTOR.startTime;
    ainspector.log.info("Elapsed time at startup: " + elapsed);
    SidebarUI.toggle('ainspector-view-sidebar');
  }
};

/**
 * @function onLoad
 *
 * @memberOf ainspector
 *
 * @desc Initialize the AInspector extension.
 */

ainspector.onLoad = function () {
  var msec = 200;

  // change logger enabled and level properties here (and only here)
  ainspector.log = ainspector.utils.getLogger("AIS", false);
  ainspector.log.level = ainspector.log.LEVEL.DEBUG;
  ainspector.log.info("Loading AInspector Sidebar extension...");

  // initializations
  ainspector.initFromGeneralPrefs();
  ainspector.initFromEvaluationPrefs();
  ainspector.preferencesWindow = null;
  ainspector.setupOnFirstRun();

  // respond to tab selections
  parent.gBrowser.tabContainer.addEventListener("TabSelect", parent.AINSPECTOR.onTabSelect, false);

  // new browser window opens with AInspector closed
  parent.AINSPECTOR.startTime = Date.now();
  for (let mult = 1; mult <= 4; mult++) setTimeout(ainspector.closeSidebarIfOpen, msec * mult);

  /* check namespace setup
  ainspector.log.debug(ainspector.utils.getProperties(ainspector, "ainspector"));
  ainspector.log.debug(ainspector.utils.getMethods(ainspector, "ainspector"));
  */
};

window.addEventListener("load", ainspector.onLoad, false);
