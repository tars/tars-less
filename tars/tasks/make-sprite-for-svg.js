'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var svgspritesheet = tars.packages.svgspritesheet;
var plumber = tars.packages.plumber;
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
                .pipe(plumber({
                    errorHandler: function (error) {
                        notifier.error('An error occurred while making sprite for svg.', error);
                    }
                }))
                .pipe(svgspritesheet({
                    cssPathSvg: '',
                    templateSrc: './markup/' + staticFolderName + '/less/sprite-generator-templates/less.svg-sprite.mustache',
                    templateDest: './markup/' + staticFolderName + '/less/sprites-less/svg-sprite.less'
                }))
                .pipe(gulp.dest('./dev/' + staticFolderName + '/' + imagesFolderName + '/svg-sprite/sprite.svg'))
                .pipe(
                    notifier.success('Less for svg-sprite is ready')
                );
        } else {
            gutil.log('!SVG is not used!');
            cb(null);
        }
    });
};
