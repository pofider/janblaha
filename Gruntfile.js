module.exports = function(grunt) {
    grunt.initConfig({
        cssmin: {
            combine: {
                files: {
                    'public/css/blog.min.css': [
                        'public/css/metro-bootstrap.min.css', 'public/css/metro-bootstrap-responsive.min.css', 'public/css/iconFont.min.css',
                        'public/css/font-awesome.min.css', 'public/css/custom.css'
                    ]
                }
            }
        },

        uglify: {
            baic: {
                files: {
                    'public/js/blog.min.js': ['public/js/jquery-2.1.0.min.js', 'public/js/jquery.widget.min.js',
                        'public/js/metro.min.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['cssmin', 'uglify']);
}