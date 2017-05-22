// 'use strict';
// var gulp = require('gulp'),
// 	less = require('gulp-less'),
// 	browserSync = require('browser-sync').create(); // Подключаем Browser Sync
// var autoprefixer = require('gulp-autoprefixer');
// var browserSyncSpa = require('browser-sync-spa');

// //Сборка less
// gulp.task('less', function () {
//     return gulp.src('app/less/**/*.less')
//         .pipe(less())
//         .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
//         // .pipe(uncss({
//         //     html: ['index.html']
//         //   }))
//         .pipe(gulp.dest('app/css'))
//         .pipe(browserSync.reload({stream:true}))// Обновляем CSS на странице при изменении
// });

//     gulp.task('browser-sync', function() { // Создаем таск browser-sync
//         browserSync.use(browserSyncSpa({
//         selector: '[ng-app]'
//     }));

//     browserSync.init({ // Выполняем browser Sync
//         server: { // Определяем параметры сервера
//             baseDir: 'app', // Директория для сервера - app
//             routes: {
//                 "/bower_components": "bower_components",
//                 "/node_modules": "node_modules"
//             }
//         },
//     });
// });

// gulp.task('watch',['browser-sync','less'],function(){
//     gulp.watch("app/**/*.*").on('change', browserSync.reload);
// 	gulp.watch('app/less/**/*.less',['less']);		//наблюдаемые файлы и задача
// 	gulp.watch('app/**/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
//     gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS
// });

// gulp.task('default', ['watch']);
'use strict';
var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    // spritesmith = require('gulp.spritesmith'); //спрайты
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-minify-css'),
    cache = require('gulp-cache'), // Подключаем библиотеку кеширования
    imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    prefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'), //cлияние файлов
    cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename  = require('gulp-rename'); // Подключаем библиотеку для переименования файлов
    // eslint = require('gulp-eslint');
var browserSyncSpa = require('browser-sync-spa');

// var firebase = require("firebase");

gulp.task('lint', () => {
    return gulp.src(['**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Создание спрайтов
// gulp.task('sprite-create', function () {
//     var fileName = 'sprite-' + Math.random().toString().replace(/[^0-9]/g, '') + '.png';

//     var spriteData = 
//         gulp.src('app/img/sprite/*.png')
//         .pipe(spritesmith({
//             imgName: fileName,
//             cssName: 'sprite.less',
//             cssFormat: 'less',
//             algorithm: 'binary-tree',
//             // cssTemplate: 'stylus.template.mustache',
//             // padding:1,
//             cssVarMap: function (sprite) {
//                 sprite.name = 'icon-' + sprite.name;
//             },
//              // imgPath: 'app/img/sprites/' + fileName
//         }));

//     spriteData.img
//         .pipe(gulp.dest('app/img/sprites/'));

//     spriteData.css
//         .pipe(gulp.dest('app/less/'));

//     return spriteData;
// });

//Сборка less
gulp.task('less', function () {
    return gulp.src('app/less/**/*.less')
        .pipe(less())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        // .pipe(uncss({
        //     html: ['index.html']
        //   }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream:true}))// Обновляем CSS на странице при изменении
});

gulp.task('merge', function() {  
    return gulp.src('app/css/*.css')
        .pipe(concat('style.css'))
        .pipe(gulp.dest('app/css'))
});

gulp.task('css-libs', ['less', 'merge'], function() {
    return gulp.src('app/css/style.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync.use(browserSyncSpa({
        selector: '[ng-app]'
    }));
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('watch',['browser-sync','css-libs', 'scripts'],function(){
    gulp.watch('app/less/**/*.less',['less']);      //наблюдаемые файлы и задача
    gulp.watch('app/style.min.css', browserSync.reload);
    gulp.watch('app/**/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS
});

gulp.task('img', function() {
    return gulp.src('app/img/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['img','less', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'app/css/style.min.css'
        ])
    .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));

});



gulp.task('default', ['watch']);
