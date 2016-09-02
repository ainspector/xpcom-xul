/**
 * @file inspection.js
 *
 * @desc Utility functions for inspecting XUL objects and DOM nodes. Note
 *       that the "name" and "unsorted" parameters are optional.
 *       1. getPropValue(obj, prop, name);
 *       2. getProperties(obj, name, unsorted);
 *       3. getMethods(obj, name, unsorted);
 *       4. getAttrValue(node, attr);
 *       5. getAttributes(node, name, unsorted);
 */

var EXPORTED_SYMBOLS = [
  "getPropValue",
  "getProperties",
  "getMethods",
  "getAttrValue",
  "getAttributes"
];

/**
 * @function getPropValue
 *
 * @desc Return a string containing the value of the named property for the
 *       specified object.
 *
 * @param {Object} obj - the object of interest
 * @param {String} prop - name of the property whose value is to be revealed
 * @param {String} name - (optional) an identifier for the object
 */

var getPropValue = function (obj, prop, name) {
  if (!name) name = obj.hasOwnProperty("localName") ? obj.localName : obj;
  var prefix = 'PROPERTY VALUE for ' + name + '["' + prop + '"]: ';
  var info = (typeof obj[prop] === 'undefined') ? 'undefined' : obj[prop];
  return prefix + info;
};

/**
 * @function getProperties
 *
 * @desc Return a string containing a comma-separated list of all properties
 *       of an object, excluding methods.
 *
 * @param {Object} obj - the object of interest
 * @param {String} name - (optional) an identifier for the object
 * @param {Boolean} unsorted - (optional) if true, do not sort the list
 */

var getProperties = function (obj, name, unsorted) {
  if (!name) name = obj.hasOwnProperty("localName") ? obj.localName : obj;
  var prefix = 'PROPERTIES for ' + name + ':\n';
  var properties = [];
  for (var prop in obj) {
    if (typeof obj[prop] !== 'function') properties.push(prop);
  }
  if (!unsorted) properties.sort();
  return prefix + properties.join(', ');
};

/**
 * @function getMethods
 *
 * @desc Return a string containing a comma-separated list of all methods of
 *       an object, excluding other properties.
 *
 * @param {Object} obj - the object of interest
 * @param {String} name - (optional) an identifier for the object
 * @param {Boolean} unsorted - (optional) if true, do not sort the list
 */

var getMethods = function (obj, name, unsorted) {
  if (!name) name = obj.hasOwnProperty("localName") ? obj.localName : obj;
  var prefix = 'METHODS for ' + name + ':\n';
  var methods = [];
  for (var prop in obj) {
    if (typeof obj[prop] === 'function') methods.push(prop);
  }
  if (!unsorted) methods.sort();
  return prefix + methods.join(', ');
};

/**
 * @function getAttrValue
 *
 * @desc Return a string containing the attribute name and its value for the
 *       specified DOM node. If the attribute does not exist on the node, the
 *       string 'attribute does not exist' is returned.
 *
 * @param {Object} node - the node of interest
 * @param {String} attr - name of the attribute whose value is to be revealed
 */

var getAttrValue = function (node, attr) {
  var name = node.hasOwnProperty("localName") ? node.localName : node;
  var prefix = 'ATTRIBUTE INFO for ' + name + '[@' + attr + ']: ';
  var info = node.hasAttribute(attr) ? node.getAttribute(attr) : 'attribute does not exist';
  return prefix + info;
};

/**
 * @function getAttributes
 *
 * @desc Return a string containing a comma-separated list of all attributes
 *       of a DOM node.
 *
 * @param {Object} node - the node of interest
 * @param {String} name - (optional) an identifier for the DOM node
 * @param {Boolean} unsorted - (optional) if true, do not sort the list
 */

var getAttributes = function (node, name, unsorted) {
  if (!name) name = node.hasOwnProperty("localName") ? node.localName : node;
  var prefix = 'ATTRIBUTES for ' + name + ':\n';
  var attributes = [];
  for (var attr in node.attributes) {
    attributes.push(attr);
  }
  if (!unsorted) attributes.sort();
  return prefix + attributes.join(', ');
};
