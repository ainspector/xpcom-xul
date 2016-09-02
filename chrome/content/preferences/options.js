/**
 * options.js
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

/**
 * @namespace ainspector.options
 */
ainspector.options = {};

/**
 * @function setStatePrefpaneGeneral
 *
 * @memberOf ainspector.options
 *
 * @desc Dynamically set the state of the Restore Defaults button.
 */

ainspector.options.setStatePrefpaneGeneral = function () {
  var hasUserValues = ainspector.generalPrefs.hasUserValues();
  var button = document.getElementById('ainspector-button-restore-general');
  if (button) button.disabled = !hasUserValues;
};

/**
 * @function setStatePrefpaneEvaluation
 *
 * @memberOf ainspector.options
 *
 * @desc Dynamically set the state of the Restore Defaults button.
 */

ainspector.options.setStatePrefpaneEvaluation = function () {
  var hasUserValues = ainspector.evaluationPrefs.hasUserValues();
  var button = document.getElementById('ainspector-button-restore-evaluation');
  if (button) button.disabled = !hasUserValues;
};

/**
 * @function initPrefpaneGeneral
 *
 * @memberOf ainspector.options
 *
 * @desc Set labels in General Preferences pane depending on platform.
 */

ainspector.options.initPrefpaneGeneral = function () {
  // Set state of "Restore Defaults" button
  ainspector.options.setStatePrefpaneGeneral();
};

/**
 * @function initPrefpaneEvaluation
 *
 * @memberOf ainspector.options
 *
 * @desc Set state in Evaluation Preferences pane.
 */

ainspector.options.initPrefpaneEvaluation = function () {

  // Set ruleset label values
  document.getElementById("ainspector-ruleset-strict").label = ainspector.ariaStrictInfo.title;
  document.getElementById("ainspector-ruleset-trans").label = ainspector.ariaTransInfo.title;

  // Set state of "Restore Defaults" button
  ainspector.options.setStatePrefpaneEvaluation();
};

/**
 * @function resetGeneralPrefs
 *
 * @memberOf ainspector.options
 *
 * @desc Reset all preferences in the general branch to their default values.
 */

ainspector.options.resetGeneralPrefs = function () {
  var nls = document.getElementById('ainspector-options-properties');
  var title = nls.getString("pref.confirm.resetGeneral.title");
  var message = nls.getString("pref.confirm.reset.message");

  var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

  if (promptService.confirm(window, title, message)) {
    ainspector.resetGeneralPrefs();
  }
};

/**
 * @function resetEvaluationPrefs
 *
 * @memberOf ainspector.options
 *
 * @desc Reset all preferences in the evaluation branch to their default values.
 */

ainspector.options.resetEvaluationPrefs = function () {
  var nls = document.getElementById('ainspector-options-properties');
  var title = nls.getString("pref.confirm.resetEvaluation.title");
  var message = nls.getString("pref.confirm.reset.message");

  var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

  if (promptService.confirm(window, title, message)) {
    ainspector.resetEvaluationPrefs();
  }
};

/**
 * @function onLoad
 *
 * @memberOf ainspector.options
 *
 * @desc Automatically called when Preferences window has loaded.
 */

ainspector.options.onLoad = function () {

  // Set shared namespace variable to local callback for responding
  // to changes in this dialog.
  ainspector.notifyOptionsGeneralPrefChange    = ainspector.options.setStatePrefpaneGeneral;
  ainspector.notifyOptionsEvaluationPrefChange = ainspector.options.setStatePrefpaneEvaluation;

  // Set shared namespace variable to reference this dialog window
  // to prevent duplicate dialogs from being opened.
  ainspector.preferencesWindow = window.self;
};

/**
 * @function onUnload
 *
 * @memberOf ainspector.options
 *
 * @desc Automatically called when Preferences window is closed.
 */

ainspector.options.onUnload = function () {

  // Set shared namespace callback variable to null when dialog is not open.
  ainspector.notifyOptionsGeneralPrefChange    = null;
  ainspector.notifyOptionsEvaluationPrefChange = null;
};

window.addEventListener("load", ainspector.options.onLoad, false);
window.addEventListener("unload", ainspector.options.onUnload, false);
