/**
 * @file progress.js
 *
 * @desc This module defines a function that initializes and returns an object
 *       that implements the nsIWebProgressListener interface. Two arguments
 *       are required for proper initialization: (1) a callback function to be
 *       called when the location bar changes (locationChangeCallback) and (2)
 *       a callback function to be called when the loading of a new location
 *       has completed (stateChangeCallback).
 *
 * @see  https://developer.mozilla.org/en/Code_snippets/Progress_Listeners
 *       for more information on nsIWebProgressListener
 */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

/**
 * @function getProgressListener
 *
 * @desc Initialize and return an object that implements nsIWebProgressListener
 *
 * @param {Function} locationChangeCallback - Called by onLocationChange when a
 *        load event is confirmed; this can be caused by the user typing a new
 *        URL in the location bar or changing tabs. In an add-on, this callback
 *        typically triggers the clearing of old data and the display of a
 *        progress meter indicating that the loading of a new URL has begun.
 *
 * @param {Function} stateChangeCallback - Called by onStateChange when a load
 *        event has completed. In an add-on, this callback typically triggers
 *        the hiding of a progress meter and the refresh of data in a view.
 *
 * @param {Object} logger (optional) - A logger object that conforms to the
 *        interface defined in logging.js.
 */

var getProgressListener = function (locationChangeCallback, stateChangeCallback, logger) {

  // private members
  var top_location_href = null;

  // nsIWebProgressListener constants
  const STATE_STOP      = Components.interfaces.nsIWebProgressListener.STATE_STOP;
  const STATE_IS_WINDOW = Components.interfaces.nsIWebProgressListener.STATE_IS_WINDOW;

  // public API: return an object that implements the nsIWebProgressListener interface
  return {

    QueryInterface: XPCOMUtils.generateQI([
      Components.interfaces.nsIWebProgressListener,
      Components.interfaces.nsIWebProgressListener2,
      Components.interfaces.nsISupportsWeakReference,
      Components.interfaces.nsIXULBrowserWindow,
      Components.interfaces.nsISupports
    ]),

    onLocationChange: function (webProgress, request, location, flags) {
      if (request) { // ignore call if request arg is null
        top_location_href = webProgress.DOMWindow.top.location.href;
        if (logger) logger.log.debug('onLocationChange: ' + top_location_href);
        locationChangeCallback();
      }
    },

    onStateChange: function (webProgress, request, flags, status) {
      if (flags & STATE_STOP && flags & STATE_IS_WINDOW) {
        var location_href = webProgress.DOMWindow.location.href;
        if (logger) logger.log.debug('onStateChange: ' + location_href);
        if (location_href == top_location_href) {
          stateChangeCallback();
        }
      }
    },

    onProgressChange: function (a, b, c, d, e, f) {},
    onSecurityChange: function (a, b, c) {},
    onStatusChange: function (a, b, c, d) {},

    getLocation: function () { return top_location_href; }

  }; // end return

};
