module.exports = function(grunt) {
	grunt.config.set("uglify", {
		dev: {
			options: {
				mangle: false,
				compress: false,
				beautify: true
			},
			files: {
				'dist/js/app.js': ['src/js/app.js', 'src/js/router.js']
			}
		},
		prod: {
			files: {
				'dist/js/app.js': ['src/js/app.js', 'src/js/router.js']
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-uglify");
};