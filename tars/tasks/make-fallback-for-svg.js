var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var tarsConfig = require('../../../tars-config');
var notifier = require('../../helpers/notifier');
var browserSync = require('browser-sync');

/**
 * Make sprite for svg-fallback and less for this sprite
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    return gulp.task('css:make-fallback-for-svg', function(cb) {

        var spriteData = '';

        if (tarsConfig.useSVG && gutil.env.ie8) {

            spriteData = gulp.src('./dev/' + tarsConfig.fs.staticFolderName + '/' + tarsConfig.fs.imagesFolderName + '/rastered-svg-images/*.png')
                .pipe(
                    spritesmith(
                        {
                            imgName: 'svg-fallback-sprite.png',
                            cssName: 'svg-fallback-sprite.less',
                            Algorithms: 'diagonal',
                            engineOpts: {
                                imagemagick: true
                            },
                            cssTemplate: './markup/' + tarsConfig.fs.staticFolderName + '/less/sprite-generator-templates/less.svg-fallback-sprite.mustache'
                        }
                    )
                )
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while making fallback for svg.\nLook in the console for details.\n' + error;
                }));

            spriteData.img.pipe(gulp.dest('./dev/' + tarsConfig.fs.staticFolderName + '/' + tarsConfig.fs.imagesFolderName + '/rastered-svg-sprite/'))
                .pipe(
                    notifier('Sprite img for svg is ready')
                );

            return spriteData.css.pipe(gulp.dest('./markup/' + tarsConfig.fs.staticFolderName + '/less/sprites-less/'))
                    .pipe(browserSync.reload({stream:true}))
                    .pipe(
                        notifier('Less for svg-sprite is ready')
                    );

        }  else {
            gutil.log('!SVG is not used!');
            cb(null);
        }
    });
};