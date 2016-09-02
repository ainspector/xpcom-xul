/**
 * @file preferences.js
 *
 * @desc Provide PrefListener and PrefUtils objects.
 */

var EXPORTED_SYMBOLS = ["PrefListener", "PrefUtils"];

/**
 * @constructor PrefListener
 *
 * @param {String} branchName
 * @param {Function} callback must have the following arguments:
 *   branch, prefLeafName
 *
 * @note From MDN documentation Code Snippets: Preferences
 */
 
var PrefListener = function (branchName, callback) {
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService);

  this.branch = prefService.getBranch(branchName);
  this.callback = callback;
};
 
PrefListener.prototype.observe = function (subject, topic, data) {
  if (topic === "nsPref:changed") this.callback(this.branch, data);
};
 
PrefListener.prototype.register = function () {
  this.branch.addObserver('', this, false);
};
 
PrefListener.prototype.unregister = function () {
  if (this.branch) this.branch.removeObserver('', this);
};

/**
 * @constructor PrefUtils
 *
 * @param {String} branchName
 */

var PrefUtils = function (branchName) {
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService);

  this.branch = prefService.getBranch(branchName);
};

PrefUtils.prototype.getBoolPref = function (name) {
  return this.branch.getBoolPref(name);
};

PrefUtils.prototype.setBoolPref = function (name, value) {
  this.branch.setBoolPref(name, value);
};

PrefUtils.prototype.getCharPref = function (name) {
  return this.branch.getCharPref(name);
};

PrefUtils.prototype.setCharPref = function (name, value) {
  this.branch.setCharPref(name, value);
};

PrefUtils.prototype.getIntPref = function (name) {
  return this.branch.getIntPref(name);
};

PrefUtils.prototype.setIntPref = function (name, value) {
  this.branch.setIntPref(name, value);
};

PrefUtils.prototype.getComplexValue = function (name) {
  return this.branch.getComplexValue(name, Components.interfaces.nsIPrefLocalizedString).data;
};

PrefUtils.prototype.setComplexValue = function (name, value) {
  var pls = Components.classes["@mozilla.org/pref-localizedstring;1"]
              .createInstance(Components.interfaces.nsIPrefLocalizedString);
  pls.data = value;
  this.branch.setComplexValue(name, Components.interfaces.nsIPrefLocalizedString, pls);
};

PrefUtils.prototype.hasUserValues = function () {
  var count = {};
  var prefs = this.branch.getChildList("", count);
  for (var i = 0; i < count.value; i++) {
    if (this.branch.prefHasUserValue(prefs[i]))
      return true;
  }
  return false;
};

PrefUtils.prototype.restoreDefaults = function () {
  var count = {};
  var prefs = this.branch.getChildList("", count);
  for (var i = 0; i < count.value; i++) {
    if (this.branch.prefHasUserValue(prefs[i]))
      this.branch.clearUserPref(prefs[i]);
  }
};
