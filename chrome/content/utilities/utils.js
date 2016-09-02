/**
* @file utils.js
*
* @desc Provide general purpose utility functions.
*/

var EXPORTED_SYMBOLS = ["Enum", "inherits"];

/**
* @constructor Enum
*
* @desc Return an immutable object with properties named according to the
*       constantsList strings, and with each property having a sequential
*       integer value starting with 0, or with startValue if specified.
*
*       Dependency: ECMAScript 5 for the function Object.freeze()
*
* @param {Array} constantsList - an array of string constants
* @param {Number} startValue - (optional) value of starting element
*/

var Enum = function (constantsList, startValue) {
  var start = (arguments.length < 2) ? 0 : parseInt(startValue);
  var len = constantsList.length;
  for (var i = 0; i < len; i++) {
    this[constantsList[i]] = start + i;
  }
  return Object.freeze(this);
};

/**
* @function inherits
*
* @desc Implement prototype-based inheritance:
*       1. Set the ChildConstructor's prototype property to a newly created
*          object based on the ParentConstructor's prototype.
*       2. A side effect of Step 1. is that now the ChildConstructor's
*          prototype.constructor property points to ParentConstructor.
*          Fix this by overriding the value of that property so that it
*          correctly points to itself.
*
*       Dependency: ECMAScript 5 for the function Object.create()
*
*       Usage:
*         function ParentConstructor(a, b) {
*           // do things with a and b params
*         }
*         ParentConstructor.prototype.foo = function() { }
*
*         function ChildConstructor(a, b, c) {
*           // call the parent constructor for proper initialization
*           ParentConstructor.call(this, a, b);
*           // additional statements ...
*         }
*         inherits(ChildConstructor, ParentConstructor);
*
*         var child = new ChildConstructor('a', 'b', 'c');
*         child.foo(); // works
*/

var inherits = function (ChildConstructor, ParentConstructor) {
  ChildConstructor.prototype = Object.create(ParentConstructor.prototype);
  ChildConstructor.prototype.constructor = ChildConstructor;
};
