/**
 * @file datasource.js
 *
 * @desc Provide datasource API that mediates between the OAA Evaluation
 *       Library and any of the sidebar view controllers.
 *
 *       The following methods are defined here, all as properties of
 *       ainspectorSidebar:
 *
 *       evaluate()
 *       storeAllRuleGroupResults()
 *       getRuleGroupResults(viewIndex)
 *       getSummaryData(viewIndex)
 *       getRuleGroupConst(viewIndex)
 *
 * @external OpenAjax.a11y
 */

/**
 * @function evaluate
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Perform an evaluation of the currently displayed web page and store
 *       the result in namespace global ainspectorSidebar.evaluationResult.
 *       Additionally, call the storeAllRuleGroupResults fn. to cache the
 *       RuleGroupResult objects for each category and guideline.
 *
 * @external OpenAjax.a11y.CONSOLE_MESSAGES
 * @external OpenAjax.a11y.RulesetManager
 * @external OpenAjax.a11y.Ruleset :: getRuleset()
 * @external OpenAjax.a11y.EvaluatorFactory :: evaluationFactory
 * @external OpenAjax.a11y.Evaluator :: evaluator
 * @external OpenAjax.a11y.EvaluationResult :: evaluationResult
 *
 * @global ainspectorSidebar.evaluationResult
 * @global ainspectorSidebar.newEvaluation
 */

ainspectorSidebar.evaluate = function () {
  var doc, url, ruleset;

  function getRuleset() {
    var prefValue  = ainspector.evaluationPrefs.getPref('ruleset');

    switch (prefValue) {
    case 1:
      return OpenAjax.a11y.RulesetManager.getRuleset('ARIA_TRANS');
    case 2:
      return OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT');
    default:
      ainspector.reportError("Invalid ruleset preference value: " + prefValue);
      break;
    }
  }

  // Get document info from browser context
  try {
    doc = window.content.document;
    url = window.content.location.href;
  }
  catch (e) {
    doc = window.opener.parent.content.document;
    url = window.opener.parent.location.href;
  }

  // Set options in evaluation library
  OpenAjax.a11y.CONSOLE_MESSAGES = false;

  // Get and configure an evaluatorFactory
  let evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();
  evaluatorFactory.setParameter('ruleset', getRuleset());
  evaluatorFactory.setFeature('eventProcessing',   'firefox');
  evaluatorFactory.setFeature('brokenLinkTesting', false);

  // Get the evaluator
  let evaluator = evaluatorFactory.newEvaluator();

  // Perform the evaluation
  ainspectorSidebar.evaluationResult = evaluator.evaluate(doc, doc.title, url);
  ainspectorSidebar.newEvaluation = true;

  // Store the evaluation results by various groups
  ainspectorSidebar.storeAllRuleGroupResults();
};

/**
 * @function storeAllRuleGroupResults
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Store references to all RuleGroupResult objects, each associated with
 *       a particular view in AInspector Sidebar, in the namespace global
 *       ainspectorSidebar.ruleGroupResults array.
 *
 * @external OpenAjax.a11y.EvaluationResult
 * @external OpenAjax.a11y.RuleGroupResult
 *
 * @global ainspectorSidebar.ruleGroupResults
 */

ainspectorSidebar.storeAllRuleGroupResults = function () {
  var view = ainspector.viewEnum,
      numViews = ainspectorSidebar.numViews,
      ruleGroupConst;

  // Initialize ruleGroupResults array
  ainspectorSidebar.ruleGroupResults = new Array(numViews);

  for (let viewIndex = 0; viewIndex < numViews; viewIndex++) {
    ruleGroupConst = ainspectorSidebar.getRuleGroupConst(viewIndex);

    // Store all RuleGroupResult objects in ruleGroupResults array
    ainspectorSidebar.ruleGroupResults[viewIndex] = (viewIndex > view.ALL_RULES) ?
      ainspectorSidebar.evaluationResult.getRuleResultsByGuideline(ruleGroupConst) :
      ainspectorSidebar.evaluationResult.getRuleResultsByCategory(ruleGroupConst);
  }
};

/**
 * @function getRuleGroupResults
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Get the RuleGroupResult object at viewIndex from the namespace global
 *       ainspectorSidebar.ruleGroupResults array, which is populated at each
 *       evaluation.
 *
 * @global ainspectorSidebar.ruleGroupResults
 *
 * @returns {Object} OpenAjax.a11y.RuleGroupResult
 */

ainspectorSidebar.getRuleGroupResults = function (viewIndex) {
  return ainspectorSidebar.ruleGroupResults[viewIndex];
};

/**
 * @function getSummaryData
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Return summary data object for consumption by XBL summary-data objects
 *
 * @external OpenAjax.a11y.RuleGroupResult :: results
 * @external OpenAjax.a11y.RuleResultsSummary :: summary
 */

ainspectorSidebar.getSummaryData = function (viewIndex) {
  var results, summary, data;

  // Retrieve rule results based on current view
  results = ainspectorSidebar.getRuleGroupResults(viewIndex);

  // Get the summary info from rule results
  summary = results.getRuleResultsSummary();

  // Return null data if no results
  if (!summary.hasResults()) return ainspector.nullData;

  data = {
    pass:  summary.passed,
    viol:  summary.violations,
    warn:  summary.warnings,
    mc:    summary.manual_checks
  };

  return data;
};

/**
 * @function getRuleGroupConst
 *
 * @memberOf ainspectorSidebar
 *
 * @desc Return the RULE_CATEGORIES or WCAG20_GUIDELINE constant that
 *       corresponds to an AInspector Sidebar viewEnum constant.
 *
 * @external OpenAjax.a11y.RULE_CATEGORIES
 * @external OpenAjax.a11y.WCAG20_GUIDELINE
 */

ainspectorSidebar.getRuleGroupConst = function (viewIndex) {
  var view = ainspector.viewEnum;

  switch (viewIndex) {
  case view.SUMMARY:
    return OpenAjax.a11y.RULE_CATEGORIES.ALL;

  case view.LANDMARKS:
    return OpenAjax.a11y.RULE_CATEGORIES.LANDMARKS;

  case view.HEADINGS:
    return OpenAjax.a11y.RULE_CATEGORIES.HEADINGS;

  case view.STYLES:
    return OpenAjax.a11y.RULE_CATEGORIES.STYLES_READABILITY;

  case view.IMAGES:
    return OpenAjax.a11y.RULE_CATEGORIES.IMAGES;

  case view.LINKS:
    return OpenAjax.a11y.RULE_CATEGORIES.LINKS;

  case view.TABLES:
    return OpenAjax.a11y.RULE_CATEGORIES.TABLES;

  case view.FORMS:
    return OpenAjax.a11y.RULE_CATEGORIES.FORMS;

  case view.WIDGETS:
    return OpenAjax.a11y.RULE_CATEGORIES.WIDGETS_SCRIPTS;

  case view.MEDIA:
    return OpenAjax.a11y.RULE_CATEGORIES.AUDIO_VIDEO;

  case view.KEYBOARD:
    return OpenAjax.a11y.RULE_CATEGORIES.KEYBOARD_SUPPORT;

  case view.TIMING:
    return OpenAjax.a11y.RULE_CATEGORIES.TIMING;

  case view.NAVIGATION:
    return OpenAjax.a11y.RULE_CATEGORIES.SITE_NAVIGATION;

  case view.ALL_RULES:
    return OpenAjax.a11y.RULE_CATEGORIES.ALL;

  case view.WCAG_1_1:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_1_1;

  case view.WCAG_1_2:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_1_2;

  case view.WCAG_1_3:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_1_3;

  case view.WCAG_1_4:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_1_4;

  case view.WCAG_2_1:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_2_1;

  case view.WCAG_2_2:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_2_2;

  case view.WCAG_2_3:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_2_3;

  case view.WCAG_2_4:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_2_4;

  case view.WCAG_3_1:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_3_1;

  case view.WCAG_3_2:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_3_2;

  case view.WCAG_3_3:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_3_3;

  case view.WCAG_4_1:
    return OpenAjax.a11y.WCAG20_GUIDELINE.G_4_1;

  default:
    break;
  }

  return 0;
};
