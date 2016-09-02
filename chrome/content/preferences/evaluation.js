/**
 * @file evaluation.js
 *
 * @desc Handle changes to and initializations from evaluation preferences.
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

// import PrefListener and PrefUtils objects
Components.utils.import("chrome://ai-sidebar/content/utilities/preferences.js", ainspector);

/**
 * @constructor evaluationPrefs
 *
 * @memberOf ainspector
 *
 * @desc Instantiate a helper object for the evaluation preferences branch
 *       that can get any, or reset all preferences in that branch.
 */

ainspector.evaluationPrefs = (function () {
  // private member
  var prefUtils = new ainspector.PrefUtils("extensions.ainspector.evaluation.");

  // public methods
  return {
    getPref: function (name) {
      if (name === 'ruleset')
        return prefUtils.getIntPref(name);
      if (name === 'passAndNotApplicable')
        return prefUtils.getBoolPref(name);

      ainspector.reportError("evaluationPrefs.getPref: unmatched preference: " + name);
      return undefined;
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
 * @function initFromEvaluationPrefs
 *
 * @memberOf ainspector
 *
 * @desc Perform any initializations based on evaluation preferences.
 */

ainspector.initFromEvaluationPrefs = function () {
};

/**
 * @function onEvaluationPrefChange
 *
 * @memberOf ainspector
 *
 * @desc Callback function used by PrefListener object for any changes
 *       to preferences in the evaluation branch.
 */

ainspector.onEvaluationPrefChange = function (branch, name) {
  switch (name) {
  case 'ruleset':
    break;

  case 'passAndNotApplicable':
    break;

  default:
    ainspector.reportError("onEvaluationPrefChange: unmatched preference: " + name);
    break;
  }

  // Call the notify callback if options dialog is open
  if (ainspector.notifyOptionsEvaluationPrefChange)
    ainspector.notifyOptionsEvaluationPrefChange();
};

ainspector.resetEvaluationPrefs = function () {
  ainspector.evaluationPrefs.resetAll();
};

// Instantiate and register PrefListener for preferences in evaluation branch.

ainspector.evaluationPrefListener = new ainspector.PrefListener(
  "extensions.ainspector.evaluation.", ainspector.onEvaluationPrefChange);

ainspector.evaluationPrefListener.register();
