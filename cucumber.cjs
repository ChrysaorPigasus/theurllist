module.exports = {
  default: {
    paths: ['tests/bdd/features/*.feature'],
    require: [
      'tests/bdd/cucumber-setup.cjs',
      'tests/bdd/steps/**/*.{jsx,cjs}',
      'tests/bdd/support/**/*.jsx',
      'tests/bdd/pages/**/*.jsx'
    ],
    format: [
      'summary',
      'progress-bar',
      ['html', 'cucumber-report.html']
    ],
    publishQuiet: true
  }
};