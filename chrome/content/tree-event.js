/**
 * @function getTreeEventHandler
 *
 * @desc Return a function that takes an event argument and handles dblclick
 *       and keypress events when a tree row is selected. If the user double-
 *       clicks a row, or presses return, enter or spacebar when a row is
 *       selected, the handler calls the function specified by callback.
 *
 * @param callback - Reference to callback function that is called by the
 *                   handler when the event criteria are met.
 */

var getTreeEventHandler = function (callback, offset) {
  return function (event) {
    var tree = event.currentTarget,
        index = tree.currentIndex,
        isRowSelected = tree.view.selection.isSelected(index),
        tbo = tree.treeBoxObject
    ;

    // do nothing when no row is selected
    if (!isRowSelected) return;

    switch (event.type) {
    case "dblclick":
      // user must dblclick on an actual row
      var row = { }, col = { }, child = { };
      tbo.getCellAt(event.clientX, event.clientY, row, col, child);
      if (row.value !== -1)
        callback(offset + index);
      break;

    case "keypress":
      // handle return (13), enter (3) and spacebar (32) keypress
      if (event.keyCode === 13  || event.keyCode === 3 || event.charCode === 32)
        callback(offset + index);
      break;

    default:
      break;
    }
  };
};
