var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var autoprefix = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var projectConfig = require('../../../projectConfig');
var notifyConfig = projectConfig.notifyConfig;
var modifyDate = require('../../helpers/modifyDateFormatter');
var browserSync = require('browser-sync');

var lessFilesToConcatinate = [
        './markup/' + projectConfig.fs.staticFolderName + '/less/normalize.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/mixins.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/spritesLess/sprite96.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/spritesLess/sprite.less'
    ],

    autoprefixerConfig = projectConfig.autoprefixerConfig.join(',');

    if (projectConfig.useSVG) {
        lessFilesToConcatinate.push(
            './markup/' + projectConfig.fs.staticFolderName + '/less/spritesLess/svg-fallback-sprite.less',
            './markup/' + projectConfig.fs.staticFolderName + '/less/spritesLess/svg-sprite.less'
        );
    }

    lessFilesToConcatinate.push(
        './markup/' + projectConfig.fs.staticFolderName + '/less/fonts.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/vars.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/GUI.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/common.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/plugins/**/*.less',
        './markup/modules/*/*.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/etc/**/*.less'
    );

/**
 * Less compilation
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    return gulp.task('compile-css', function(cb) {
        gulp.src(lessFilesToConcatinate)
            .pipe(concat('main' + buildOptions.hash + '.css'))
            .pipe(less())
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while compiling css.\nLook in the console for details.\n' + error;
            }))
            .pipe(autoprefix(autoprefixerConfig, { cascade: true }))
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulp.dest('./dev/' + projectConfig.fs.staticFolderName + '/css/'))
            .pipe(browserSync.reload({stream:true}))
            .pipe(
                gulpif(notifyConfig.useNotify,
                    notify({
                        onLast: true,
                        sound: notifyConfig.sounds.onSuccess,
                        title: notifyConfig.title,
                        message: 'Less-files\'ve been compiled. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                        templateOptions: {
                            date: modifyDate.getTimeOfModify()
                        }
                    })
                )
            );

            cb(null);
        });
};