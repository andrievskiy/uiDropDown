/**
 * Created by andrievskiy on 03.06.17.
 */
var DIST_PATH = 'dist/';


var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');


var PATCHES = {
    'js': [
        'src/js/util/**/*.js',
        'src/js/_uiDropDownSuggestionItem.js',
        'src/js/_uiDropDownSelectedSuggestionItem.js',
        'src/js/_uiDropDownUsersMatcher.js',
        'src/js/uiDropDownWidget.js'
    ],
    'style': 'src/style/**/*.scss'
};


var jsDistPath = function () {
    return DIST_PATH + 'js';
};

var styleDistPath = function () {
    return DIST_PATH + 'css'
};


function makeBundle(src, targetFileName, targetDir) {
    return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(concat(targetFileName))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(targetDir))
        .pipe(livereload());
}


gulp.task('buildJs', function () {
    return makeBundle(PATCHES.js, 'ui-drop-down.js', jsDistPath());
});

gulp.task('buildStyle', function () {
    return gulp.src(PATCHES.style)
        .pipe(sass())
        .pipe(gulp.dest(styleDistPath()))
        .pipe(livereload());
});

gulp.task('build', ['buildJs', 'buildStyle']);

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(PATCHES.js, ['buildJs']);
    gulp.watch(PATCHES.style, ['buildStyle']);
});

gulp.task('default', ['watch']);