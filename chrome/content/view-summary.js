/**
 * @file view-summary.js
 *
 * @desc Define properties and methods for display of summary information.
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

/**
 * @function showHidePassInSummaryGrid
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Show or hide the Pass (P) columns of the summary grid and summary tables
 *       based on user preference setting for evaluation results.
 */

ainspectorSidebar.showHidePassInSummaryGrid = function (value) {
  var pageSummaryHeader     = document.getElementById("ainspector-page-summary-header");
  var pageSummaryData       = document.getElementById("ainspector-page-summary-data");
  var summaryRCPassColumn   = document.getElementById("ainspector-summary-rc-pass-col");
  var summaryWCAGPassColumn = document.getElementById("ainspector-summary-wcag-pass-col");

  pageSummaryHeader.hidePass(value);
  pageSummaryData.hidePass(value);
  summaryRCPassColumn.setAttribute('hidden', value);
  summaryWCAGPassColumn.setAttribute('hidden', value);
};

/**
 * @function setSummaryView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set the view type; populate the summary grid and both summary tables
 *       with new data; set the view state.
 */

ainspectorSidebar.setSummaryView = function () {
  var hidden = ainspector.evaluationPrefs.getPref('passAndNotApplicable') ? false : true;
  var pageSummaryDataRow = document.getElementById("ainspector-page-summary-data");
  var summaryData = ainspectorSidebar.getSummaryData(ainspector.viewEnum.SUMMARY);
  var tabIndex = ainspectorSidebar.summaryTabbox.selectedIndex;
  var ariaPrefix = ainspectorSidebar.nlsProperties.getString('heading.page-summary');
  var ariaLabel = ainspectorSidebar.getSummaryGridLabel(ariaPrefix, summaryData);

  // Set the view type
  ainspectorSidebar.viewDeck.selectedIndex = ainspector.viewType.SUMMARY;

  // Show or hide pass data according to preference setting
  ainspectorSidebar.showHidePassInSummaryGrid(hidden);

  // Update the summary grid
  pageSummaryDataRow.setData(summaryData);
  pageSummaryDataRow.setAttribute("role", "region");
  pageSummaryDataRow.setAttribute("aria-label", ariaLabel);

  // Update the summary tables
  ainspectorSidebar.updateSummaryRCTree();
  ainspectorSidebar.updateSummaryWCAGTree();

  if (ainspectorSidebar.newEvaluation) {
    // Set focus to summary grid data
    ainspectorSidebar.newEvaluation = false;
    pageSummaryDataRow.focus();
  }
  else {
    // Set focus to selected Summary tree
    switch (tabIndex) {

    case 0: // Rule Categories
      ainspectorSidebar.summaryRCTree.focus();
      break;

    case 1: // WCAG Guidelines
      ainspectorSidebar.summaryWCAGTree.focus();
      break;
    }
  }

  // Select last category or guideline row; set Details button tooltiptext
  ainspectorSidebar.setStateSummaryView();
};

/**
 * @function clearSummaryView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Clear data in summary grid and both summary tables (called during page load)
 */

ainspectorSidebar.clearSummaryView = function () {
  var pageSummaryData = document.getElementById("ainspector-page-summary-data");
  pageSummaryData.setData(ainspector.nullData);

  ainspectorSidebar.clearSummaryRCTree();
  ainspectorSidebar.clearSummaryWCAGTree();
};

/**
 * @function selectViewFromSummaryTable
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle click of Summary view Details button.
 */

ainspectorSidebar.selectViewFromSummaryTable = function () {
  var tabIndex = ainspectorSidebar.summaryTabbox.selectedIndex;

  switch (tabIndex) {

  case 0: // Rule Categories
    ainspectorSidebar.selectViewFromSummaryRCTree();
    break;

  case 1: // WCAG Guidelines
    ainspectorSidebar.selectViewFromSummaryWCAGTree();
    break;
  }
};

/**
 * @function setStateSummaryView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Based on which tab is selected:
 *       1. Select the row in the summary table that corresponds to last view.
 *       2. Set the tooltiptext of the Details button.
 *       Note: This function gets called very early in the sidebar loading
 *       sequence, necessitating the test for nls variable being undefined.
 */

ainspectorSidebar.setStateSummaryView = function () {
  if (typeof ainspectorSidebar.nlsProperties === "undefined") return;
  var nls = ainspectorSidebar.nlsProperties;

  var button = document.getElementById("ainspector-summary-details-button");
  var tabIndex = ainspectorSidebar.summaryTabbox.selectedIndex;
  var lastCategory  = parent.AINSPECTOR.lastCategory;
  var lastGuideline = parent.AINSPECTOR.lastGuideline;
  var categoryOffset  = ainspector.viewEnum.LANDMARKS;
  var guidelineOffset = ainspector.viewEnum.WCAG_1_1;
  var selectLastView = ainspector.advancedPrefs.getPref("selectLastView");
  var tooltiptext = null;

  switch (tabIndex) {

  case 0: // Rule Categories
    if (selectLastView && lastCategory > 0)
      ainspectorSidebar.summaryRCTree.view.selection.select(lastCategory - categoryOffset);
    tooltiptext = nls.getString("button.tooltip.categoryDetails");
    ainspectorSidebar.setStateSummaryRCTree();
    break;

  case 1: // WCAG Guidelines
    if (selectLastView && lastGuideline > 0)
      ainspectorSidebar.summaryWCAGTree.view.selection.select(lastGuideline - guidelineOffset);
    tooltiptext = nls.getString("button.tooltip.guidelineDetails");
    ainspectorSidebar.setStateSummaryWCAGTree();
    break;
  }

  if (tooltiptext) button.setAttribute("tooltiptext", tooltiptext);
};

/**
 * @function getSummaryColSuffixes
 *
 * @memberOf ainspectorSidebar
 *
 * @desc
 */

ainspectorSidebar.getSummaryColSuffixes = function () {
  var nls = ainspectorSidebar.nlsProperties;
  return {
    VIOLATION:    nls.getString("rulegroup.results.suffix.violation"),
    WARNING:      nls.getString("rulegroup.results.suffix.warning"),
    MANUAL_CHECK: nls.getString("rulegroup.results.suffix.manual-check"),
    PASS:         nls.getString("rulegroup.results.suffix.pass"),
  };
};
