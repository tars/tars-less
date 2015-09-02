'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var svgspritesheet = tars.packages.svgspritesheet;
var notify = tars.packages.notify;
var notifier = tars.helpers.notifier;

var staticFolderName = tars.config.fs.staticFolderName;
var imagesFolderName = tars.config.fs.imagesFolderName;

/**
 * Make sprite for svg and less for this sprite
 * Return pipe with less for sprite
 */
module.exports = function () {

    return gulp.task('css:make-sprite-for-svg', function (cb) {
        if (tars.config.useSVG) {
            return gulp.src('./dev/' + staticFolderName + '/' + imagesFolderName + '/minified-svg/*.svg')
                .pipe(svgspritesheet({
                    cssPathSvg: '',
                    templateSrc: './markup/' + staticFolderName + '/less/sprite-generator-templates/less.svg-sprite.mustache',
                    templateDest: './markup/' + staticFolderName + '/less/sprites-less/svg-sprite.less'
                }))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while making fallback for svg.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulp.dest('./dev/' + staticFolderName + '/' + imagesFolderName + '/svg-sprite/sprite.svg'))
                .pipe(
                    notifier('Less for svg-sprite is ready')
                );
        } else {
            gutil.log('!SVG is not used!');
            cb(null);
        }
    });
};