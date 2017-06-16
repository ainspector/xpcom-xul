/**
 * @file ai-sidebar.js
 *
 * @desc Define the ainspectorSidebar namespace and the main properties and
 *       methods for display of rule evaluation information.
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");
Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

// import PrefListener and PrefUtils objects
Components.utils.import("chrome://ai-sidebar/content/utilities/preferences.js", ainspector);

/**
 * @namespace ainspectorSidebar
 */

/* global ainspectorSidebar: true */

var ainspectorSidebar = {
  locationHref:      "",
  locationLabel:     null,
  progressMeter:     null,
  locationInfo:      null,
  numViews:          ainspector.viewStrings.length,
  ruleGroupResults:  null,
  viewTitle:         null,
  viewDeck:          null
};

/**
 * @function isFirefoxVersionGte
 *
 * Services.vc.compare is an alias to the nsIVersionComparitor fn. It compares
 * version strings arg1 and arg2 and returns one of the following three values:
 *   if arg1 < arg2 -> -1
 *   if arg1 = arg2 ->  0
 *   if arg1 > arg2 ->  1
 */

ainspectorSidebar.isFirefoxVersionGte = function (minVersion) {
  var firefoxVersion = Services.appinfo.version;
  var compareResult = Services.vc.compare(firefoxVersion, minVersion);
  return (compareResult >= 0)
}

// import Page Inspector modules: Loader, which exports 'devtools' symbol,
// and gDevTools. Note: Paths to these modules were changed in Firefox 44.
try {
  Components.utils.import("resource://devtools/shared/Loader.jsm", ainspectorSidebar);
}
catch(e) {
  Components.utils.import("resource://gre/modules/devtools/Loader.jsm", ainspectorSidebar);
}

try {
  Components.utils.import("resource://devtools/client/framework/gDevTools.jsm", ainspectorSidebar);
}
catch(e) {
  Components.utils.import("resource:///modules/devtools/gDevTools.jsm", ainspectorSidebar);
}

// load highlight module script
Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/highlight/highlight.js", ainspectorSidebar);

/**
 * @function showTransition
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Indicate to the user that a page load transition is underway by (a)
 *       clearing the data in the current view and (b) making the progressmeter
 *       visible. Note: If the current view is Rule Details, we also revert the
 *       value of currentView to previousView in anticipation of the call to
 *       updateContext, which refreshes the view.
 */

ainspectorSidebar.showTransition = function () {
  var location = ainspectorSidebar.progressListener.getLocation();
  ainspector.log.debug("showTransition: " + location);
  ainspectorSidebar.clearCurrentView();
  ainspectorSidebar.showProgressMeter();
  if (parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS)
    parent.AINSPECTOR.currentView = parent.AINSPECTOR.previousView;
};

/**
 * @function updateContext
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Save the location HREF for the currently displayed page and
 *       display location information (i.e. current URL).
 */

ainspectorSidebar.updateContext = function () {
  ainspectorSidebar.locationHref = window.content.location.href;
  ainspector.log.debug("updateContext: " + ainspectorSidebar.locationHref);
  ainspectorSidebar.highlightModule.removeHighlight(window.content.document);
  ainspectorSidebar.evaluate();
  ainspectorSidebar.updateView();
  ainspectorSidebar.showOptions();
  ainspectorSidebar.showLocation();
};

/**
 * @function updateEvaluation
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Re-evaluate the current page and refresh the information display.
 *       Called when the user selects the Rerun Evaluation button (with or
 *       without a delay).
 */

ainspectorSidebar.updateEvaluation = function () {
  // set timeoutId to 0 for cases where setTimeout has just finished
  parent.AINSPECTOR.timeoutId = 0;
  ainspectorSidebar.showTransition();
  setTimeout(ainspectorSidebar.updateContext, 300);
};

/**
 * @function rerunBasedOnPreference
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Event handler for 'Rerun Evaluation' button: If the user has set the
 *       promptForDelay preference, open the dialog to get the delay setting;
 *       otherwise, rerun the evaluation without delay.
 */

ainspectorSidebar.rerunBasedOnPreference = function () {
  var promptForDelay = ainspector.generalPrefs.getPref('promptForDelay');
  if (promptForDelay)
    window.openDialog('chrome://ai-sidebar/content/delay-setting.xul',
                      "", "centerscreen, modal", ainspectorSidebar);
  else
    ainspectorSidebar.updateEvaluation();
};

/**
 * @function rerunEvaluation
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Preconditions: User has requested that the evaluation be rerun with
 *       a set number of seconds for the delay. User may have requested that
 *       the promptForDelay preference be reset to false. Called by the fn.
 *       rerunWithDelay in delay-settings.js, which is the script that handles
 *       the "accept" response to the delay prompt dialog.
 *
 * @param delay - integer - number of seconds to delay the requested evaluation
 * @param stopPrompting: boolean - true if user no longer wants delay prompt
 */

ainspectorSidebar.rerunEvaluation = function (delay, stopPrompting) {
  var evalButton = ainspectorSidebar.evaluateButton;
  var sec = delay;

  var nls = ainspectorSidebar.nlsProperties;
  var strRerunEvaluation = nls.getString("button.label.rerunEvaluation");
  var strWaitingPrefix   = nls.getString("button.label.waitingPrefix");
  var strSecSuffix       = nls.getString("button.label.secSuffix");

  function updateButtonLabel() {
    if (sec === 0) { // reset button to default state
      evalButton.label = strRerunEvaluation;
      evalButton.disabled = false;
      return;
    }

    evalButton.label = strWaitingPrefix + sec + strSecSuffix;
    sec = sec - 1;
    setTimeout(updateButtonLabel, 1000);
  }

  // reset preference
  if (stopPrompting === true)
    ainspector.generalPrefs.setPref('promptForDelay', false);

  // while evaluation is pending, disable button and show countdown label
  evalButton.disabled = true;
  updateButtonLabel();

  // keep track of timeoutId so that it can be cancelled; also
  // delay is in seconds, so convert to milliseconds
  parent.AINSPECTOR.timeoutId = setTimeout(ainspectorSidebar.updateEvaluation, delay * 1000);
};

/**
 * @function clearPendingEvaluation
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Call clearTimeout to cancel pending delayed evaluation and reset
 *       timeoutId to 0. Called when sidebar is loaded or unloaded.
 */

ainspectorSidebar.clearPendingEvaluation = function () {
  if (parent.AINSPECTOR.timeoutId === 0) return;

  // timeoutId is non-zero -> cancel pending evaluation
  clearTimeout(parent.AINSPECTOR.timeoutId);
  parent.AINSPECTOR.timeoutId = 0;
};

/**
 * @function handleGeneralPrefChange
 *
 * @memberOf ainspectorSidebar
 *
 * @desc When a general preference is changed that affects the display
 *       of evaluation data, call the necessary update functions.
 */

ainspectorSidebar.handleGeneralPrefChange = function (branch, name) {
  var actionNeeded = false;

  switch (name) {

  case 'screenReaderMode':
    actionNeeded = true;
    break;

  default:
    break;
  }

  if (actionNeeded) ainspectorSidebar.updateContext();
};

/**
 * @function handleEvaluationPrefChange
 *
 * @memberOf ainspectorSidebar
 *
 * @desc When an evaluation preference is changed that immediately affects
 *       evaluation data, at minimum we need to call updateContext, which
 *       calls, among other functions, evaluate and updateView. However,
 *       if the currentView is Rule Details, the rule currently being viewed
 *       may no longer be included, depending on the preference change. Thus
 *       in this case, we need to call the function updateEvaluation, which
 *       calls both showTransition and updateContext.
 */

ainspectorSidebar.handleEvaluationPrefChange = function (branch, name) {
  var actionNeeded = false;

  switch (name) {

  case 'ruleset':
    actionNeeded = true;
    break;

  case 'passAndNotApplicable':
    actionNeeded = true;
    break;

  default:
    break;
  }

  if (!actionNeeded) return;

  if (parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS)
    ainspectorSidebar.updateEvaluation();
  else
    ainspectorSidebar.updateContext();
};

/**
 * @function init
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Perform all of the initializations needed when the sidebar loads.
 */

ainspectorSidebar.init = function () {
  var highlightProps;

  // set default value for view
  if (parent.AINSPECTOR.currentView === null)
    parent.AINSPECTOR.currentView = ainspector.viewEnum.SUMMARY;

  if (parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS)
    parent.AINSPECTOR.currentView = parent.AINSPECTOR.previousView;

  // initialize for focus management
  ainspectorSidebar.newEvaluation = false;

  // load script with progressListener factory method
  Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader)
    .loadSubScript("chrome://ai-sidebar/content/utilities/progress.js", ainspectorSidebar);

  // instantiate progressListener
  ainspectorSidebar.progressListener = ainspectorSidebar.getProgressListener(
    ainspectorSidebar.showTransition,
    ainspectorSidebar.updateContext);

  // add progressListener
  parent.gBrowser.addProgressListener(ainspectorSidebar.progressListener);

  // instantiate and register generalPrefListener
  ainspectorSidebar.generalPrefListener = new ainspector.PrefListener(
    "extensions.ainspector.general.", ainspectorSidebar.handleGeneralPrefChange);
  ainspectorSidebar.generalPrefListener.register();

  // instantiate and register evaluationPrefListener
  ainspectorSidebar.evaluationPrefListener = new ainspector.PrefListener(
    "extensions.ainspector.evaluation.", ainspectorSidebar.handleEvaluationPrefChange);
  ainspectorSidebar.evaluationPrefListener.register();

  // get NLS stringbundle
  ainspectorSidebar.nlsProperties = document.getElementById('ainspector-sidebar-properties');

  // initialize highlight module
  highlightProps = {
    stringBundleId:    "ainspector-highlight-properties",
    highlightDivClass: "ainspector-highlight",
    offScreenDivClass: "ainspector-offscreen",
    offScreenDivId:    "ainspector-offscreen"
  };
  ainspectorSidebar.highlightModule.initHighlight(highlightProps);

  // initialize references to user interface components
  ainspectorSidebar.detailsTabbox         = document.getElementById("ainspector-details-tabbox");
  ainspectorSidebar.elementResultsTree    = document.getElementById("ainspector-element-results-tree");
  ainspectorSidebar.evaluateButton        = document.getElementById("ainspector-evaluate-button");
  ainspectorSidebar.inspectElementButton  = document.getElementById("ainspector-inspect-element");
  ainspectorSidebar.locationInfo          = document.getElementById("ainspector-location-info");
  ainspectorSidebar.locationLabel         = document.getElementById("ainspector-location-label");
  ainspectorSidebar.progressMeter         = document.getElementById("ainspector-progress-meter");
  ainspectorSidebar.categorySummaryHeader = document.getElementById("ainspector-category-summary-header");
  ainspectorSidebar.categorySummaryData   = document.getElementById("ainspector-category-summary-data");
  ainspectorSidebar.ruleCategoryTree      = document.getElementById("ainspector-rule-category-tree");
  ainspectorSidebar.selectedRule          = document.getElementById("ainspector-selected-rule");
  ainspectorSidebar.summaryTabbox         = document.getElementById("ainspector-summary-tabbox");
  ainspectorSidebar.summaryRCTree         = document.getElementById("ainspector-summary-rc-tree");
  ainspectorSidebar.summaryWCAGTree       = document.getElementById("ainspector-summary-wcag-tree");
  ainspectorSidebar.versionLabel          = document.getElementById("ainspector-version-label");
  ainspectorSidebar.viewTitle             = document.getElementById("ainspector-view-title");
  ainspectorSidebar.viewDeck              = document.getElementById("ainspector-view-deck");

  // lazy initialization
  ainspectorSidebar.elementResultStrings  = null;
  ainspectorSidebar.ruleResultStrings     = null;

  // set and display the version number
  function setVersionLabel(addon) {
    var prefix = ainspectorSidebar.nlsProperties.getString("version.prefix");
    ainspectorSidebar.versionLabel.value = prefix + addon.version;
  }
  AddonManager.getAddonByID("ai-sidebar@ainspector.org", setVersionLabel);

  // advanced branch preference determines whether versionLabel is visible
  ainspectorSidebar.versionLabel.hidden = ainspector.advancedPrefs.getPref("hideVersionId");

  // register with current tab
  parent.gBrowser.selectedTab.setAttribute(ainspector.tabAttrName, "true");

  // register callback for tab selection
  parent.AINSPECTOR.updateContext = ainspectorSidebar.updateContext;
};

/**
 * @function getViewTitle
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Get the localized view title associated with the specified view.
 */

ainspectorSidebar.getViewTitle = function (viewIndex) {
  var nls  = ainspectorSidebar.nlsProperties,
      view = ainspector.viewEnum;

  switch (viewIndex) {

  case view.SUMMARY:
    return nls.getString('view.title.summary');

  case view.LANDMARKS:
    return nls.getString('view.title.landmarks');

  case view.HEADINGS:
    return nls.getString('view.title.headings');

  case view.STYLES:
    return nls.getString('view.title.styles');

  case view.IMAGES:
    return nls.getString('view.title.images');

  case view.LINKS:
    return nls.getString('view.title.links');

  case view.TABLES:
    return nls.getString('view.title.tables');

  case view.FORMS:
    return nls.getString('view.title.forms');

  case view.WIDGETS:
    return nls.getString('view.title.widgets');

  case view.MEDIA:
    return nls.getString('view.title.media');

  case view.KEYBOARD:
    return nls.getString('view.title.keyboard');

  case view.TIMING:
    return nls.getString('view.title.timing');

  case view.NAVIGATION:
    return nls.getString('view.title.navigation');

  case view.ALL_RULES:
    return nls.getString('view.title.all-rules');

  case view.WCAG_1_1:
    return nls.getString('view.title.wcag-1-1');

  case view.WCAG_1_2:
    return nls.getString('view.title.wcag-1-2');

  case view.WCAG_1_3:
    return nls.getString('view.title.wcag-1-3');

  case view.WCAG_1_4:
    return nls.getString('view.title.wcag-1-4');

  case view.WCAG_2_1:
    return nls.getString('view.title.wcag-2-1');

  case view.WCAG_2_2:
    return nls.getString('view.title.wcag-2-2');

  case view.WCAG_2_3:
    return nls.getString('view.title.wcag-2-3');

  case view.WCAG_2_4:
    return nls.getString('view.title.wcag-2-4');

  case view.WCAG_3_1:
    return nls.getString('view.title.wcag-3-1');

  case view.WCAG_3_2:
    return nls.getString('view.title.wcag-3-2');

  case view.WCAG_3_3:
    return nls.getString('view.title.wcag-3-3');

  case view.WCAG_4_1:
    return nls.getString('view.title.wcag-4-1');

  default:
    break;
  }

  return '';
};

/**
 * @function getSummaryGridLabel
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Helper function for constructing an aria-label attribute value for summary data
 */

ainspectorSidebar.getSummaryGridLabel = function (heading, summaryData) {
  var nls  = ainspectorSidebar.nlsProperties;
  var includePass = ainspector.evaluationPrefs.getPref('passAndNotApplicable');

  var resultLabel = {
    viol: nls.getString('rulegroup.results.violations'),
    warn: nls.getString('rulegroup.results.warnings'),
    mc:   nls.getString('rulegroup.results.manual-checks'),
    pass: nls.getString('rulegroup.results.passes')
  };

  var label = heading +
              resultLabel.viol + ': ' + summaryData.viol + ", " +
              resultLabel.warn + ': ' + summaryData.warn + ", " +
              resultLabel.mc   + ': ' + summaryData.mc;

  if (includePass) label += ", " + resultLabel.pass + ': ' + summaryData.pass;
  return label;
};

/**
 * @function closePageInspector
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Called when view is changed or sidebar is closed.
 */

ainspectorSidebar.closePageInspector = function () {
  let devtools  = ainspectorSidebar.devtools;
  let gDevTools = ainspectorSidebar.gDevTools;
  let gBrowser = parent.gBrowser;
  let target = devtools.TargetFactory.forTab(gBrowser.selectedTab);

  gDevTools.closeToolbox(target);
};

/**
 * @function setBackButtonState
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set state of Back button based on currentView
 */

ainspectorSidebar.setBackButtonState = function () {
  var button = document.getElementById("ainspector-back-button");
  var previousView = parent.AINSPECTOR.previousView;
  var nls = ainspectorSidebar.nlsProperties;

  switch (parent.AINSPECTOR.currentView) {

  case ainspector.viewEnum.SUMMARY:
    button.disabled = true;
    button.image = "chrome://ai-sidebar/skin/back-button-off.png";
    button.setAttribute("tooltiptext", "");
    break;

  case ainspector.viewConst.DETAILS:
    button.disabled = false;
    button.image = "chrome://ai-sidebar/skin/back-button.png";
    button.setAttribute("tooltiptext", (previousView > ainspector.viewEnum.ALL_RULES) ?
      nls.getString("button.tooltip.backToGuideline") :
      nls.getString("button.tooltip.backToCategory"));
    break;

  default:
    button.disabled = false;
    button.image = "chrome://ai-sidebar/skin/back-button.png";
    button.setAttribute("tooltiptext", nls.getString("button.tooltip.backToSummary"));
    break;
  }
};

/**
 * @function updateView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Replace currently displayed view info with new view info.
 */

ainspectorSidebar.updateView = function () {
  if (parent.AINSPECTOR.currentView === null) return;

  ainspector.log.debug("updateView: " + ainspector.getViewName(parent.AINSPECTOR.currentView));

  ainspectorSidebar.closePageInspector();
  ainspectorSidebar.setBackButtonState();
  ainspectorSidebar.viewTitle.value = ainspectorSidebar.getViewTitle(parent.AINSPECTOR.currentView);

  switch (parent.AINSPECTOR.currentView) {

  case ainspector.viewEnum.SUMMARY:
    ainspectorSidebar.setSummaryView();
    break;

  case ainspector.viewConst.DETAILS:
    ainspectorSidebar.setDetailsView();
    break;

  default:
    ainspectorSidebar.setCategoryView();
    break;
  }
};

/**
 * @function selectView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set the current view and update if necessary. Since this fn. is called
 *       from the Views menu, we have to handle the special case of selecting
 *       the previous view when in Rule Details mode.
 */

ainspectorSidebar.selectView = function (viewConst) {
  var menuitem;
  ainspector.log.debug("selectView: " + ainspector.getViewName(viewConst));

  if (parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS &&
      viewConst === parent.AINSPECTOR.previousView) {
    ainspectorSidebar.selectPreviousView();
    return;
  }

  // if coming from DETAILS view, remove focus from the Element Results tree
  if (parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS)
    ainspectorSidebar.elementResultsTree.blur();

  if (viewConst !== parent.AINSPECTOR.currentView) {
    // save the current view as previous view
    parent.AINSPECTOR.previousView = parent.AINSPECTOR.currentView;

    // remove highlighting
    ainspectorSidebar.highlightModule.removeHighlight(window.content.document);

    // uncheck the previously selected item
    menuitem = ainspectorSidebar.getViewsMenuitem(parent.AINSPECTOR.currentView);
    if (menuitem) menuitem.removeAttribute("checked");

    // save the new selection and update the view
    parent.AINSPECTOR.currentView = viewConst;
    ainspectorSidebar.updateView();
  }
};

/**
 * @function selectPreviousView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Go back to the Rule Category or WCAG Guideline view that was active
 *       prior to the selection of the Rule Details view. By simply changing
 *       the viewDeck index, the row selection state of the previous view is
 *       maintained. Note: This function should only be called when the Rule
 *       Details view is active.
 */

ainspectorSidebar.selectPreviousView = function () {
  if (parent.AINSPECTOR.currentView !== ainspector.viewConst.DETAILS) return;

  ainspector.log.debug("selectPreviousView: " + ainspector.getViewName(parent.AINSPECTOR.previousView));

  // remove highlighting
  ainspectorSidebar.highlightModule.removeHighlight(window.content.document);

  // update currentView
  parent.AINSPECTOR.currentView = parent.AINSPECTOR.previousView;

  // update viewTitle
  ainspectorSidebar.viewTitle.value = ainspectorSidebar.getViewTitle(parent.AINSPECTOR.currentView);

  // manage Inspector and Back button states
  ainspectorSidebar.closePageInspector();
  ainspectorSidebar.setBackButtonState();

  // select rule category template
  ainspectorSidebar.viewDeck.selectedIndex = ainspector.viewType.CATEGORY;

  // set focus to the previously selected row
  ainspectorSidebar.ruleCategoryTree.focus();
};

/**
 * @function backOneLevel
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Navigate back one level from Rule Details or Rule Category/Guideline.
 */

ainspectorSidebar.backOneLevel = function () {
  if (parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS)
    ainspectorSidebar.selectPreviousView();
  else
    ainspectorSidebar.selectView(ainspector.viewEnum.SUMMARY);
};

/**
 * @function clearCurrentView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Clear the data during page load transition.
 */

ainspectorSidebar.clearCurrentView = function () {
  if (parent.AINSPECTOR.currentView === null) return;

  switch (parent.AINSPECTOR.currentView) {

  case ainspector.viewEnum.SUMMARY:
    ainspectorSidebar.clearSummaryView();
    break;

  case ainspector.viewConst.DETAILS:
    ainspectorSidebar.clearDetailsView();
    break;

  default:
    ainspectorSidebar.clearCategoryView();
    break;
  }
};

/**
 * @function openPreferencesWindow
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Instantiate the preferences window and save a reference to it; if it
 *       already exists, bring it to the front.
 */

ainspectorSidebar.openPreferencesWindow = function () {
  var instantApply, features;

  if (ainspector.preferencesWindow === null || ainspector.preferencesWindow.closed) {

    instantApply = ainspector.prefs.getBoolPref("browser.preferences.instantApply");
    features = "chrome,titlebar,toolbar,centerscreen" + (instantApply ? ",dialog=no" : ",modal");

    ainspector.preferencesWindow =
      window.openDialog('chrome://ai-sidebar/content/preferences/options.xul', "ainspector-preferences", features);
  }
  ainspector.preferencesWindow.focus();
};

/**
 * @function onLoad
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Initialize sidebar components and view each time it is displayed.
 */

ainspectorSidebar.onLoad = function () {
  // initialize
  ainspectorSidebar.init();

  // clear pending delayed evaluation
  ainspectorSidebar.clearPendingEvaluation();

  // update context
  ainspectorSidebar.updateContext();
};

/**
 * @function onUnload
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Remove listeners when sidebar is closed.
 */

ainspectorSidebar.onUnload = function () {
  // remove highlighting
  ainspectorSidebar.highlightModule.removeHighlight(window.content.document);

  // close Page Inspector
  ainspectorSidebar.closePageInspector();

  // clear pending delayed evaluation
  ainspectorSidebar.clearPendingEvaluation();

  // unregister progressListener
  parent.gBrowser.removeProgressListener(ainspectorSidebar.progressListener);

  // unregister evaluationPrefListener
  ainspectorSidebar.evaluationPrefListener.unregister();

  // unregister with current tab
  parent.gBrowser.selectedTab.removeAttribute(ainspector.tabAttrName);

  // unregister callback for tab selection
  parent.AINSPECTOR.updateContext = null;
};

window.addEventListener("load", ainspectorSidebar.onLoad, false);
window.addEventListener("unload", ainspectorSidebar.onUnload, false);
