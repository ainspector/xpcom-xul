/**
 * @file view-category.js
 *
 * @desc Define properties and methods for display of rule category information.
 *
 * @external OpenAjax.a11y
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

// Load the TreeView definition
Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/tree-view.js", ainspectorSidebar);

// Load the sortTree function
Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/tree-sort.js", ainspectorSidebar);

// Load the getTreeEventHandler function
Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/tree-event.js", ainspectorSidebar);

// Load the DOM functions
Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/utilities/dom.js", ainspectorSidebar);

/**
 * @object ruleResultConst
 *
 * @desc Store constants for Rule Results table sorting.
 */

ainspectorSidebar.ruleResultConst = {
  DEFAULT_ORDER:  "descending",
  DEFAULT_COLUMN: "ainspector-result-col",
  SORT_COL_2:     "ainspector-result-col",
  SORT_COL_3:     "ainspector-rule-col"
};

/**
 * @function sortRuleResults
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Sort the Rule Results table based on specified properties.
 */

ainspectorSidebar.sortRuleResults = function (column) {
  var props = {
    tree: document.getElementById("ainspector-rule-category-tree"),
    table: ainspectorSidebar.ruleResultsTable,
    viewConstructor: ainspectorSidebar.TreeViewCategory,
    defaultOrder:    ainspectorSidebar.ruleResultConst.DEFAULT_ORDER,
    defaultColumn:   ainspectorSidebar.ruleResultConst.DEFAULT_COLUMN,
    sortColumns: [
      { sortColumn: ainspectorSidebar.ruleResultConst.SORT_COL_2, multiplier: 1 },
      { sortColumn: ainspectorSidebar.ruleResultConst.SORT_COL_3, multiplier: -1 }
    ],
    defaultSortButton: document.getElementById("ainspector-rc-default-sort"),
    updateCallback: ainspectorSidebar.updateSelectedRuleInfo,
    loggerCallback: null
  };

  ainspectorSidebar.sortTree(props, column);
};

/**
 * @function defaultSortRuleResults
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set default sort values for Rule Results tree and call its sort function.
 */

ainspectorSidebar.defaultSortRuleResults = function () {
  var tree = document.getElementById("ainspector-rule-category-tree");
  tree.setAttribute("sortDirection", ainspectorSidebar.ruleResultConst.DEFAULT_ORDER);
  tree.setAttribute("sortResource", ainspectorSidebar.ruleResultConst.DEFAULT_COLUMN);
  ainspectorSidebar.sortRuleResults();
};

/**
 * @function logRuleResultsTable
 *
 * @memberOf ainspectorSidebar
 *
 * @desc
 */

ainspectorSidebar.logRuleResultsTable = function (table) {
  var numRows, viewName, row, i;

  if (!ainspector.log.enabled) return;

  numRows = table.length;
  viewName = ainspector.getViewName(parent.AINSPECTOR.currentView);

  ainspector.log.info("------------------------------------------------");
  ainspector.log.info(viewName + ": " + numRows + " rules");
  for (i = 0; i < numRows; i++) {
    row = table[i];
    ainspector.log.info(row["ainspector-rule-col"]);
  }
};

/**
 * @function getRuleResultStrings
 *
 * @memberOf ainspectorSidebar
 *
 * @desc
 */

ainspectorSidebar.getRuleResultStrings = function () {
  var nls = ainspectorSidebar.nlsProperties;

  if (ainspectorSidebar.ruleResultStrings === null) {
    ainspectorSidebar.ruleResultStrings = {
      V:                 nls.getString("rule.result.violation"),
      W:                 nls.getString("rule.result.warning"),
      MC:                nls.getString("rule.result.manual-check"),
      P:                 nls.getString("rule.result.pass"),
      NA:                nls.getString("rule.result.not-applicable"),

      VIOLATION:         nls.getString("rule.result.spoken.violation"),
      WARNING:           nls.getString("rule.result.spoken.warning"),
      MANUAL_CHECK:      nls.getString("rule.result.spoken.manual-check"),
      PASS:              nls.getString("rule.result.spoken.pass"),
      NOT_APPLICABLE:    nls.getString("rule.result.spoken.not-applicable"),

      LEVEL_A:           nls.getString("rule.level.a"),
      LEVEL_AA:          nls.getString("rule.level.aa"),
      LEVEL_AAA:         nls.getString("rule.level.aaa"),

      LEVEL_SPOKEN_A:    nls.getString("rule.level.spoken.a"),
      LEVEL_SPOKEN_AA:   nls.getString("rule.level.spoken.aa"),
      LEVEL_SPOKEN_AAA:  nls.getString("rule.level.spoken.aaa"),

      REQUIRED_Y:        nls.getString("rule.required.yes"),
      REQUIRED_N:        nls.getString("rule.required.no"),

      REQUIRED_SPOKEN_Y: nls.getString("rule.required.spoken.yes"),
      REQUIRED_SPOKEN_N: nls.getString("rule.required.spoken.no"),

      PREFIX_RESULT:     nls.getString("rule.result.prefix"),
      PREFIX_SC:         nls.getString("rule.sc.prefix"),
      PREFIX_LEVEL:      nls.getString("rule.level.prefix"),
      PREFIX_REQUIRED:   nls.getString("rule.required.prefix")
    };
  }
  return ainspectorSidebar.ruleResultStrings;
};

/**
 * @function getRuleResultsTable
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Build data table (array of objects) containing rule result info
 *       corresponding to the currently selected view.
 *
 * @external OpenAjax.a11y.RuleGroupResult
 * @external OpenAjax.a11y.RuleResult array :: ruleResultsArray
 * @external OpenAjax.a11y.RuleResult :: ruleResult
 * @external OpenAjax.a11y.Rule :: rule
 *
 * @global ainspectorSidebar.ruleGroupResults
 */

ainspectorSidebar.getRuleResultsTable = function () {
  var hidePNA = ainspector.evaluationPrefs.getPref('passAndNotApplicable') ? false : true,
      RRV = OpenAjax.a11y.RULE_RESULT_VALUE,
      table = [],
      ruleResultsArray, resultsCount,
      ruleResult, resultValue,
      rule, noResults;

  // get rule results for current view
  ruleResultsArray = ainspectorSidebar.ruleGroupResults[parent.AINSPECTOR.currentView].getRuleResultsArray();
  resultsCount = ruleResultsArray.length;

  for (let i = 0; i < resultsCount; i++) {
    ruleResult = ruleResultsArray[i];
    resultValue = ruleResult.getResultValue();

    // Skip this result if hidePNA preference is set and resultValue meets the criteria
    if (hidePNA && (resultValue === RRV.PASS || resultValue === RRV.NOT_APPLICABLE)) continue;

    rule = ruleResult.getRule();
    table.push({
      "ainspector-rule-col":     ruleResult.getRuleSummary(),
      "ainspector-result-col":   resultValue,
      "ainspector-wcag-sc-col":  rule.getPrimarySuccessCriterion().id,
      "ainspector-level-col":    ruleResult.getWCAG20Level(),
      "ainspector-required-col": ruleResult.isRuleRequired() ? 1 : 0,
      ruleResult:                ruleResult
    });
  }

  if (table.length === 0) {
    noResults = ainspectorSidebar.nlsProperties.getString("category.no-results");
    table.push({ "ainspector-rule-col": noResults });
  }

  return table;
};

/**
 * @constructor TreeViewCategory
 *
 * @memberOf ainspectorSidebar
 *
 * @augments TreeView (using prototype-based inheritance via the inherits fn.)
 *
 * @desc Define methods getCellText and getCellProperties. Inherit all other
 *       methods and properties from the TreeView object.
 *
 * @param table - Array of table row data objects
 *
 * @external OpenAjax.a11y.RULE_RESULT_VALUE
 */

ainspectorSidebar.TreeViewCategory = function (table) {
  var resultStrings,
      atomService,
      screenReaderMode,
      noResults;

  // call the parent constructor
  ainspectorSidebar.TreeView.call(this, table);

  resultStrings = ainspectorSidebar.getRuleResultStrings();

  // used by getCellProperties (but obsolete starting with Firefox 22)
  atomService = Components.classes["@mozilla.org/atom-service;1"].
                getService(Components.interfaces.nsIAtomService);

  screenReaderMode = ainspector.generalPrefs.getPref('screenReaderMode');
  noResults = ainspectorSidebar.nlsProperties.getString("category.no-results");

  // define methods specific to this particular tree view
  this.getCellText = function (row, col) {
    var value = table[row][col.id],
        prefix = '',
        text = ''
    ;

    // handle no results case: table will only have data in first column
    if (value === undefined) return '';

    switch (col.id) {
    case "ainspector-result-col":
      if (screenReaderMode)
        prefix = resultStrings.PREFIX_RESULT;

      switch (value) {
      case OpenAjax.a11y.RULE_RESULT_VALUE.VIOLATION:
        text = screenReaderMode ? resultStrings.VIOLATION : resultStrings.V;
        break;
      case OpenAjax.a11y.RULE_RESULT_VALUE.WARNING:
        text = screenReaderMode ? resultStrings.WARNING : resultStrings.W;
        break;
      case OpenAjax.a11y.RULE_RESULT_VALUE.MANUAL_CHECK:
        text = screenReaderMode ? resultStrings.MANUAL_CHECK : resultStrings.MC;
        break;
      case OpenAjax.a11y.RULE_RESULT_VALUE.PASS:
        text = screenReaderMode ? resultStrings.PASS : resultStrings.P;
        break;
      case OpenAjax.a11y.RULE_RESULT_VALUE.NOT_APPLICABLE:
        text = screenReaderMode ? resultStrings.NOT_APPLICABLE : resultStrings.NA;
        break;
      }
      break;

    case "ainspector-wcag-sc-col":
      if (screenReaderMode)
        prefix = resultStrings.PREFIX_SC;

      text = value;
      break;

    case "ainspector-level-col":
      if (screenReaderMode)
        prefix = resultStrings.PREFIX_LEVEL;

      switch (value) {
      case OpenAjax.a11y.WCAG20_LEVEL.A:
        text = screenReaderMode ? resultStrings.LEVEL_SPOKEN_A : resultStrings.LEVEL_A;
        break;
      case OpenAjax.a11y.WCAG20_LEVEL.AA:
        text = screenReaderMode ? resultStrings.LEVEL_SPOKEN_AA : resultStrings.LEVEL_AA;
        break;
      case OpenAjax.a11y.WCAG20_LEVEL.AAA:
        text = screenReaderMode ? resultStrings.LEVEL_SPOKEN_AAA : resultStrings.LEVEL_AAA;
        break;
      }
      break;

    case "ainspector-required-col":
      if (screenReaderMode)
        prefix = resultStrings.PREFIX_REQUIRED;

      switch (value) {
      case 0:
        text = screenReaderMode ? resultStrings.REQUIRED_SPOKEN_N : resultStrings.REQUIRED_N;
        break;
      case 1:
        text = screenReaderMode ? resultStrings.REQUIRED_SPOKEN_Y : resultStrings.REQUIRED_Y;
        break;
      }
      break;

    default:
      text = value;
      break;
    }

    if (screenReaderMode) {
      switch (col.id) {
      case "ainspector-rule-col":
        if (text !== noResults) text += ': ';
        break;
      case "ainspector-result-col":
      case "ainspector-wcag-sc-col":
      case "ainspector-level-col":
      case "ainspector-required-col":
        text += ', ';
        break;
      default:
        break;
      }
    }

    return prefix + text;
  };

  this.getCellProperties = function (row, col, props) {
    switch (col.id) {
    case "ainspector-result-col":
    case "ainspector-level-col":
    case "ainspector-required-col":
    case "ainspector-wcag-sc-col":
      if (props)
        props.AppendElement(atomService.getAtom("inner"));
      else
        return "inner";
      break;
    }

    return '';
  };
};

// Finalize the definition of TreeViewCategory by inheriting the TreeView methods.
ainspector.utils.inherits(ainspectorSidebar.TreeViewCategory, ainspectorSidebar.TreeView);

/**
 * @function setCategoryView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Update the category view summary grid and rule results
 *       and then call the updateSelectedRuleInfo function.
 */

ainspectorSidebar.setCategoryView = function () {
  var currentView = parent.AINSPECTOR.currentView,
      view = ainspector.viewEnum,
      summaryGridHeader,
      summaryGridData,
      summaryData,
      ariaPrefix,
      ariaLabel,
      hidden;

  // save view indices
  if (currentView > view.SUMMARY && currentView < view.WCAG_1_1)
    parent.AINSPECTOR.lastCategory = currentView;
  if (currentView > view.ALL_RULES)
    parent.AINSPECTOR.lastGuideline = currentView;

  // initialize data and state variables
  summaryGridHeader = ainspectorSidebar.categorySummaryHeader;
  summaryGridData = ainspectorSidebar.categorySummaryData;
  summaryData = ainspectorSidebar.getSummaryData(currentView);

  ariaPrefix = ainspectorSidebar.viewTitle.value + ' ' +
    ainspectorSidebar.nlsProperties.getString('heading.summary');
  ariaLabel = ainspectorSidebar.getSummaryGridLabel(ariaPrefix, summaryData);
  hidden = ainspector.evaluationPrefs.getPref('passAndNotApplicable') ? false : true;

  // update summary grid
  summaryGridHeader.hidePass(hidden);

  summaryGridData.setData(summaryData);
  summaryGridData.hidePass(hidden);
  summaryGridData.setAttribute("role", "region");
  summaryGridData.setAttribute("aria-label", ariaLabel);

  // update rule results
  ainspectorSidebar.ruleResultsTable = ainspectorSidebar.getRuleResultsTable();
  ainspectorSidebar.sortRuleResults();

  // select rule category template
  ainspectorSidebar.viewDeck.selectedIndex = ainspector.viewType.CATEGORY;

  if (ainspectorSidebar.newEvaluation) {
    // set focus to summary grid data
    ainspectorSidebar.newEvaluation = false;
    summaryGridData.focus();
  }
  else {
    // set focus to rule category tree to alleviate XUL focus peculiarities
    ainspectorSidebar.ruleCategoryTree.focus();
  }
};

/**
 * @function clearCategoryView
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Clear all rows of the Rule Results table and then
 *       call the updateSelectedRuleInfo function.
 */

ainspectorSidebar.clearCategoryView = function () {
  var summaryData = ainspectorSidebar.categorySummaryData,
      tree = ainspectorSidebar.ruleCategoryTree;

  // clear summary grid
  summaryData.setData(ainspector.nullData);

  // clear rule results tree
  tree.view = new ainspectorSidebar.TreeViewCategory([]);

  // clear selected rule textbox
  ainspectorSidebar.updateSelectedRuleInfo(tree);
};

/**
 * @function updateSelectedRuleInfo
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle tree selection by determining whether a valid row has
 *       been selected. If the selected row is the singleton that only
 *       contains a no results message, clear the selection and return.
 *       This blocks further drill-down navigation. Otherwise, set the
 *       rule details button state and populate the Selected Rule vbox
 *       div with either a no selection message, or the data associated
 *       with the selected rule.
 */

ainspectorSidebar.updateSelectedRuleInfo = function (tree) {
  var index         = tree.currentIndex,
      isRowSelected = tree.view.selection.isSelected(index),
      button        = document.getElementById("ainspector-rule-details-button"),
      nls           = ainspectorSidebar.nlsProperties,
      getHTML       = ainspectorSidebar.createXHTMLElement,
      addHTML       = ainspectorSidebar.appendXHTMLElement,
      h2FirstStyle  = ainspector.html.h2FirstStyle,
      h2Style       = ainspector.html.h2Style,
      pFirstStyle   = ainspector.html.pFirstStyle,
      pStyle        = ainspector.html.pStyle,
      vbox          = ainspectorSidebar.selectedRule,
      div, h2, p, posStyle,
      ruleResult, actionLabel, actionMessages;

  // handle case where table has no results
  if (isRowSelected && (typeof ainspectorSidebar.ruleResultsTable[index].ruleResult === "undefined")) {
    tree.view.selection.clearSelection();
    return;
  }

  // set state of Rule Details button
  button.disabled = !isRowSelected;
  button.image = isRowSelected ?
    "chrome://ai-sidebar/skin/fwd-button.png" :
    "chrome://ai-sidebar/skin/fwd-button-off.png";

  // reinitialize vbox
  ainspectorSidebar.clearContent(vbox);

  // create container div element with id
  div = getHTML("div", null, { "id": "ainspector-div-selected-rule" });
  addHTML(vbox, div);

  // set ARIA attributes
  vbox.setAttribute("role", "region");
  vbox.setAttribute("aria-labelledby", "ainspector-label-selected-rule ainspector-div-selected-rule");

  // add content to vbox div
  if (isRowSelected) {
    ruleResult = ainspectorSidebar.ruleResultsTable[index].ruleResult;

    // Definition
    h2 = getHTML("h2", nls.getString('info.definition'), h2FirstStyle);
    addHTML(div, h2);

    p = getHTML("p", ruleResult.getRuleDefinition(), pFirstStyle);
    addHTML(div, p, 2);

    // Action
    actionMessages = ruleResult.getResultMessagesArray();
    actionLabel = actionMessages.length > 1 ?
      nls.getString('info.actions') :
      nls.getString('info.action');

    h2 = getHTML("h2", actionLabel, h2Style);
    addHTML(div, h2);

    for (let i = 0; i < actionMessages.length; i++) {
      posStyle = (i === 0) ? pFirstStyle : pStyle;
      p = getHTML("p", actionMessages[i] + "\n", posStyle);
      addHTML(div, p);
    }
  }
  else {
    p = getHTML("p", nls.getString('info.noSelection'), pFirstStyle);
    addHTML(div, p);
  }
};

/**
 * @function handleRCTreeEvent
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle dblclick and keypress events when row is selected. If user
 *       double-clicks a row, or presses return, enter or spacebar when a
 *       row is selected, go to Rule Details view.
 */

ainspectorSidebar.handleRCTreeEvent = ainspectorSidebar.getTreeEventHandler(
  function () { ainspectorSidebar.selectView(ainspector.viewConst.DETAILS); });
