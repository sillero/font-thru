/*global module:false*/
module.exports = function(grunt) {
	var request = require('request'),
		extend = require('./allonge-extend').extend,
		writeFile = function(destination, content, options){
			options = extend({ replace: null, space: '	' }, options);
			if (typeof content === 'object') {
				content = JSON.stringify(content, options.replace, options.space);
			}
			grunt.file.write(destination, content);
			grunt.log.ok('File "'+destination+'" created.');	
		},
		abort = function(error){
			grunt.log.error('There was a problem.', error);
			grunt.log.error('aborting');
			grunt.task.clearQueue();
		};

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		main: {
			filenames: {
				dir: 'json/',
				file_type: 'json',
				api: '<%= main.filenames.dir %>webfontsapi.<%= main.filenames.file_type %>',
				api_min: '<%= main.filenames.dir %>webfontsapi.min.<%= main.filenames.file_type %>',
				metadata: '<%= main.filenames.dir %>metadata.<%= main.filenames.file_type %>',
				metadata_min: '<%= main.filenames.dir %>metadata.min.<%= main.filenames.file_type %>',
				thru_api: '<%= main.filenames.dir %>font-thru.<%= main.filenames.file_type %>',
				thru_api_min: '<%= main.filenames.dir %>font-thru.min.<%= main.filenames.file_type %>'

			},
			urls: {
				api: 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBzbP8g30tXluXftEO2pKbNPYDmmNfJd7I'
			}		
		},
		'download-api': {
			default: {
				src: '<%= main.urls.api %>',
				dest: '<%= main.filenames.api %>'
			}
		},
		'join-metadata': {
			default: {
				src: [
					'googlefontdirectory/hg/apache',
					'googlefontdirectory/hg/ofl',
					'googlefontdirectory/hg/ufl'
				],
				dest: '<%= main.filenames.metadata %>'
			}
		},
		'extend-api': {
			default: {
				api: '<%= main.filenames.api %>',
				metadata: '<%= main.filenames.metadata %>',
				dest: '<%= main.filenames.thru_api %>'
			}
		},
		'save-metadata': {
			default: {
				api: '<%= main.filenames.api %>',
				metadata: '<%= main.filenames.metadata %>',
				dest: '<%= main.filenames.thru_api %>',
				dest_min: '<%= main.filenames.thru_api_min %>'
			}
		},
		'save-diff': {
			default: {
				api: '<%= main.filenames.api %>',
				metadata: '<%= main.filenames.metadata %>',
				dest: '<%= main.filenames.dir %>diff.json'
			}
		}
	});

	// These plugins provide necessary tasks.
	

	// Default task.
	grunt.registerTask('default', ['main']);
	
	grunt.registerTask('main', 'Main task', function(){
		grunt.log.writeln(grunt.config('pkg').description);
		grunt.log.ok('grunt update', '- Update api and merge with metadata');
		grunt.log.ok('grunt update-metadata', '- Same as "update", but use only metadata');
		grunt.log.ok('grunt compare-json', '- Compare differences between metadata and webfontsapi');
	});

	grunt.registerTask('update', 'Update and merge files', ['download-api', 'join-metadata', 'extend-api']);

	grunt.registerTask('update-metadata', 'Update and use metadata as main', ['download-api', 'join-metadata', 'save-metadata']);

	grunt.registerTask('compare-json', 'Compare differences between metadata and webfontsapi', ['download-api', 'join-metadata', 'save-diff']);	

	grunt.registerMultiTask('save-diff', 'Save differences in a file', function(){
		var options = this.data,
			src = {
				api: grunt.file.readJSON(options.api),
				metadata: grunt.file.readJSON(options.metadata)
			},
			metadata_length = src.metadata.items.length,
			diff = JSON.parse(JSON.stringify(src)),
			apiMap_counter = 0,
			apiMap = function(font){
				for (var i = 0; i < metadata_length; i++) {
					var metadata = src.metadata.items[i];

					if (font.family === metadata.name) {
						diff.api.items[apiMap_counter] = void 0;
						diff.metadata.items[i] = void 0;
					}
				}
				apiMap_counter++;
				return font;
			},
			cleanDiff = function(){
				var newDiffApi = [],
					newDiffMeta = [];
				
				diff.api.items.map(function(font){
					if (font !== void 0) {
						newDiffApi.push(font)
					}
				});	

				diff.metadata.items.map(function(font){
					if (font !== void 0) {
						newDiffMeta.push(font)
					}
				});

				diff.api.items = newDiffApi;
				diff.metadata.items = newDiffMeta;
			},
			countItems = function(target){
				grunt.log.writeln('Total items ('+target+'):', src[target].items.length);
			},
			countItemsDiff = function(target){
				grunt.log.writeln('Total items (diff.'+target+'):', diff[target].items.length);
			};

		countItems('api');
		countItems('metadata');

		src.api.items.map(apiMap);
		cleanDiff();

		countItemsDiff('api');
		countItemsDiff('metadata');

		writeFile(options.dest, diff);
	});

	grunt.registerMultiTask('save-metadata', 'Save final api using metadata only', function(){
		var options = this.data,
			src = {
				api: grunt.file.readJSON(options.api),
				metadata: grunt.file.readJSON(options.metadata)
			},
			metadata_length = src.metadata.items.length,
			thru_api = { items: [] },
			apiMap = function(font){
				for (var i = 0; i < metadata_length; i++) {
					var metadata = src.metadata.items[i],
						metadata_return;

					if (font.family === metadata.name) {
						metadata_return = extend({}, metadata, { variants: font.variants });
						delete metadata_return.fonts;
						return metadata_return;
					}
				}
			},
			countItems = function(target){
				grunt.log.writeln('Total items ('+target+'):', src[target].items.length);
			};

		thru_api.items = src.api.items.map(apiMap);

		writeFile(options.dest, thru_api);
		writeFile(options.dest_min, thru_api, { space: ''});
	});

	grunt.registerMultiTask('download-api', 'Download Google Fonts Developer Api', function(){
		var done = this.async(),
			options = this.data;

		request(options.src, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				writeFile(options.dest, body);
				done();
			}
			else {
				response = response || { statusCode: '000' };
				abort('('+ response.statusCode +')');
			}
		});
	});

	grunt.registerMultiTask('join-metadata', 'Joins all source metadata', function(){
		var options = this.data,
			fonts = {
				items: []
			};

		options.src = (typeof options.src === 'string' ? [ options.src ] : options.src);

		for (var i = 0; i < options.src.length; i++) {
			grunt.file.recurse(options.src[i], function callback(abspath, rootdir, subdir, filename){
				if (filename === 'METADATA.json') { 
					fonts.items.push(grunt.file.readJSON(abspath));
				}
			});
		}
		writeFile(options.dest, fonts);
	});

	grunt.registerMultiTask('extend-api', 'Extend api with metadata', function(){
		var options = this.data,
			src = {
				api: grunt.file.readJSON(options.api),
				metadata: grunt.file.readJSON(options.metadata)
			},
			metadata_length = src.metadata.items.length,
			thru_api = { items: [] },
			apiMap = function(font){
				for (var i = 0; i < metadata_length; i++) {
					var metadata = src.metadata.items[i];

					if (font.family === metadata.name) {
						font.category = metadata.category
					}
				}

				return font;
			},
			countItems = function(target){
				grunt.log.writeln('Total items ('+target+'):', src[target].items.length);
			};

		countItems('api');
		countItems('metadata');

		thru_api.items = src.api.items.map(apiMap);

		writeFile(options.dest, thru_api);
	});
};

























