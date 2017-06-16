/**
 * @file element-results.js
 *
 * @desc Used by view-details.js for populating Element Results panel.
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

/**
 * @object elementResultConst
 *
 * @desc Store constants for Rule Results table sorting.
 */

ainspectorSidebar.elementResultConst = {
  DEFAULT_ORDER:  "descending",
  DEFAULT_COLUMN: "ainspector-elem-result-col",
  SORT_COL_2:     "ainspector-elem-result-col",
  SORT_COL_3:     "ainspector-order-col"
};

/**
 * @function sortElementResults
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Sort the Element Results table based on specified properties.
 */

ainspectorSidebar.sortElementResults = function (column) {
  var props = {
    tree: document.getElementById("ainspector-element-results-tree"),
    table:             ainspectorSidebar.elementResultsTable,
    viewConstructor:   ainspectorSidebar.TreeViewElements,
    defaultOrder:      ainspectorSidebar.elementResultConst.DEFAULT_ORDER,
    defaultColumn:     ainspectorSidebar.elementResultConst.DEFAULT_COLUMN,
    sortColumns: [
      { sortColumn: ainspectorSidebar.elementResultConst.SORT_COL_2, multiplier:  1 },
      { sortColumn: ainspectorSidebar.elementResultConst.SORT_COL_3, multiplier: -1 }
    ],
    defaultSortButton: null,
    updateCallback:    ainspectorSidebar.updateSelectedElement,
    loggerCallback:    null
  };

  ainspectorSidebar.sortTree(props, column);
};

/**
 * @function defaultSortElementResults
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set default sort values for Rule Results tree and call its sort function.
 */

ainspectorSidebar.defaultSortElementResults = function () {
  var tree = document.getElementById("ainspector-element-results-tree");
  tree.setAttribute("sortDirection", ainspectorSidebar.elementResultConst.DEFAULT_ORDER);
  tree.setAttribute("sortResource", ainspectorSidebar.elementResultConst.DEFAULT_COLUMN);
  ainspectorSidebar.sortElementResults();
};

/**
 * @function getElementResultStrings
 *
 * @memberOf ainspectorSidebar
 *
 * @desc
 */

ainspectorSidebar.getElementResultStrings = function () {
  var nls = ainspectorSidebar.nlsProperties;

  if (ainspectorSidebar.elementResultStrings === null) {
    ainspectorSidebar.elementResultStrings = {
      V:                 nls.getString("element.result.violation"),
      W:                 nls.getString("element.result.warning"),
      MC:                nls.getString("element.result.manual-check"),
      P:                 nls.getString("element.result.pass"),
      H:                 nls.getString("element.result.hidden"),

      VIOLATION:         nls.getString("element.result.spoken.violation"),
      WARNING:           nls.getString("element.result.spoken.warning"),
      MANUAL_CHECK:      nls.getString("element.result.spoken.manual-check"),
      PASS:              nls.getString("element.result.spoken.pass"),
      HIDDEN:            nls.getString("element.result.spoken.hidden"),

      PREFIX_RESULT:     nls.getString("element.result.prefix"),
      PREFIX_POSITION:   nls.getString("element.position.prefix"),
      PREFIX_ACTION:     nls.getString("element.action.prefix")
    };
  }
  return ainspectorSidebar.elementResultStrings;
};

/**
 * @function getElementResultsTable
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Build data table (array of objects) containing element results
 *       corresponding to the currently selected rule result.
 *
 * @external OpenAjax.a11y.RuleResult :: ruleResult
 * @external OpenAjax.a11y.ElementResult array :: elementResultsArray
 * @external OpenAjax.a11y.ElementResult :: elementResult
 */

ainspectorSidebar.getElementResultsTable = function (ruleResult) {
  var elementResultsArray = ruleResult.getElementResultsArray(),
      resultsCount = elementResultsArray.length,
      elementResult, table = [], noResults;

  for (let i = 0; i < resultsCount; i++) {
    elementResult = elementResultsArray[i];
    table.push({
      "ainspector-element-col":      elementResult.getElementIdentifier(),
      "ainspector-order-col":        elementResult.getOrdinalPosition(),
      "ainspector-elem-result-col":  elementResult.getResultValue(),
      "ainspector-action-col":       elementResult.getResultMessage(),
      elementResult:                 elementResult
    });
  }

  if (resultsCount === 0) {
    noResults = ainspectorSidebar.nlsProperties.getString("element.no-results");
    table.push({ "ainspector-element-col": noResults });
  }

  return table;
};

/**
 * @constructor TreeViewElements
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
 * @external OpenAjax.a11y.ELEMENT_RESULT_VALUE
 */

ainspectorSidebar.TreeViewElements = function (table) {
  var resultStrings,
      atomService,
      screenReaderMode,
      noResults;

  // call the parent constructor
  ainspectorSidebar.TreeView.call(this, table);

  resultStrings = ainspectorSidebar.getElementResultStrings();

  // Used by getCellProperties (but obsolete starting with Firefox 22)
  atomService = Components.classes["@mozilla.org/atom-service;1"].
                  getService(Components.interfaces.nsIAtomService);

  screenReaderMode = ainspector.generalPrefs.getPref('screenReaderMode');
  noResults = ainspectorSidebar.nlsProperties.getString("element.no-results");

  // define methods specific to this particular tree view
  this.getCellText = function (row, col) {
    var value = table[row][col.id],
        prefix = '',
        text = '';

    // handle no results case: table will only have data in first column
    if (value === undefined) return '';

    switch (col.id) {
    case "ainspector-elem-result-col":
      if (screenReaderMode) prefix = resultStrings.PREFIX_RESULT;

      switch (value) {
      case OpenAjax.a11y.ELEMENT_RESULT_VALUE.VIOLATION:
        text = screenReaderMode ? resultStrings.VIOLATION : resultStrings.V;
        break;
      case OpenAjax.a11y.ELEMENT_RESULT_VALUE.WARNING:
        text = screenReaderMode ? resultStrings.WARNING : resultStrings.W;
        break;
      case OpenAjax.a11y.ELEMENT_RESULT_VALUE.MANUAL_CHECK:
        text = screenReaderMode ? resultStrings.MANUAL_CHECK : resultStrings.MC;
        break;
      case OpenAjax.a11y.ELEMENT_RESULT_VALUE.PASS:
        text = screenReaderMode ? resultStrings.PASS : resultStrings.P;
        break;
      case OpenAjax.a11y.ELEMENT_RESULT_VALUE.HIDDEN:
        text = screenReaderMode ? resultStrings.HIDDEN : resultStrings.H;
        break;
      }
      break;

    case "ainspector-order-col":
      if (screenReaderMode) prefix = resultStrings.PREFIX_POSITION;
      text = value;
      break;

    case "ainspector-action-col":
      if (screenReaderMode) prefix = resultStrings.PREFIX_ACTION;
      text = value;
      break;

    default:
      text = value;
      break;
    }

    if (screenReaderMode) {
      switch (col.id) {
      case "ainspector-element-col":
        if (text !== noResults) text += ': ';
        break;

      case "ainspector-order-col":
      case "ainspector-elem-result-col":
      case "ainspector-action-col":
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
    case "ainspector-elem-result-col":
    case "ainspector-action-col":
      if (props)
        props.AppendElement(atomService.getAtom("inner"));
      else
        return "inner";
      break;
    case "ainspector-order-col":
      if (props)
        props.AppendElement(atomService.getAtom("numeric"));
      else
        return "numeric";
      break;
    }
    return '';
  };
};

// Finalize the definition of TreeViewElements by inheriting the TreeView methods.
ainspector.utils.inherits(ainspectorSidebar.TreeViewElements, ainspectorSidebar.TreeView);

/**
 * @function updateElementResults
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Create elementResultsTable from specified ruleResult and then call
 *       the corresponding sort routine, which updates the tree view.
 *
 * @external OpenAjax.a11y.RuleResult :: ruleResult
 *
 * @global ainspectorSidebar.elementResultsTable
 */

ainspectorSidebar.updateElementResults = function (ruleResult) {
  ainspectorSidebar.elementResultsTable = ainspectorSidebar.getElementResultsTable(ruleResult);
  ainspectorSidebar.sortElementResults();
};

/**
 * @function inspectNode
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Invoke the Page Inspector on the specified DOM node.
 */

ainspectorSidebar.inspectNode = function (node) {
  let devtools  = ainspectorSidebar.devtools,
      gDevTools = ainspectorSidebar.gDevTools,
      loader    = ainspectorSidebar.loader,
      gBrowser  = parent.gBrowser,
      target    = devtools.TargetFactory.forTab(gBrowser.selectedTab);

  /*
  gDevTools.showToolbox(target, "inspector").then(function (toolbox) {
    let inspector = toolbox.getCurrentPanel();
    inspector.selection.setNode(node, "browser-context-menu");
  });
  */

  // Code from https://reviewboard.mozilla.org/r/92740/diff/3#index_header
  loader.lazyRequireGetter(ainspectorSidebar, "findCssSelector", "devtools/shared/inspector/css-logic", true);
  let selector = ainspectorSidebar.findCssSelector(node);

  return gDevTools.showToolbox(target, "inspector").then(function (toolbox) {
    let inspector = toolbox.getCurrentPanel();

    // new-node-front tells us when the node has been selected, whether the
    // browser is remote or not.
    let onNewNode = inspector.selection.once("new-node-front");

    inspector.walker.getRootNode().then(function (rootNode) {
      return inspector.walker.querySelector(rootNode, selector);
    }).then(function (node) {
      inspector.selection.setNodeFront(node, "browser-context-menu");
    });

    return onNewNode.then(function () {
      // Now that the node has been selected, wait until the inspector is
      // fully updated.
      return inspector.once("inspector-updated");
    });
  });
};

/**
 * @function inspectSelectedElement
 *
 * @memberOf  ainspectorSidebar
 *
 * @desc Event handler attached to Inspect Element button. The button is
 *       enabled only if a row is selected in the Element Results tree.
 */

ainspectorSidebar.inspectSelectedElement = function () {
  var nls, title, message, promptService,
      tree, index, isRowSelected,
      elementResult, node;

  let inspectorEnabled = ainspector.prefs.getBoolPref("devtools.inspector.enabled");

  if (!inspectorEnabled) {
    nls = ainspectorSidebar.nlsProperties;
    title = nls.getString("inspector.notEnabled.title");
    message = nls.getString("inspector.notEnabled.message");
    promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
    promptService.alert(null, title, message);
    return;
  }

  tree = ainspectorSidebar.elementResultsTree;
  index = tree.currentIndex;
  isRowSelected = tree.view.selection.isSelected(index);

  if (isRowSelected) {
    elementResult = ainspectorSidebar.elementResultsTable[index].elementResult;
    node = elementResult.getDOMElement().node;
    ainspectorSidebar.inspectNode(node);
  }
};

/**
 * @function updatePageInspector
 *
 * @memberOf  ainspectorSidebar
 *
 * @desc Similar functionality to inspectNode, except that the function
 *       does nothing unless the Page Inspector is already visible.
 */

ainspectorSidebar.updatePageInspector = function (node) {
  let devtools  = ainspectorSidebar.devtools;
  let gDevTools = ainspectorSidebar.gDevTools;
  let gBrowser = parent.gBrowser;
  let target = devtools.TargetFactory.forTab(gBrowser.selectedTab);

  let toolbox = gDevTools.getToolbox(target);
  if (toolbox) {
    gDevTools.showToolbox(target, "inspector").then(function (toolbox) {
      let inspector = toolbox.getCurrentPanel();
      inspector.selection.setNode(node, "browser-context-menu");
    });
  }
};

/**
 * @function updateSelectedElement
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle selection event in Element Results tree.
 *
 * @external OpenAjax.a11y.ElementResult :: elementResult
 */

ainspectorSidebar.updateSelectedElement = function (tree) {
  var index = tree.currentIndex,
      isRowSelected = tree.view.selection.isSelected(index),
      highlightOption = document.getElementById("ainspector-highlight-option").value,
      elementResult, node;

  // handle case where table has no results
  if (isRowSelected && (typeof ainspectorSidebar.elementResultsTable[index].elementResult === "undefined")) {
    tree.view.selection.clearSelection();
    return;
  }

  // Set state of Inspect Element button
  ainspectorSidebar.inspectElementButton.disabled = isRowSelected ? false : true;

  if (isRowSelected) {
    elementResult = ainspectorSidebar.elementResultsTable[index].elementResult;

    // Highlight selected element if Selected option is active
    if (highlightOption === "1") {
      ainspectorSidebar.highlightModule.highlightElementResults(window.content.document, elementResult);
    }

    // Update Page Inspector if it is visible
    node = elementResult.getDOMElement().node;
    ainspectorSidebar.updatePageInspector(node);
  }
  else {
    ainspectorSidebar.closePageInspector();
  }
};

/**
 * @function updateHighlight
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle selection of Rule Details view and selection event in
 *       highlight options menulist.
 *
 * @external OpenAjax.a11y.RuleResult
 * @external OpenAjax.a11y.ElementResult
 * @external OpenAjax.a11y.ELEMENT_RESULT_VALUE
 */

ainspectorSidebar.updateHighlight = function () {
  var highlightOption;

  function getElementResults() {
    let currentIndex = ainspectorSidebar.ruleCategoryTree.currentIndex;
    let selectedRuleResult = ainspectorSidebar.ruleResultsTable[currentIndex].ruleResult;
    return selectedRuleResult.getElementResultsArray();
  }

  function compareResultValue(elementResult, targetList) {
    let resultValue = elementResult.getResultValue();
    for (let i = 0; i < targetList.length; i++) {
      if (resultValue === targetList[i]) return true;
    }
    return false;
  }

  function violationOrWarning(elementResult) {
    var list = [
      OpenAjax.a11y.ELEMENT_RESULT_VALUE.VIOLATION,
      OpenAjax.a11y.ELEMENT_RESULT_VALUE.WARNING
    ];
    return compareResultValue(elementResult, list);
  }

  function manualCheck(elementResult) {
    var list = [
      OpenAjax.a11y.ELEMENT_RESULT_VALUE.MANUAL_CHECK
    ];
    return compareResultValue(elementResult, list);
  }

  function highlightResults(results) {
    let doc = window.content.document;
    ainspectorSidebar.highlightModule.highlightElementResults(doc, results);
  }

  // Remove previous highlighting
  ainspectorSidebar.highlightModule.removeHighlight(window.content.document);

  // Get the current highlight setting
  highlightOption = document.getElementById("ainspector-highlight-option").value;

  switch (highlightOption) {
  case "0": // None
    break;

  case "1": // Selected
    ainspectorSidebar.updateSelectedElement(ainspectorSidebar.elementResultsTree);
    break;

  case "2": // V/W
    highlightResults(getElementResults().filter(violationOrWarning));
    break;

  case "3": // MC
    highlightResults(getElementResults().filter(manualCheck));
    break;

  case "4": // All
    highlightResults(getElementResults());
    break;

  default:
    break;
  }
};

/**
 * @function handleERTreeEvent
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle dblclick and keypress events when row is selected. If user
 *       double-clicks a row, or presses return, enter or spacebar when a
 *       row is selected, open the Firefox Inspector.
 */

ainspectorSidebar.handleERTreeEvent =
  ainspectorSidebar.getTreeEventHandler(ainspectorSidebar.inspectSelectedElement);
