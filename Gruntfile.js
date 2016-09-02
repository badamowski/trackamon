module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json")
	});

	// import task configs from grunt folder
	grunt.loadTasks("grunt");

	// actual tasks
	grunt.registerTask("dev", ["clean", "copy:dist", "copy:lib", "uglify:dev", "run:nodedev"]);
	grunt.registerTask("prod", ["clean", "copy:dist", "copy:lib", "uglify:prod", "copy:public"]);

};