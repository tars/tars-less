var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var gulpif = require('gulp-if');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var tarsConfig = require('../../../tars-config');
var notifyConfig = tarsConfig.notifyConfig;
var modifyDate = require('../../helpers/modifyDateFormatter');
var browserSync = require('browser-sync');

var dpi = tarsConfig.useImagesForDisplayWithDpi;

/**
 * Make sprite and less for this sprite
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    return gulp.task('make-sprite', function() {

        var spriteData = [],
            dpiLength = dpi.length,
            dpi192 = false,
            dpi288 = false,
            dpi384 = false;

        for (var i = 0; i < dpiLength; i++) {
            if (dpi[i] == 192) {
                dpi192 = true;
            } else if (dpi[i] === 288) {
                dpi288 = true;
            } else if (dpi[i] === 384) {
                dpi384 = true;
            }
        }

        for (var i = 0; i < dpiLength; i++) {
            spriteData.push(gulp.src('./markup/' + tarsConfig.fs.staticFolderName + '/' + tarsConfig.fs.imagesFolderName + '/sprite/' + dpi[i] + 'dpi/*.png')
                .pipe(
                    spritesmith(
                        {
                            imgName: 'sprite.png',
                            cssName: 'sprite' + dpi[i] + '.less',
                            Algorithms: 'diagonal',
                            // padding: 4 * dpi[i],
                            engineOpts: {
                                imagemagick: true
                            },
                            cssOpts: {
                                dpi192: dpi192,
                                dpi288: dpi288,
                                dpi384: dpi384
                            },
                            cssTemplate: './markup/' + tarsConfig.fs.staticFolderName + '/less/spriteGeneratorTemplates/less.sprite.mustache'
                        }
                    )
                )
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while making png-sprite.\nLook in the console for details.\n' + error;
                }))
            );

            spriteData[i].img.pipe(gulp.dest('./dev/' + tarsConfig.fs.staticFolderName + '/' + tarsConfig.fs.imagesFolderName + '/pngSprite/' + dpi[i] + 'dpi/'))
                .pipe(
                    gulpif(notifyConfig.useNotify,
                        notify({
                            onLast: true,
                            sound: notifyConfig.sounds.onSuccess,
                            title: notifyConfig.title,
                            message: 'Sprite img with dpi = ' + dpi[i] + ' is ready. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                            templateOptions: {
                                date: modifyDate.getTimeOfModify()
                            }
                        })
                    )
                );
        }

        return spriteData[0].css.pipe(gulp.dest('./markup/' + tarsConfig.fs.staticFolderName + '/less/spritesLess/'))
                .pipe(browserSync.reload({stream:true}))
                .pipe(
                    gulpif(notifyConfig.useNotify,
                        notify({
                            onLast: true,
                            sound: notifyConfig.sounds.onSuccess,
                            title: notifyConfig.title,
                            message: 'Less for sprites is ready. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                            templateOptions: {
                                date: modifyDate.getTimeOfModify()
                            }
                        })
                    )
                );
        });
};