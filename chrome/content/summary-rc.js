/**
 * @file summary-rc.js
 *
 * @desc Provide functionality for populating Rule Categories summary table.
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
 * @function getSummaryRCTable
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Construct and return data structure used by Rule Categories summary tree.
 */

ainspectorSidebar.getSummaryRCTable = function (nullData) {
  var table = [];

  for (var i = ainspector.viewEnum.LANDMARKS; i < ainspector.viewEnum.WCAG_1_1; i++) {
    var data = nullData ? nullData : ainspectorSidebar.getSummaryData(i);

    table.push({
      "ainspector-summary-rc-name-col": ainspectorSidebar.getViewTitle(i),
      "ainspector-summary-rc-viol-col": data.viol,
      "ainspector-summary-rc-warn-col": data.warn,
      "ainspector-summary-rc-mc-col":   data.mc,
      "ainspector-summary-rc-pass-col": data.pass
    });
  }

  return table;
};

/**
 * @function getSummaryRCColSuffix
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Get descriptive suffix for columns that display numerical data.
 *       Used for screen reader compatibility mode.
 */

ainspectorSidebar.getSummaryRCColSuffix = function (col, value) {
  var suffixes = ainspectorSidebar.getSummaryColSuffixes();

  switch (col.id) {
  case "ainspector-summary-rc-viol-col":
    return PluralForm.get(value, suffixes.VIOLATION);

  case "ainspector-summary-rc-warn-col":
    return PluralForm.get(value, suffixes.WARNING);

  case "ainspector-summary-rc-mc-col":
    return PluralForm.get(value, suffixes.MANUAL_CHECK);

  case "ainspector-summary-rc-pass-col":
    return PluralForm.get(value, suffixes.PASS);

  default:
    return '';
  }
};

/**
 * @constructor TreeViewSummaryRC
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

ainspectorSidebar.TreeViewSummaryRC = function (table) {
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
      return ainspectorSidebar.getSummaryRCColSuffix(col, value);
    }

    if (value === 0) return '-';

    if (screenReaderMode) {
      if (col.id === "ainspector-summary-rc-name-col")
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
    if (col.id === "ainspector-summary-rc-name-col") {
      return '';
    }
    else {
      if (props)
        props.AppendElement(atomService.getAtom("numeric"));
      else
        return "numeric";
    }
  };

  this.getRowProperties = function (row, props) {
    var lastRow = table.length - 1;
    if (row === lastRow) {
      if (props)
        props.AppendElement(atomService.getAtom("separator-top"));
      else
        return "separator-top";
    }
  };
};

// Finalize the definition of TreeViewSummaryRC by inheriting the TreeView methods.
ainspector.utils.inherits(ainspectorSidebar.TreeViewSummaryRC, ainspectorSidebar.TreeView);

/**
 * @function updateSummaryRCTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Update data in Rule Categories summary table from current evaluation.
 */

ainspectorSidebar.updateSummaryRCTree = function () {
  var tree = document.getElementById("ainspector-summary-rc-tree");
  var table = ainspectorSidebar.getSummaryRCTable();
  tree.view = new ainspectorSidebar.TreeViewSummaryRC(table);

  // handle row selection state changes
  ainspectorSidebar.setStateSummaryRCTree();
};

/**
 * @function clearSummaryRCTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Clear data in Rule Categories summary table (called during page load)
 */

ainspectorSidebar.clearSummaryRCTree = function () {
  var tree = document.getElementById("ainspector-summary-rc-tree");
  var table = ainspectorSidebar.getSummaryRCTable(ainspector.nullData);
  tree.view = new ainspectorSidebar.TreeViewSummaryRC(table);

  // handle row selection state changes
  ainspectorSidebar.setStateSummaryRCTree();
};

/**
 * @function selectViewFromSummaryRCTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle click of Details button.
 */

ainspectorSidebar.selectViewFromSummaryRCTree = function () {
  var tree = ainspectorSidebar.summaryRCTree;
  var index = tree.currentIndex;
  var isRowSelected = tree.view.selection.isSelected(index);
  var offset = ainspector.viewEnum.LANDMARKS;

  if (isRowSelected) {
    ainspectorSidebar.selectView(offset + index);
  }
};

/**
 * @function handleSummaryRCTreeEvent
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Handle dblclick and keypress events when row is selected. If user
 *       double-clicks a row, or presses return, enter or spacebar when a
 *       row is selected, go to the corresponding Rule Category view.
 */

ainspectorSidebar.handleSummaryRCTreeEvent =
  ainspectorSidebar.getTreeEventHandler(ainspectorSidebar.selectView, ainspector.viewEnum.LANDMARKS);

/**
 * @function setStateSummaryRCTree
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set Details button enabled/disabled state based on row selection.
 */

ainspectorSidebar.setStateSummaryRCTree = function () {
  var tree = ainspectorSidebar.summaryRCTree;
  var index = tree.currentIndex;
  var isRowSelected = tree.view.selection.isSelected(index);
  var button = document.getElementById("ainspector-summary-details-button");

  button.disabled = !isRowSelected;
  button.image = isRowSelected ?
    "chrome://ai-sidebar/skin/fwd-button.png" :
    "chrome://ai-sidebar/skin/fwd-button-off.png";
};
