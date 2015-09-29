'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var less = tars.packages.less;;
var gulpif = tars.packages.gulpif;
var plumber = tars.packages.plumber;
var addsrc = tars.packages.addsrc;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var replace = tars.packages.replace;
var sourcemaps = tars.packages.sourcemaps;
var notify = tars.packages.notify;
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
        lessFolderPath + '/sprites-less/sprite-png.less'
    ];
var patterns = [];
var processors = [];
var processorsIE9 = [];
var generateSourceMaps = tars.config.sourcemaps.css && !tars.flags.release && !tars.flags.min;

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

        var helperStream = gulp.src(lessFilesToConcatinate, { base: process.cwd() });
        var mainStream = helperStream.pipe(addsrc.append(lessFolderPath + '/etc/**/*.less'));
        var ie9Stream = helperStream.pipe(
                                addsrc.append([
                                        './markup/modules/*/ie/ie9.less',
                                        lessFolderPath + '/etc/**/*.less'
                                    ])
                            );

        if (tars.flags.ie9 || tars.flags.ie) {
            ie9Stream
                .pipe(plumber())
                .pipe(gulpif(generateSourceMaps, sourcemaps.init()))
                .pipe(concat({cwd: process.cwd(), path: 'main_ie9' + tars.options.build.hash + '.css'}))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(less())
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while compiling css for ie9.\nLook in the console for details.\n' + error;
                }))
                .pipe(postcss(processorsIE9))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while postprocessing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulpif(generateSourceMaps, sourcemaps.write()))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier('Less-files for ie9 have been compiled')
                );
        }

        return mainStream
            .pipe(gulpif(generateSourceMaps, sourcemaps.init()))
            .pipe(concat({cwd: process.cwd(), path: 'main' + tars.options.build.hash + '.css'}))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(less())
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while compiling css.\nLook in the console for details.\n' + error;
            }))
            .pipe(postcss(processors))
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while postprocessing css.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulpif(generateSourceMaps, sourcemaps.write()))
            .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
            .pipe(browserSync.reload({ stream: true }))
            .pipe(
                notifier('Less-files\'ve been compiled')
            );
    });
};