// Avoid `console` errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

// Place any jQuery/helper plugins in here.
(function(window, document, $, undefined){

	var app = {
		dragging: {
			active: false,
			el: null,
			deltaX: 0,
			deltaY: 0
		}
	};

	$(function(){
		var stopDragging = function(){
				if (app.dragging.el) {
					app.dragging.el.classList.remove('dragging');
				}
				app.dragging.active = false;
				app.dragging.el = null;
			},
			startDragging = function(e, element){				
				app.dragging.deltaX = e.pageX - $(element).offset().left;
				app.dragging.deltaY = e.pageY - $(element).offset().top;
				element.classList.add('dragging');
				app.dragging.active = true;
				app.dragging.el = element;
			},
			dragMove = function(e){
				if (app.dragging.active) {
					clearSelection();
					var $el = $(app.dragging.el),
						position = {
							top: e.pageY - app.dragging.deltaY,
							left: e.pageX - app.dragging.deltaX
						};
	
					$el.css(position); 
				}
			},
			clearSelection = function(){
				if (window.getSelection) {
					if (window.getSelection().empty) {  // Chrome
						window.getSelection().empty();
					}
					else if (window.getSelection().removeAllRanges) {  // Firefox
						window.getSelection().removeAllRanges();
					}
				}
				else if (document.selection) {  // IE?
					document.selection.empty();
				}
			};
	
		$(document)
			.on({
				mousedown: function(e){
					startDragging(e, this);
				}
			}, '.draggable')
			.on({
				mouseup: function(){
					stopDragging();
				},
				mousemove: function(e){
					dragMove(e);
				}
			});
	});


})(window, document, jQuery);
