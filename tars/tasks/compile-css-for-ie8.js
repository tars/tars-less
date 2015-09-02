'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var less = tars.packages.less;
var plumber = tars.packages.plumber;
var autoprefix = tars.packages.autoprefixer;
var replace = tars.packages.replace;
var notify = tars.packages.notify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var lessFolderPath = './markup/' + tars.config.fs.staticFolderName + '/less';
var patterns = [];
var lessFilesToConcatinate = [
        lessFolderPath + '/normalize.less',
        lessFolderPath + '/libraries/**/*.less',
        lessFolderPath + '/libraries/**/*.css',
        lessFolderPath + '/mixins.less',
        lessFolderPath + '/sprites-less/sprite_96.less',
        lessFolderPath + '/sprites-less/sprite-png-ie.less'
    ];

if (tars.config.useSVG) {
    lessFilesToConcatinate.push(
        lessFolderPath + '/sprites-less/svg-fallback-sprite.less'
    );
}

lessFilesToConcatinate.push(
    lessFolderPath + '/fonts.less',
    lessFolderPath + '/vars.less',
    lessFolderPath + '/GUI.less',
    lessFolderPath + '/common.less',
    lessFolderPath + '/plugins/**/*.less',
    lessFolderPath + '/plugins/**/*.css',
    './markup/modules/*/*.less',
    './markup/modules/*/ie/ie8.less',
    lessFolderPath + '/etc/**/*.less'
);

patterns.push(
    {
        match: '%=staticPrefixForCss=%',
        replacement: tars.config.staticPrefixForCss()
    }
);

/**
 * Less compilation for ie8
 */
module.exports = function () {

    return gulp.task('css:compile-css-for-ie8', function (cb) {
        if (tars.flags.ie8) {
            return gulp.src(lessFilesToConcatinate)
                .pipe(plumber())
                .pipe(concat('main_ie8' + tars.options.build.hash + '.css'))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(less())
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while compiling css for ie8.\nLook in the console for details.\n' + error;
                }))
                .pipe(autoprefix('ie 8', { cascade: true }))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier('Less-files for ie8 have been compiled.')
                );
        } else {
            gutil.log('!Stylies for ie8 are not used!');
            cb(null);
        }
    });
};