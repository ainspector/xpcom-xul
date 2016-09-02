/**
 * @file delay-setting.js
 *
 * @desc Because this script is attached to a dialog element, it does not have
 *       direct access to the ainspectorSidebar namespace. Hence, the namespace
 *       is passed in as a window parameter.
 */

/* global ainspectorSidebar: true */

var ainspectorSidebar = window.arguments[0] || {};

/**
 * @function rerunWithDelaySetting
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Get the delay (in seconds) and the stopPrompting (boolean) values
 *       from the dialog components; pass these to the rerunEvaluation fn.
 */

ainspectorSidebar.rerunWithDelaySetting = function () {
  var menulist = document.getElementById("ainspector-delay-setting");
  var delay = menulist.value;

  var checkbox = document.getElementById("ainspector-stop-prompting");
  var stopPrompting = checkbox.checked;

  ainspectorSidebar.rerunEvaluation(delay, stopPrompting);
};
