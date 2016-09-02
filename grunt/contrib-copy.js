module.exports = function(grunt) {
	var date = new Date();
	grunt.config.set("copy", {
		dist: {
			files: [{
				expand: true,
				cwd: "src/",
				src: ["**/*.css", "**/*.html", "**/*.png"],
				dest: "dist/"
			}]
		},
		lib: {
			files: [{
				expand: true,
				cwd: "src/lib",
				src: ["**/*.js", "**/*.css", "**/*.html", "**/*.png"],
				dest: "dist/lib/"
			}]
		},
		public: {
			files: [{
				// copy over static assets, css
				expand: true,
				cwd: "dist/",
				src: ["**/*.js", "**/*.css", "**/*.html", "**/*.png"],
				dest: "public/"
			}]
		}
	});

	grunt.loadNpmTasks("grunt-contrib-copy");
};