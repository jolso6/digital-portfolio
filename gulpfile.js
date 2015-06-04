/*global -$ */
"use strict";
// generated on 2015-06-04 using generator-gulp-webapp 0.3.0
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");
var reload = browserSync.reload;
var babelify = require("babelify");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");

gulp.task("scripts", function () {
  return browserify({debug: true})
    .transform(babelify.configure({
      sourceMap: true,
      sourceMapRelative: "./app"
    }))
    .require("./app/scripts/main.jsx", {entry: true})
    .bundle()
    .on("error", function handleError(err) {
      console.error(err.toString());
      this.emit("end");
    })
    .pipe(source("main.js"))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sourcemaps.write("./"))
    .pipe(gulp.dest(".tmp"))
    .pipe(gulp.dest("dist"));
});

gulp.task("styles", function () {
  return gulp.src("app/styles/main.scss")
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: "nested", // libsass doesn"t support expanded yet
      precision: 10,
      includePaths: ["."],
      onError: console.error.bind(console, "Sass error:")
    }))
    .pipe($.postcss([
      require("autoprefixer-core")({browsers: ["last 1 version"]})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(".tmp/styles"))
    .pipe(reload({stream: true}));
});

gulp.task("eslint", function () {
  return gulp.src("app/**/*.js{,x}")
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task("html", ["styles"], function () {
  var assets = $.useref.assets({searchPath: [".tmp", "app", "."]});

  return gulp.src("app/*.html")
    .pipe(assets)
    .pipe($.if("*.js", $.uglify()))
    .pipe($.if("*.css", $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if("*.html", $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest("dist"));
});

gulp.task("images", function () {
  return gulp.src("app/images/**/*")
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don"t remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest("dist/images"));
});

gulp.task("fonts", function () {
  return gulp.src(require("main-bower-files")({
    filter: "**/*.{eot,svg,ttf,woff,woff2}"
  }).concat("app/fonts/**/*"))
    .pipe(gulp.dest(".tmp/fonts"))
    .pipe(gulp.dest("dist/fonts"));
});

gulp.task("extras", function () {
  return gulp.src([
    "app/*.*",
    "!app/*.html"
  ], {
    dot: true
  }).pipe(gulp.dest("dist"));
});

gulp.task("clean", require("del").bind(null, [".tmp", "dist"]));

gulp.task("serve", ["scripts", "styles", "fonts"], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [".tmp", "app"],
      routes: {
        "/bower_components": "bower_components"
      }
    }
  });

  // watch for changes
  gulp.watch([
    "app/*.html",
    "app/images/**/*",
    ".tmp/**/*"
  ]).on("change", reload);

  gulp.watch("app/styles/**/*.scss", ["styles"]);
  gulp.watch("app/scripts/**/*.js{,x}", ["scripts"]);
  gulp.watch("app/fonts/**/*", ["fonts"]);
  gulp.watch("bower.json", ["wiredep", "fonts"]);
});

// inject bower components
gulp.task("wiredep", function () {
  var wiredep = require("wiredep").stream;

  gulp.src("app/styles/*.scss")
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest("app/styles"));

  gulp.src("app/*.html")
    .pipe(wiredep({
      exclude: ["bootstrap-sass-official"],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest("app"));
});

gulp.task("build", ["scripts", "eslint", "html", "images", "fonts", "extras"], function () {
  return gulp.src("dist/**/*").pipe($.size({title: "build", gzip: true}));
});

gulp.task("default", ["clean"], function () {
  gulp.start("build");
});
