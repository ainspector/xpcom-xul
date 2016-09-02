/**
 * @file ai-common.js
 *
 * @desc Provide a shared namespace for use among all scripts.
 */

var EXPORTED_SYMBOLS = ["ainspector"];

/**
 * @namespace ainspector
 */

/* global ainspector: true */

var ainspector = {
  // property names for viewEnum object
  viewStrings: [
    'SUMMARY',
    'LANDMARKS',
    'HEADINGS',
    'STYLES',
    'IMAGES',
    'LINKS',
    'TABLES',
    'FORMS',
    'WIDGETS',
    'MEDIA',
    'KEYBOARD',
    'TIMING',
    'NAVIGATION',
    'ALL_RULES',
    'WCAG_1_1',
    'WCAG_1_2',
    'WCAG_1_3',
    'WCAG_1_4',
    'WCAG_2_1',
    'WCAG_2_2',
    'WCAG_2_3',
    'WCAG_2_4',
    'WCAG_3_1',
    'WCAG_3_2',
    'WCAG_3_3',
    'WCAG_4_1'
  ],

  // used for reporting add-on run-time errors
  reportError: Components.utils.reportError,

  // object returned by getSummaryData fn. when ResultSummary has no data
  nullData: {
    pass:    '--',
    viol:    '--',
    warn:    '--',
    mc:      '--',
    hidden:  '--'
  },

  // HTML styling objects
  html: {
    h2FirstStyle: { "style": "margin: 0; margin-top: 0; font-size: inherit; font-weight: bold" },
    h2Style:      { "style": "margin: 0; margin-top: 1em; font-size: inherit; font-weight: bold" },
    pFirstStyle:  { "style": "margin: 0" },
    pStyle:       { "style": "margin: 0; margin-top: 0.5em" },
    ulStyle:      { "style": "margin: 0; padding: 0; padding-left: 2em" }
  }
};
