module.exports = {
  default: {
    paths: ['tests/bdd/features/**/*.feature'],
    require: [
      'tests/bdd/steps/**/*.jsx',
      'tests/bdd/support/**/*.jsx',
      'tests/bdd/pages/**/*.jsx'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'summary',
      'progress-bar',
      ['html', 'cucumber-report.html']
    ],
    publishQuiet: true
  }
};