/**
 * @function sortTree
 *
 * @desc Sort the data table by selected or default column and order; then
 *       update the tree element with a new custom tree view. Also, set the
 *       column sort order indicator, set the state of Default Sort button,
 *       if specified, and call the updateCallback, if specified.
 *
 * @param properties {Object} with the following properties:
 *   tree  {Object} - tree element with custom tree view
 *   table {Object} - data table on which custom tree view is based
 *   viewConstructor {Function} - custom tree view constructor (called with table arg)
 *   defaultOrder  {String} - "ascending" or "descending"
 *   defaultColumn {String} - default primary sort column
 *   sortColumns {Array} - [can be null] sort column info for breaking ties in primary column
 *   defaultSortButton {Object} - [can be null] button element for default sort
 *   updateCallback  {Function} - [can be null] called after new tree view created (with tree arg)
 *
 * @param column {XUL treecol element} [optional] - primary sort column
 */

var sortTree = function (properties, column) {

  var tree              = properties.tree;
  var table             = properties.table;
  var viewConstructor   = properties.viewConstructor;
  var defaultOrder      = properties.defaultOrder;
  var defaultColumn     = properties.defaultColumn;
  var sortColumns       = properties.sortColumns;
  var defaultSortButton = properties.defaultSortButton;
  var updateCallback    = properties.updateCallback;
  var loggerCallback    = properties.loggerCallback;

  var order = tree.getAttribute("sortDirection") == "ascending" ? 1 : -1;
  var columnName;

  // If column is specified and the table is already sorted by that column,
  // reverse the sort order. Otherwise, get the previous sort column.
  if (column) {
    columnName = column.id;
    if (tree.getAttribute("sortResource") == columnName) {
      order *= -1;
    }
  }
  else {
    columnName = tree.getAttribute("sortResource");
  }

  function normalize(o) {
    if (typeof o == "string") {
      return o.toLowerCase();
    }
    return o;
  }

  function columnSort(a, b) {

    if (normalize(a[columnName]) > normalize(b[columnName])) return  1 * order;
    if (normalize(a[columnName]) < normalize(b[columnName])) return -1 * order;

    // Tie breakers: Use additional sort columns for multi-column sorting.
    if (sortColumns) {
      for (var i = 0; i < sortColumns.length; i++) {
        var sortColumn = sortColumns[i].sortColumn;
        var multiplier = sortColumns[i].multiplier;
        var gtmult = multiplier, ltmult = -multiplier;

        if (columnName != sortColumn) {
          if (normalize(a[sortColumn]) > normalize(b[sortColumn])) return gtmult * order;
          if (normalize(a[sortColumn]) < normalize(b[sortColumn])) return ltmult * order;
        }
      }
    }

    return 0;
  }

  // Sort the data table.
  table.sort(columnSort);

  // Setting these will make the sort option persist.
  tree.setAttribute("sortDirection", order == 1 ? "ascending" : "descending");
  tree.setAttribute("sortResource", columnName);

  // Reset the view property with new custom tree view based on sorted table.
  tree.view = new viewConstructor(table);

  // Set the appropriate attributes to show column sort order indicator.
  var cols = tree.getElementsByTagName("treecol");
  for (var i = 0; i < cols.length; i++) {
    cols[i].removeAttribute("sortDirection");
  }
  document.getElementById(columnName).setAttribute("sortDirection", order == 1 ? "ascending" : "descending");

  // Set the state of Default Sort button.
  var sortDirection = tree.getAttribute("sortDirection");
  var sortResource = tree.getAttribute("sortResource");

  if (defaultSortButton)
    defaultSortButton.disabled = (sortDirection === defaultOrder) && (sortResource === defaultColumn);

  // Update UI based on tree selection state.
  if (updateCallback) updateCallback(tree);

  // Output logging info.
  if (loggerCallback) loggerCallback(table);
};
