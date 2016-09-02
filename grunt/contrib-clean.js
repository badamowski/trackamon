module.exports = function(grunt) {
	grunt.config.set("clean", {
		dist: ["dist/"]
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
};