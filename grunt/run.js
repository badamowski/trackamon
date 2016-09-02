module.exports = function(grunt) {
	var port = grunt.option("port") || 8080;
	// run local restify server
	grunt.config.set("run", {
		nodedev:{
			cmd: "node",
			args: ["test-server.js", port]
		}
	});

	grunt.loadNpmTasks("grunt-run");
};