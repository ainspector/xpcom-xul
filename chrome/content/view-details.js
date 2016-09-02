/**
 * @file view-details.js
 *
 * @desc Define properties and methods for display of rule details information.
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

/**
 * @function setDetailsView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Top-level function for adding data/content to Rule Details view.
 */

ainspectorSidebar.setDetailsView = function () {
  var titleValue,
      titleSuffix,
      index,
      ruleResult;

  // construct and set view title
  titleValue = ainspectorSidebar.getViewTitle(parent.AINSPECTOR.previousView);
  titleSuffix = ainspectorSidebar.nlsProperties.getString('view.title.details-suffix');

  // for all views except ALL_RULES use suffix
  ainspectorSidebar.viewTitle.value =
    parent.AINSPECTOR.previousView !== ainspector.viewEnum.ALL_RULES ?
    titleValue + titleSuffix :
    titleValue;

  // get selected RuleResult object
  index = ainspectorSidebar.ruleCategoryTree.currentIndex;
  ruleResult = ainspectorSidebar.ruleResultsTable[index].ruleResult;

  // update element results
  ainspectorSidebar.updateElementResults(ruleResult);

  // fill content areas
  ainspectorSidebar.setDetailsSummaryContent(ruleResult);
  ainspectorSidebar.setDetailsRuleInfoContent(ruleResult);

  // set initial state of Inspect Element button
  ainspectorSidebar.inspectElementButton.disabled = true;

  // update highlighting
  ainspectorSidebar.updateHighlight();

  // select rule details template
  ainspectorSidebar.viewDeck.selectedIndex = ainspector.viewType.DETAILS;

  // manage focus
  document.getElementById("ainspector-rule-summary").focus();
  ainspectorSidebar.setStateDetailsTabs();
};

/**
 * @function clearDetailsView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Clear data from all of the associated widgets, containers, trees.
 */

ainspectorSidebar.clearDetailsView = function () {
  var vboxSummary,
      resultValueLabel,
      tree,
      vboxRuleInfo;
  
  // clear rule summary and result content
  vboxSummary = document.getElementById("ainspector-rule-summary");
  ainspectorSidebar.clearContent(vboxSummary);

  resultValueLabel = document.getElementById("ainspector-rule-result-value");
  resultValueLabel.hidden = true;

  // clear element results tree
  tree = ainspectorSidebar.elementResultsTree;
  tree.view = new ainspectorSidebar.TreeViewElements([]);

  // clear rule information content
  vboxRuleInfo = document.getElementById("ainspector-details-rule-info");
  ainspectorSidebar.clearContent(vboxRuleInfo);

  // close Page Inspector and disable Inspect Element button
  ainspectorSidebar.closePageInspector();
  ainspectorSidebar.inspectElementButton.disabled = true;
};

/**
 * @function setStateDetailsTabs
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Manage state of selected tab panel:
 *       1. Set focus to main content of panel
 *       2. Manage state of Inspect Element button
 *       3. Conditionally close Page Inspector
 */

ainspectorSidebar.setStateDetailsTabs = function () {
  var tabIndex;

  if (typeof ainspectorSidebar.detailsTabbox === "undefined") return;
  tabIndex = ainspectorSidebar.detailsTabbox.selectedIndex;

  switch (tabIndex) {
  case 0: // Element Results
    // Note: The onfocus handler of elementResultsTree (updateSelectedElement)
    // includes functionality for managing the Inspect Element button.
    ainspectorSidebar.elementResultsTree.focus();
    break;
  case 1: // Rule Info
    ainspectorSidebar.closePageInspector();
    ainspectorSidebar.inspectElementButton.disabled = true;
    document.getElementById("ainspector-details-rule-info").focus();
    break;
  }
};
