/**
 * @file views-button.js
 *
 * @desc Define properties and methods for managing Views menu button state.
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

/**
 * @function getViewsMenuitem
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Get the specified menuitem from the Views menu.
 */

ainspectorSidebar.getViewsMenuitem = function (index) {
  var view = ainspector.viewEnum;

  switch (index) {

  case view.SUMMARY:
    return document.getElementById("ainspector-sidebar-view-summary");

  case view.LANDMARKS:
    return document.getElementById("ainspector-sidebar-view-landmarks");

  case view.HEADINGS:
    return document.getElementById("ainspector-sidebar-view-headings");

  case view.STYLES:
    return document.getElementById("ainspector-sidebar-view-styles");

  case view.IMAGES:
    return document.getElementById("ainspector-sidebar-view-images");

  case view.LINKS:
    return document.getElementById("ainspector-sidebar-view-links");

  case view.TABLES:
    return document.getElementById("ainspector-sidebar-view-tables");

  case view.FORMS:
    return document.getElementById("ainspector-sidebar-view-forms");

  case view.WIDGETS:
    return document.getElementById("ainspector-sidebar-view-widgets");

  case view.MEDIA:
    return document.getElementById("ainspector-sidebar-view-media");

  case view.KEYBOARD:
    return document.getElementById("ainspector-sidebar-view-keyboard");

  case view.TIMING:
    return document.getElementById("ainspector-sidebar-view-timing");

  case view.NAVIGATION:
    return document.getElementById("ainspector-sidebar-view-navigation");

  case view.ALL_RULES:
    return document.getElementById("ainspector-sidebar-view-all-rules");

  case view.WCAG_1_1:
    return document.getElementById("ainspector-sidebar-view-wcag-1-1");

  case view.WCAG_1_2:
    return document.getElementById("ainspector-sidebar-view-wcag-1-2");

  case view.WCAG_1_3:
    return document.getElementById("ainspector-sidebar-view-wcag-1-3");

  case view.WCAG_1_4:
    return document.getElementById("ainspector-sidebar-view-wcag-1-4");

  case view.WCAG_2_1:
    return document.getElementById("ainspector-sidebar-view-wcag-2-1");

  case view.WCAG_2_2:
    return document.getElementById("ainspector-sidebar-view-wcag-2-2");

  case view.WCAG_2_3:
    return document.getElementById("ainspector-sidebar-view-wcag-2-3");

  case view.WCAG_2_4:
    return document.getElementById("ainspector-sidebar-view-wcag-2-4");

  case view.WCAG_3_1:
    return document.getElementById("ainspector-sidebar-view-wcag-3-1");

  case view.WCAG_3_2:
    return document.getElementById("ainspector-sidebar-view-wcag-3-2");

  case view.WCAG_3_3:
    return document.getElementById("ainspector-sidebar-view-wcag-3-3");

  case view.WCAG_4_1:
    return document.getElementById("ainspector-sidebar-view-wcag-4-1");

  default:
    break;
  }

  return null;
};

/**
 * @function setViewsMenuOptions
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Show or hide selected menuitems based on preference setting.
 */

ainspectorSidebar.setViewsMenuOptions = function () {
  var pref = ainspector.generalPrefs.getPref("wcagMenuitems");
  var hidden = !pref;

  document.getElementById("ainspector-sidebar-views-separator").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-1-1").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-1-2").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-1-3").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-1-4").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-2-1").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-2-2").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-2-3").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-2-4").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-3-1").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-3-2").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-3-3").hidden = hidden;
  document.getElementById("ainspector-sidebar-view-wcag-4-1").hidden = hidden;
};

/**
 * @function setViewsMenu
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Show the correct menuitem checked state for current view.
 */

ainspectorSidebar.setViewsMenu = function () {
  var menuitem = parent.AINSPECTOR.currentView === ainspector.viewConst.DETAILS ?
    ainspectorSidebar.getViewsMenuitem(parent.AINSPECTOR.previousView) :
    ainspectorSidebar.getViewsMenuitem(parent.AINSPECTOR.currentView);
  if (menuitem) menuitem.setAttribute("checked", "true");
  ainspectorSidebar.setViewsMenuOptions();
};
