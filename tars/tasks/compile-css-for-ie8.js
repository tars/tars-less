'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var less = tars.packages.less;
var plumber = tars.packages.plumber;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var replace = tars.packages.replace;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var postcssProcessors = tars.config.postcss;
var lessFolderPath = './markup/' + tars.config.fs.staticFolderName + '/less';
var lessFilesToConcatinate = [
        lessFolderPath + '/normalize.less',
        lessFolderPath + '/libraries/**/*.less',
        lessFolderPath + '/libraries/**/*.css',
        lessFolderPath + '/mixins.less',
        lessFolderPath + '/sprites-less/sprite_96.less',
        lessFolderPath + '/sprites-less/sprite-png-ie.less'
    ];
var patterns = [];
var processors = [];

if (postcssProcessors && postcssProcessors.length) {
    postcssProcessors.forEach(function (processor) {
        processors.push(require(processor.name)(processor.options));
    });
}

processors.push(autoprefixer({browsers: ['ie 8']}));

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
    lessFolderPath + '/etc/**/*.less',
    '!./**/_*.less',
    '!./**/_*.css'
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
        if (tars.flags.ie8 || tars.flags.ie) {
            return gulp.src(lessFilesToConcatinate, { base: process.cwd() })
                .pipe(plumber({
                    errorHandler: function (error) {
                        notifier.error('An error occurred while compiling css for IE8.', error);
                    }
                }))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(less())
                .pipe(postcss(processors))
                .pipe(concat({cwd: process.cwd(), path: 'main_ie8' + tars.options.build.hash + '.css'}))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier.success('Less-files for IE8 have been compiled.')
                );
        } else {
            gutil.log('!Stylies for IE8 are not used!');
            cb(null);
        }
    });
};
