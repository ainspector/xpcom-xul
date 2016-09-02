/**
 * @file ai-context.js
 *
 * @desc Define methods for display of contextual information: location URL
 *       of the current page or a progress meter during page loading.
 */

/**
 * @function getRulesetName
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Return name of currently selected ruleset based on preferences setting.
 */

ainspectorSidebar.getRulesetName = function () {
  var prefValue  = ainspector.evaluationPrefs.getPref('ruleset');

  switch (prefValue) {
  case 1: // ARIA_TRANS
    return ainspector.ariaTransInfo.title;
  case 2: // ARIA_STRICT
    return ainspector.ariaStrictInfo.title;
  default:
    ainspector.reportError("Invalid ruleset preference value: " + prefValue);
    break;
  }
  return '';
};

ainspectorSidebar.showOptions = function () {
  var nls = ainspectorSidebar.nlsProperties;
  var evaluationResult = ainspectorSidebar.evaluationResult;
  var numRules = evaluationResult.getRuleset().getRulesetInfo().num_rules_total;
  var suffix = ': ' + numRules + nls.getString('ruleset.suffix');

  // set the Ruleset value
  document.getElementById('ainspector-option-ruleset').value =
    ainspectorSidebar.getRulesetName() + suffix;
};

ainspectorSidebar.showLocation = function () {
  ainspectorSidebar.locationLabel.value = ainspectorSidebar.locationHref;
  ainspectorSidebar.progressMeter.hidden = true;
  ainspectorSidebar.locationInfo.hidden = false;
};

ainspectorSidebar.showProgressMeter = function () {
  ainspectorSidebar.progressMeter.hidden = false;
  ainspectorSidebar.locationInfo.hidden = true;
};
