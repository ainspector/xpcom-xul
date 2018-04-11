/**
 * @file rule-info.js
 *
 * @desc Used by view-details.js for populating Rule Information panels.
 *
 * @external OpenAjax.a11y
 */

Components.utils.import("chrome://ai-sidebar/content/ai-common.js");

Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
  .getService(Components.interfaces.mozIJSSubScriptLoader)
  .loadSubScript("chrome://ai-sidebar/content/utilities/dom.js", ainspectorSidebar);

/**
 * @function getRuleInfoLabels
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Helper function for getting Rule Information labels from properties file.
 */

ainspectorSidebar.getRuleInfoLabels = function () {
  var nls = ainspectorSidebar.nlsProperties;
  return {
    ACTION:          nls.getString("info.action"),
    ACTIONS:         nls.getString("info.actions"),

    DEFINITION:      nls.getString("info.definition"),
    COMPLIANCE:      nls.getString("info.compliance"),
    PURPOSE:         nls.getString("info.purpose"),
    TARGET_ELEMENTS: nls.getString("info.target-elements"),
    TECHNIQUES:      nls.getString("info.techniques"),
    WCAG_SC:         nls.getString("info.wcag-sc"),
    INFO_LINKS:      nls.getString("info.info-links"),

    RECOMMENDED:     nls.getString("info.recommended"),
    REQUIRED:        nls.getString("info.required"),
    WCAG_LEVEL:      nls.getString("info.wcag-level")
  };
};

/**
 * @function getResultValueProps
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Get result value text and styling properties based on ruleResult
 *
 * @external OpenAjax.a11y.RULE_RESULT_VALUE
 */

ainspectorSidebar.getResultValueProps = function (ruleResult) {

  var nls = ainspectorSidebar.nlsProperties,
      rvo = {}; // result value object

  switch (ruleResult.getResultValue()) {
  case OpenAjax.a11y.RULE_RESULT_VALUE.VIOLATION:
    rvo.bgcolor = "#FFAEAE";
    rvo.label   = nls.getString("rule.result.violation");
    rvo.tooltip = nls.getString("rule.result.tooltip.violation");
    break;
  case OpenAjax.a11y.RULE_RESULT_VALUE.WARNING:
    rvo.bgcolor = "#FFEC94";
    rvo.label   = nls.getString("rule.result.warning");
    rvo.tooltip = nls.getString("rule.result.tooltip.warning");
    break;
  case OpenAjax.a11y.RULE_RESULT_VALUE.MANUAL_CHECK:
    rvo.bgcolor = "#B4D8E7";
    rvo.label   = nls.getString("rule.result.manual-check");
    rvo.tooltip = nls.getString("rule.result.tooltip.manual-check");
    break;
  case OpenAjax.a11y.RULE_RESULT_VALUE.PASS:
    rvo.bgcolor = "#B0E57C";
    rvo.label   = nls.getString("rule.result.pass");
    rvo.tooltip = nls.getString("rule.result.tooltip.pass");
    break;
  default:
    rvo.bgcolor = "#CCC";
    rvo.label   = nls.getString("rule.result.not-applicable");
    rvo.tooltip = nls.getString("rule.result.tooltip.not-applicable");
    break;
}

  return rvo;
};

/**
 * @function setDetailsSummaryContent
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set the content for top-most vbox of Rule Details.
 *
 * @external OpenAjax.a11y.RuleResult :: ruleResult
 */

ainspectorSidebar.setDetailsSummaryContent = function (ruleResult) {
  var getHTML = ainspectorSidebar.createXHTMLElement,
      addHTML = ainspectorSidebar.appendXHTMLElement,
      pFirstStyle = ainspector.html.pFirstStyle,
      ruleSummaryVbox, ruleSummary,
      p, resultValueLabel, rvo,
      stylePrefix, ruleInfo;

  // Summary
  ruleSummaryVbox = document.getElementById("ainspector-rule-summary");
  ainspectorSidebar.clearContent(ruleSummaryVbox);

  ruleSummary = ruleResult.getRuleSummary();
  p = getHTML("p", ruleSummary, pFirstStyle);
  addHTML(ruleSummaryVbox, p, 2);

  // Result Value
  resultValueLabel = document.getElementById("ainspector-rule-result-value");
  rvo = ainspectorSidebar.getResultValueProps(ruleResult);
  stylePrefix = "font-weight: bold; margin: 0; text-align: center;";
  resultValueLabel.setAttribute("style", stylePrefix + " background-color: " + rvo.bgcolor + ";");
  resultValueLabel.value = rvo.label;
  resultValueLabel.setAttribute("tooltiptext", rvo.tooltip);
  resultValueLabel.hidden = false;

  // ARIA info
  ruleInfo = ainspectorSidebar.viewTitle.value + ": " + ruleSummary;
  ruleSummaryVbox.setAttribute("role", "region");
  ruleSummaryVbox.setAttribute("aria-label", ruleInfo + ', ' + rvo.tooltip);
};

/**
 * @function setDetailsRuleInfoContent
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Set the content for the Rule Information vbox/tabpanel of Rule Details.
 *
 * @external OpenAjax.a11y.Rule :: rule
 * @external OpenAjax.a11y.RuleResult :: ruleResult
 */

ainspectorSidebar.setDetailsRuleInfoContent = function (ruleResult) {
  var getHTML = ainspectorSidebar.createXHTMLElement,
      addHTML = ainspectorSidebar.appendXHTMLElement,
      h2FirstStyle = ainspector.html.h2FirstStyle,
      h2Style      = ainspector.html.h2Style,
      pFirstStyle  = ainspector.html.pFirstStyle,
      pStyle       = ainspector.html.pStyle,
      ulStyle      = ainspector.html.ulStyle,
      rule         = ruleResult.getRule(),
      vbox, labels, ruleType,
      actionMessages, actionLabel,
      posStyle, purposes, techniques,
      primary, related, infoLinks,
      div, h2, p, ul, li, a;

  vbox = document.getElementById("ainspector-details-rule-info");
  ainspectorSidebar.clearContent(vbox);

  // create container div element with id
  div = getHTML("div", null, { "id": "ainspector-div-rule-info" });
  addHTML(vbox, div);

  // get prefix labels
  labels = ainspectorSidebar.getRuleInfoLabels();

  ruleType = ruleResult.isRuleRequired() ? labels.REQUIRED : labels.RECOMMENDED;

  // Definition
  h2 = getHTML("h2", labels.DEFINITION, h2FirstStyle);
  addHTML(div, h2);

  p = getHTML("p", ruleResult.getRuleDefinition(), pFirstStyle);
  addHTML(div, p, 2);

  // Action
  actionMessages = ruleResult.getResultMessagesArray();
  actionLabel = actionMessages.length > 1 ? labels.ACTIONS : labels.ACTION;

  h2 = getHTML("h2", actionLabel, h2Style);
  addHTML(div, h2);

  for (let i = 0; i < actionMessages.length; i++) {
    posStyle = (i === 0) ? pFirstStyle : pStyle;
    p = getHTML("p", actionMessages[i] + "\n", posStyle);
    addHTML(div, p);
  }

  // Purpose
  h2 = getHTML("h2", labels.PURPOSE, h2Style);
  addHTML(div, h2);

  purposes = rule.getPurpose();
  if (purposes.length === 1) {
    p = getHTML("p", purposes[0], pFirstStyle);
    addHTML(div, p, 2);
  }
  else {
    ul = getHTML("ul", null, ulStyle);
    for (let i = 0; i < purposes.length; i++) {
      li = getHTML("li", purposes[i], null);
      addHTML(ul, li);
    }
    addHTML(div, ul);
  }

  // Techniques
  h2 = getHTML("h2", labels.TECHNIQUES, h2Style);
  addHTML(div, h2);

  ul = getHTML("ul", null, ulStyle);
  techniques = rule.getTechniques();
  for (let i = 0; i < techniques.length; i++) {
    li = getHTML("li", techniques[i], null);
    addHTML(ul, li);
  }
  addHTML(div, ul);

  // Target Elements
  h2 = getHTML("h2", labels.TARGET_ELEMENTS, h2Style);
  addHTML(div, h2);

  p = getHTML("p", rule.getTargetResources().join(", "), pFirstStyle);
  addHTML(div, p, 2);

  // Compliance
  h2 = getHTML("h2", labels.COMPLIANCE, h2Style);
  addHTML(div, h2);

  p = getHTML("p", labels.WCAG_LEVEL + rule.getWCAG20Level() + "; " + ruleType, pFirstStyle);
  addHTML(div, p, 2);

  // WCAG Success Criteria
  h2 = getHTML("h2", labels.WCAG_SC, h2Style);
  addHTML(div, h2);

  // Primary Criterion
  ul = getHTML("ul", null, ulStyle);
  primary = rule.getPrimarySuccessCriterion();
  li = getHTML("li", null, null);
  a = getHTML("a", primary.title, {
    "href": primary.url_spec,
    "target": "_blank",
    "style": "text-decoration: underline"
  });
  li.appendChild(a);
  addHTML(ul, li);

  // Related Criteria
  related = rule.getRelatedSuccessCriteria();
  for (let i = 0; i < related.length; i++) {
    li = getHTML("li", null, null);
    a = getHTML("a", related[i].title, {
      "href": related[i].url_spec,
      "target": "_blank",
      "style": "text-decoration: underline"
    });
    li.appendChild(a);
    addHTML(ul, li);
  }
  addHTML(div, ul);

  // Informational Links
  h2 = getHTML("h2", labels.INFO_LINKS, h2Style);
  addHTML(div, h2);

  ul = getHTML("ul", null, ulStyle);
  infoLinks = rule.getInformationalLinks();
  for (let i = 0; i < infoLinks.length; i++) {
    li = getHTML("li", null, null);
    a = getHTML("a", infoLinks[i].title, {
      "href": infoLinks[i].url,
      "target": "_blank",
      "style": "text-decoration: underline"
    });
    li.appendChild(a);
    addHTML(ul, li);
  }
  addHTML(div, ul);

  // set ARIA attributes
  vbox.setAttribute("role", "region");
  vbox.setAttribute("aria-labelledby", "ainspector-div-rule-info");

  // Scroll to the top for initial view
  vbox.scrollTop = 0;
};
