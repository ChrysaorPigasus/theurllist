module.exports = {
  default: {
    paths: ['tests/bdd/features/**/*.feature'],
    require: [
      'tests/bdd/step-definitions/**/*.ts',
      'tests/bdd/support/**/*.ts',
      'tests/bdd/pages/**/*.ts'
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