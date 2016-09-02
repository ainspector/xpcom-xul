/**
 * @file about.js
 *
 * @desc Import ainspector namespace for storing info needed by About dialog.
 *       Save AInspector Sidebar addon object in ainspector.addon property.
 *
 * @external OpenAjax.a11y
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");
Components.utils.import("resource://gre/modules/AddonManager.jsm");

AddonManager.getAddonByID("ai-sidebar@ainspector.org", function(a) { ainspector.addon = a; });

ainspector.setAddonVersion = function() {
  var node = document.getElementById('ainspector-version');
  if (node) node.setAttribute('value', ainspector.addon.version);
};

ainspector.setLibraryVersion = function () {
  var version = OpenAjax.a11y.getVersion();
  var node = document.getElementById('ainspector-oaa-version');
  if (node) node.setAttribute('value', version); 
};
