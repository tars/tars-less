'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var less = tars.packages.less;;
var gulpif = tars.packages.gulpif;
var plumber = tars.packages.plumber;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var replace = tars.packages.replace;
var sourcemaps = tars.packages.sourcemaps;
var importify = tars.packages.importify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var through2 = tars.packages.through2;

var postcssProcessors = tars.config.postcss;
var lessFolderPath = './markup/' + tars.config.fs.staticFolderName + '/less';
var lessFilesToConcatinate = [
        lessFolderPath + '/normalize.less',
        lessFolderPath + '/libraries/**/*.less',
        lessFolderPath + '/libraries/**/*.css',
        lessFolderPath + '/mixins.less',
        lessFolderPath + '/sprites-less/sprite_96.less',
        lessFolderPath + '/sprites-less/sprite-png.less'
    ];
var lessFilesToConcatinateForIe9;
var patterns = [];
var processors = [];
var processorsIE9 = [];
var generateSourceMaps = tars.config.sourcemaps.css.active && !tars.flags.release && !tars.flags.min;
var sourceMapsDest = tars.config.sourcemaps.css.inline ? '' : '.';

if (postcssProcessors && postcssProcessors.length) {
    postcssProcessors.forEach(function (processor) {
        processors.push(require(processor.name)(processor.options));
        processorsIE9.push(require(processor.name)(processor.options));
    });
}

processorsIE9.push(autoprefixer({browsers: ['ie 9']}));

if (tars.config.autoprefixerConfig) {
    processors.push(
        autoprefixer({browsers: tars.config.autoprefixerConfig})
    );
}

if (tars.config.useSVG) {
    lessFilesToConcatinate.push(
        lessFolderPath + '/sprites-less/svg-sprite.less'
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
    '!./**/_*.less',
    '!./**/_*.css'
);

lessFilesToConcatinateForIe9 = lessFilesToConcatinate.slice();
lessFilesToConcatinate.push(lessFolderPath + '/etc/**/*.less');
lessFilesToConcatinateForIe9.push(
    './markup/modules/*/ie/ie9.less',
    lessFolderPath + '/etc/**/*.less'
);

patterns.push(
    {
        match: '%=staticPrefixForCss=%',
        replacement: tars.config.staticPrefixForCss()
    }
);

/**
 * Less compilation
 */
module.exports = function () {

    return gulp.task('css:compile-css', function () {

        var mainStream = gulp.src(lessFilesToConcatinate, { base: process.cwd() });
        var ie9Stream = gulp.src(lessFilesToConcatinateForIe9, { base: process.cwd() });

        if (tars.flags.ie9 || tars.flags.ie) {
            ie9Stream
                .pipe(plumber({
                    errorHandler: function (error) {
                        notifier.error('An error occurred while compiling css for IE9.', error);
                    }
                }))
                .pipe(importify('main_ie9.less', {
                    cssPreproc: 'less'
                }))
                .pipe(less({
                    path: [process.cwd()]
                }))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(postcss(processorsIE9))
                .pipe(concat('main_ie9' + tars.options.build.hash + '.css'))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier.success('Less-files for IE9 have been compiled')
                );
        }

        return mainStream
            .pipe(plumber({
                errorHandler: function (error) {
                    notifier.error('An error occurred while compiling css.', error);
                }
            }))
            .pipe(gulpif(generateSourceMaps, sourcemaps.init()))
            .pipe(importify('main.less', {
                cssPreproc: 'less'
            }))
            .pipe(gulp.dest('./dev/temp/'))
            .pipe(less({
                path: [process.cwd()]
            }))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(postcss(processors))
            .pipe(concat('main' + tars.options.build.hash + '.css'))
            .pipe(gulpif(generateSourceMaps, sourcemaps.write(sourceMapsDest)))
            .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
            .pipe(browserSync.reload({ stream: true }))
            .pipe(
                notifier.success('Less-files\'ve been compiled')
            );
    });
};
