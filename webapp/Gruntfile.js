'use strict';

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-injector');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-wiredep');

    var serveStatic = require('serve-static');

    // Define the configuration for all the tasks
    grunt.initConfig({
        wiredep: {
            task: {
                src: ['public/index.html'],
                ignorePath: 'public/',
            }
        },
        injector: {
            css: {
                options: {
                    transform: function(filePath) {
                        filePath = filePath.replace('/public/', '');
                        return '<link rel="stylesheet" href="' + filePath + '">';
                    }
                },
                files: {
                    'public/index.html': [
                        'public/styles/main.css'
                    ]
                }
            },
            scripts: {
                options: {
                    transform: function(filePath) {
                        filePath = filePath.replace('/public/', '');
                        return '<script src="' + filePath + '"></script>';
                    }
                },
                files: {
                    'public/index.html': [
                        'public/scripts/public.js',
                        'public/scripts/**/!(*.spec|*.mock|*.old|config).js'
                    ]
                }
            }
        },
        less: {
            files: {
                expand: true,
                cwd: 'less',
                src: 'main.less',
                dest: 'public/styles',
                ext: '.css'
            }
        },
        connect: {
            options: {
                port: 9004,
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect().use(
                                '/public',
                                serveStatic('./public')
                            ),
                            serveStatic('public')
                        ];
                    }
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'public/scripts/{,*/}*.js'
                ]
           }
        },
        jscs: {
            options: {
                config: '.jscsrc'
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'public/scripts/{,*/}*.js'
                ]
            }
        },
        watch: {
            wiredep: {
                files: [
                    'bower.json'
                ],
                tasks: ['newer:wiredep']
            },
            injector: {
                files: [
                    'public/scripts/*.css',
                    'public/scripts/public.js',
                    'public/scripts/**/!(*.spec|*.mock|*.old|config).js'
                ],
                tasks: ['newer:injector:css', 'newer:injector:scripts']
            },
            js: {
                files: ['public/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all', 'newer:jscs:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            less: {
                files: ['less/{,*/}*.less'],
                tasks: ['less']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'public/{,*/}*.html',
                    'styles/{,*/}*.css'
                ]
            }
        }
    });

    grunt.registerTask('default', [
        'wiredep',
        'injector',
        'less',
        'connect',
        'watch'
    ]);
};
