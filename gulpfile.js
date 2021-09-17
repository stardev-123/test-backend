var gulp = require('gulp')

var apidoc = require('gulp-apidoc')

gulp.task('apidoc', function () {
  apidoc.exec({
    src: './routes/',
    dest: 'doc/',
    includeFilters: ['.*\\.js$']
  })
})
