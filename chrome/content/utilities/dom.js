/**
 * @file dom.js
 *
 * @desc Provide functions for creating and removing DOM elements. Note:
 *       The function createXHTMLElement depends on the availability of
 *       window and window.document objects.
 */

/**
 * @function createXHTMLElement
 *
 * @desc Instantiate and return an XHTML element as specified.
 */

var createXHTMLElement = function (elementName, textValue, attributes) {
  var element = document.createElementNS("http://www.w3.org/1999/xhtml", elementName);

  if (textValue !== null) {
    element.appendChild(document.createTextNode(textValue));
  }

  if (attributes !== null && typeof attributes === "object") {
    for (var prop in attributes)
      element.setAttribute(prop, attributes[prop]);
  }

  return element;
};

/**
 * @function appendXHTMLElement
 *
 * @desc Append element created with createXHTMLElement to container,
 *       followed by a text node with one or more newline characters.
 */

var appendXHTMLElement = function (container, element, count) {
  var newlines = "\n";
  var max = (count === undefined) ? 1 : count;
  for (var i = 1; i < max; i++) newlines += "\n";

  container.appendChild(element);
  container.appendChild(document.createTextNode(newlines));
};

/**
 * @function appendNewline
 *
 * @desc Append text node containing newline character to container.
 */

var appendNewline = function (container) {
  container.appendChild(document.createTextNode("\n"));
};

/**
 * @function clearContent
 *
 * @desc Remove all of the child nodes of the specified node.
 */

var clearContent = function (node) {
  while (node.firstChild)
    node.removeChild(node.firstChild);
};
