/**
 * @file general.js
 *
 * @desc Handle changes to and initializations from general preferences.
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

// import PrefListener and PrefUtils objects
Components.utils.import("chrome://ai-sidebar/content/utilities/preferences.js", ainspector);

/**
 * @constructor generalPrefs
 *
 * @memberOf ainspector
 *
 * @desc Instantiate a helper object for the general preferences branch
 *       that can get any, or reset all preferences in that branch.
 */

ainspector.generalPrefs = (function () {
  // private member
  var prefUtils = new ainspector.PrefUtils("extensions.ainspector.general.");

  // public methods
  return {
    getPref: function (name) {
      if (name === 'wcagMenuitems')
        return prefUtils.getBoolPref(name);
      if (name === 'promptForDelay')
        return prefUtils.getBoolPref(name);
      if (name === 'screenReaderMode')
        return prefUtils.getBoolPref(name);

      ainspector.reportError("generalPrefs.getPref: unmatched preference: " + name);
      return undefined;
    },

    setPref: function (name, value) {
      if (name === 'promptForDelay')
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
 * @function initFromGeneralPrefs
 *
 * @memberOf ainspector
 *
 * @desc Perform any initializations based on general preferences.
 */

ainspector.initFromGeneralPrefs = function () {
};

/**
 * @function onGeneralPrefChange
 *
 * @memberOf ainspector
 *
 * @desc Callback function used by PrefListener object for any changes
 *       to preferences in the general branch.
 */

ainspector.onGeneralPrefChange = function (branch, name) {
  var key = null;

  switch (name) {
  case 'wcagMenuitems':
    break;

  case 'promptForDelay':
    break;

  case 'screenReaderMode':
    break;

  default:
    ainspector.reportError("onGeneralPrefChange: unmatched preference: " + name);
    break;
  }

  // Call the notify callback if options dialog is open
  if (ainspector.notifyOptionsGeneralPrefChange)
    ainspector.notifyOptionsGeneralPrefChange();
};

ainspector.resetGeneralPrefs = function () {
  ainspector.generalPrefs.resetAll();
};

// Instantiate and register PrefListener for preferences in general branch.

ainspector.generalPrefListener = new ainspector.PrefListener(
  "extensions.ainspector.general.", ainspector.onGeneralPrefChange);

ainspector.generalPrefListener.register();
