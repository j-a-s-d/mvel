/* mvel - Minimal Visual Elements Library */
/* 2013 @ Javier Santo Domingo (j-a-s-d@coderesearchlabs.com) */
/* - */
/* label element */

(function(mvel) { "use strict";
	function random(max) {
		return Math.floor(Math.random() * max) + 1;
	};
	if (!mvel) {
		return;
	}
	var handler = new mvel.AreaHandler("label");
	handler.create = function(parent, parameters) {
		parameters = parameters || {};
		var element = mvel.newAreaElement(parent, handler.kind(), parameters.id);
		element.removeClass('area-element-resizable');
		if (!parameters.caption) {
			parameters.caption = "";
		}
		element.text(parameters.caption);
		if (!parameters.top) {
			parameters.top = random(parent.height() - element.height());
		}
		element.css('top', parameters.top);
		if (!parameters.left) {
			parameters.left = random(parent.width() - element.width());
		}
		element.css('left', parameters.left);
		return element;
	};
	handler.persistence.serialize = function(element) {
		return {
			kind: element.data("kind"),
			parent: element.parent().attr('id'),
			classes: element.attr('class'),
			top: element.position().top,
			left: element.position().left,
			height: element.height(),
			width: element.width(),
			text: element.clone().children().remove().end().text(),
			order: element.css('z-index')
		};
	};
	handler.persistence.deserialize = function(area, serialized, name) {
		return handler.create(area, { caption: serialized.text, top: serialized.top, left: serialized.left, id: name });
	};
	mvel.AreaHandlers.register(handler);
}(mvel));
