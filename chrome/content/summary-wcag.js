/**
 * @file summary-wcag.js
 *
 * @desc Provide functionality for populating WCAG Guidelines summary table.
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");
Components.utils.import("resource://gre/modules/PluralForm.jsm");

// Load the TreeView definition
Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/tree-view.js", ainspectorSidebar);

// Load the getTreeEventHandler function
Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/tree-event.js", ainspectorSidebar);

/**
 * @function getSummaryWCAGTable
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Construct and return data structure used by WCAG Guidelines summary tree.
 */

ainspectorSidebar.getSummaryWCAGTable = function (nullData) {
  var table = [];

  for (var i = ainspector.viewEnum.WCAG_1_1; i < ainspectorSidebar.numViews; i++) {
    var data = nullData ? nullData : ainspectorSidebar.getSummaryData(i);

    table.push({
      "ainspector-summary-wcag-name-col": ainspectorSidebar.getViewTitle(i),
      "ainspector-summary-wcag-viol-col": data.viol,
      "ainspector-summary-wcag-warn-col": data.warn,
      "ainspector-summary-wcag-mc-col":   data.mc,
      "ainspector-summary-wcag-pass-col": data.pass
    });
  }

  return table;
};

/**
 * @function getSummaryWCAGColSuffix
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Get descriptive suffix for columns that display numerical data.
 *       Used for screen reader compatibility mode.
 */

ainspectorSidebar.getSummaryWCAGColSuffix = function (col, value) {
  var suffixes = ainspectorSidebar.getSummaryColSuffixes();

  switch (col.id) {
  case "ainspector-summary-wcag-viol-col":
    return PluralForm.get(value, suffixes.VIOLATION);

  case "ainspector-summary-wcag-warn-col":
    return PluralForm.get(value, suffixes.WARNING);

  case "ainspector-summary-wcag-mc-col":
    return PluralForm.get(value, suffixes.MANUAL_CHECK);

  case "ainspector-summary-wcag-pass-col":
    return PluralForm.get(value, suffixes.PASS);

  default:
    return '';
  }
};

/**
 * @constructor TreeViewSummaryWCAG
 *
 * @memberOf ainspectorSidebar
 *
 * @augments TreeView (using prototype-based inheritance via the inherits fn.)
 *
 * @desc Define methods getCellText and getCellProperties. Inherit all other
 *       methods and properties from the TreeView object.
 *
 * @param table - Array of table row data objects
 */

ainspectorSidebar.TreeViewSummaryWCAG = function (table) {
  // call the parent constructor
  ainspectorSidebar.TreeView.call(this, table);

  // Used by getCellProperties (but obsolete starting with Firefox 22)
  var atomService = Components.classes["@mozilla.org/atom-service;1"].
                    getService(Components.interfaces.nsIAtomService);

  var screenReaderMode = ainspector.generalPrefs.getPref('screenReaderMode');

  // define methods specific to this particular tree view
  this.getCellText = function (row, col) {
    var value = table[row][col.id];

    function isInt(n) {
      return parseInt(n) === n;
    }

    function getSuffix() {
      return ainspectorSidebar.getSummaryWCAGColSuffix(col, value === 1);
    }

    if (value === 0) return '-';

    if (screenReaderMode) {
      if (col.id === "ainspector-summary-wcag-name-col")
        return value + ': ';
      if (isInt(value))
        return value + ' ' + getSuffix() + ', ';
      return value;
    }
    else {
      return value;
    }
  };

  this.getCellProperties = function (row, col, props) {
    if (col.id === "ainspector-summary-wcag-name-col") {
      return '';
    }
    else {
      if (props)
        props.AppendElement(atomService.getAtom("numeric"));
      else
        return "numeric";
    }
  };
};

// Finalize the definition of TreeViewSummaryWCAG by inheriting the TreeView methods.
ainspector.utils.inherits(ainspectorSidebar.TreeViewSummaryWCAG, ainspectorSidebar.TreeView);

/**
 * @function updateSummaryWCAGTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Update data in WCAG Guidelines summary table from current evaluation.
 */

ainspectorSidebar.updateSummaryWCAGTree = function () {
  var tree = document.getElementById("ainspector-summary-wcag-tree");
  var table = ainspectorSidebar.getSummaryWCAGTable();
  tree.view = new ainspectorSidebar.TreeViewSummaryWCAG(table);

  // handle row selection state changes
  ainspectorSidebar.setStateSummaryWCAGTree();
};

/**
 * @function clearSummaryWCAGTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Clear data in WCAG Guidelines summary table (called during page load)
 */

ainspectorSidebar.clearSummaryWCAGTree = function () {
  var tree = document.getElementById("ainspector-summary-wcag-tree");
  var table = ainspectorSidebar.getSummaryWCAGTable(ainspector.nullData);
  tree.view = new ainspectorSidebar.TreeViewSummaryWCAG(table);

  // handle row selection state changes
  ainspectorSidebar.setStateSummaryWCAGTree();
};

/**
 * @function selectViewFromSummaryWCAGTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle click of Details button.
 */

ainspectorSidebar.selectViewFromSummaryWCAGTree = function () {
  var tree = ainspectorSidebar.summaryWCAGTree;
  var index = tree.currentIndex;
  var isRowSelected = tree.view.selection.isSelected(index);
  var offset = ainspector.viewEnum.WCAG_1_1;

  if (isRowSelected) {
    ainspectorSidebar.selectView(offset + index);
  }
};

/**
 * @function handleSummaryWCAGTreeEvent
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle dblclick and keypress events when row is selected. If user
 *       double-clicks a row, or presses return, enter or spacebar when a
 *       row is selected, go to the corresponding WCAG Guideline view.
 */

ainspectorSidebar.handleSummaryWCAGTreeEvent =
  ainspectorSidebar.getTreeEventHandler(ainspectorSidebar.selectView, ainspector.viewEnum.WCAG_1_1);

/**
 * @function setStateSummaryWCAGTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set Details button enabled/disabled state based on row selection.
 */

ainspectorSidebar.setStateSummaryWCAGTree = function () {
  var tree = ainspectorSidebar.summaryWCAGTree;
  var index = tree.currentIndex;
  var isRowSelected = tree.view.selection.isSelected(index);
  var button = document.getElementById("ainspector-summary-details-button");

  button.disabled = !isRowSelected;
  button.image = isRowSelected ?
    "chrome://ai-sidebar/skin/fwd-button.png" :
    "chrome://ai-sidebar/skin/fwd-button-off.png";
};
