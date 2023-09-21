`use strict`;

const gulp = require(`gulp`);

process.env.NODE_ENV = `production`;
const root = '../../aikeedo/public/themes/default/';

let assets = [
    `./*/**/*`,
    `!./node_modules/**/*`,
    `!./assets/**/*.css`, // CSS files
    `!./assets/**/*.js`, // JS files
];

gulp.task('assets', () => {
    return gulp
        .src(assets, { nodir: true })
        .pipe(gulp.dest(root));
});

gulp.task('css', () => {
    const postcss = require('gulp-postcss')
    const sourcemaps = require('gulp-sourcemaps')

    return gulp.src('./assets/css/index.css')
        .pipe(require('gulp-rename')('theme.css'))
        .pipe(sourcemaps.init())
        .pipe(postcss([
            require('postcss-import'),
            require('postcss-nested'),
            require('autoprefixer')
        ]))
        .pipe(postcss([
            require("tailwindcss")('./tailwind.config.js')
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${root}/assets/`))
})

gulp.task(`js`, () => {
    return require('rollup')
        .rollup({
            input: `./assets/js/index.js`,
            plugins: [
                require('@rollup/plugin-node-resolve')({
                    browser: true
                }),
                require('@rollup/plugin-commonjs')({
                    transformMixedEsModules: true
                }),
                require('@rollup/plugin-babel')({ babelHelpers: 'bundled' }),
                require('@rollup/plugin-replace')({
                    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
                    preventAssignment: true
                }),
            ],
            context: 'window',
        })
        .then(bundle => {
            return bundle.write({
                file: `${root}/assets/theme.js`,
                format: 'iife',
                name: 'library',
                sourcemap: true
            });
        });
});

gulp.task(`build`, gulp.series(`assets`, `css`, `js`));

gulp.task(`watch`, (done) => {
    process.env.NODE_ENV = `development`;

    gulp.watch(assets, gulp.series(`assets`));
    gulp.watch([`./tailwind.config.js`, `./**/*.twig`, `./assets/**/*`], gulp.series(`css`));
    gulp.watch([`./assets/js/**/*`], gulp.series(`js`));

    done();
});

gulp.task(`default`, gulp.series(`build`));