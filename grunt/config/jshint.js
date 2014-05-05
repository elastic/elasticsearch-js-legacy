module.exports = {
  source: {
    src: [
      'src/**/*.js -src/_*/**/*',
      'scripts/**/*.js',
      'test/unit/specs/**/*.js',
      'grunt/**/*.js',
      'Gruntfile.js'
    ],
    options: {
      jshintrc: true
    }
  }
};