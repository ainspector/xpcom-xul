/**
 * @constructor TreeView
 *
 * @desc Define TreeView object with minimal implementations of all shareable
 *       methods required by the XPCOM interface nsITreeView. This object can
 *       then be used via prototype-based inheritance by other tree-specific
 *       objects, which define non-shareable methods such as getCellText and
 *       getCellProperties.
 *
 *       Prototype-based inheritance can be implemented using this pattern:
 *
 *       1. var AnotherTreeView = function (args) {
 *                                  // call TreeView constructor
 *                                  TreeView.call(this, args);
 *                                  // define non-shareable methods
 *                                };
 *       2. AnotherTreeView.prototype = Object.create(TreeView.prototype);
 *       3. AnotherTreeView.prototype.constructor = AnotherTreeView;
 *
 * @param table - Array of table row data objects
 */

var TreeView = function (table) {
  this.rowCount = table.length;
  this.table = table;
};

TreeView.prototype.cycleHeader = function (col, elem) {};
TreeView.prototype.getCellValue = function (row, col) { return this.table[row][col.id]; };
TreeView.prototype.getImageSrc = function (row, col) { return null; };
TreeView.prototype.getLevel = function (row) { return 0; };
TreeView.prototype.getColumnProperties = function (col, props) {};
TreeView.prototype.getRowProperties = function (row, props) {};
TreeView.prototype.isContainer = function (row) { return false; };
TreeView.prototype.isEditable = function (row, col) { return col.editable; };
TreeView.prototype.isSeparator = function (row) { return false; };
TreeView.prototype.isSorted = function () { return false; };
TreeView.prototype.setTree = function (treebox) { this.treebox = treebox; };
