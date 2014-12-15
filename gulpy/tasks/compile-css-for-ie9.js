var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var autoprefix = require('gulp-autoprefixer');
var replace = require('gulp-replace-task');
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
    ];

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
        './markup/modules/*/ie/ie9.less',
        './markup/' + projectConfig.fs.staticFolderName + '/less/etc/**/*.less'
    );

/**
 * Less compilation for ie9
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    var patterns = [];

    patterns.push(
        {
            match: '%=staticPrefix=%',
            replacement: projectConfig.staticPrefix
        }
    );

    return gulp.task('compile-css-for-ie9', function(cb) {
        if (gutil.env.ie9) {
            return gulp.src(lessFilesToConcatinate)
                .pipe(plumber())
                .pipe(concat('main_ie9' + buildOptions.hash + '.css'))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(less())
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while compiling css for ie9.\nLook in the console for details.\n' + error;
                }))
                .pipe(autoprefix('ie 9', { cascade: true }))
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
                            message: 'Less-files for ie9 have been compiled. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                            templateOptions: {
                                date: modifyDate.getTimeOfModify()
                            }
                        })
                    )
                );
        } else {
            gutil.log('!Stylies for ie9 are not used!');
            cb(null);
        }
    });
};