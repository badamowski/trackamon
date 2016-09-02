module.exports = function(grunt) {
	grunt.config.set("uglify", {
		prod: {
			options: {
				mangle: false
			},
			files: {
				'dist/js/app.js': ['src/js/app.js', 'src/js/router.js']
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
};