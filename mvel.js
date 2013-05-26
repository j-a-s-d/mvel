/* mvel - Minimal Visual Elements Library */
/* 2013 @ Javier Santo Domingo (j-a-s-d@coderesearchlabs.com) */
/* - */
/* core library */

var mvel = (function($) { "use strict";
	var _AreaHandlers = (function() {
		var _collection = [];
		return {
			collection: _collection,
			register: function(areaHandler) {
				_collection.push(areaHandler);
			},
			get: function(kind) {
				for (var x in _collection) {
					if (_collection[x].is(kind)) {
						return _collection[x];
					}
				}
				return null;
			},
			find: function(element) {
				for (var x in _collection) {
					if (_collection[x].handles(element)) {
						return _collection[x];
					}
				}
				return null;
			}
		}
	}());
	var _AreaHandler = function(kind) {
		var _kind = kind;
		return {
			kind: function() {
				return _kind;
			},
			is: function(kind) {
				return _kind == kind;
			},
			handles: function(element) {
				return element.hasClass('area-' + _kind);
			},
			create: function(parent, parameters) {
				return null;
			},
			persistence: {
				serialize: function(element) {
					return null;
				},
				deserialize: function(area, serialized, name) {
					return null;
				}
			},
			events: {
				onMenuPopup: function(element, menu) {
					//
				},
				onResize: function(element, ui) {
					//
				},
				onEnter: function(element) {
					//
				},
				onLeave: function(element) {
					//
				}
			}
		}
	};
  var Constants = {
    RESIZABLE_OPTIONS: {
      containment: 'parent',
      start: resizeStartEventHandler,
	  resize: resizeEventHandler
    },
    DRAGGABLE_OPTIONS: {
	  containment: 'parent',
	  scroll: false,
	  stack: '.area-element',
	  cancel: '.area-element-operations-handle'
	}
  };
  function removeButtonClick() {
	var element = $(this).parent().parent();
	element.remove();
  };
  function lockElement(element) {
	element.draggable('destroy');
	// NOTE: as for jQuery UI - v1.10.2, there is a known bug about destroying a resizable that contains other resizables:
	// http://stackoverflow.com/questions/10462382/how-do-i-destroy-a-jquery-resizable-without-destroying-child-resizables
	// I solved this problem with a workaround, instead of calling:
	//   element.resizable('destroy');
	// I just hide the handle (hiding the resizing functionality too)
	element.children(".ui-resizable-handle").hide();
	element.addClass("area-element-locked");
  };
  function unlockElement(element) {
    element.draggable(Constants.DRAGGABLE_OPTIONS);
	// NOTE: and to reenable it, instead of recreating:
    //   element.resizable(Constants.RESIZABLE_OPTIONS);
	// I just show the hidden handle (restoring the resizing functionality)
	element.children(".ui-resizable-handle").show();
	element.removeClass("area-element-locked");
  };
  function lockButtonClick() {
	var element = $(this).parent().parent();
	leaveEventHandler(element);
    lockElement(element);
  };
  function unlockButtonClick() {
	var element = $(this).parent().parent();
    leaveEventHandler(element);
	unlockElement(element);
  };
  function leaveElement(element) {
	if (element.has("span").length) {
	  element.children().filter("span:last").remove();
	  element.children().filter("ul:last").remove();
	}
  };
  var OperationsMenu = (function() {
	var collection = [];
	function renderHTML(element) {
	  var operationItemsHTML = "";
	  for (var x in OperationsMenu.collection) {
	    if (element.hasClass(OperationsMenu.collection[x].target)) {
		  operationItemsHTML += OperationsMenu.collection[x].html;
		}
	  }
	  return "<span class='area-element-operations-handle ui-widget-header ui-corner-bl ui-icon ui-icon-triangle-1-s'></span>"
		+ "<ul id='mnOperations' class='area-element-operations-handle-menu' style='width: auto'>"
		+ operationItemsHTML
		+ "</ul>";
	};
	return {
	  addConditionalItem: function(targetClass, itemId, itemIcon, itemCaption, clickHandler) {
	    this.collection.push({
		  target: targetClass,
          id: itemId,
		  html: "<li id='" + itemId + "'><a href='#'><span class='ui-icon " + itemIcon + "'></span>" + itemCaption + "</a></li>",
		  onClick: clickHandler
        });
	  },
	  addItem: function(itemId, itemIcon, itemCaption, clickHandler) {
	    this.collection.push({
		  target: 'area-element',
          id: itemId,
		  html: "<li id='" + itemId + "'><a href='#'><span class='ui-icon " + itemIcon + "'></span>" + itemCaption + "</a></li>",
		  onClick: clickHandler
        });
      },
	  attachTo: function(element) {
	    element.append(renderHTML(element));
	    $("#mnOperations").menu().hide();
	    $(".area-element-operations-handle").click(function() {
          var menu = $("#mnOperations").show();
	      menu.position({ my: "right top", at: "right bottom", of: this });
          $(document).one("click", function() { menu.hide(); });
          return false;
        });
	    for (var x in this.collection) {
          $('#' + this.collection[x].id).click(this.collection[x].onClick);
        }
      },
	  clear: function() {
	    this.collection = [];
	  }
	}
  }());
  function enterElement(element) {
	if (element.has("span").length) {
	  return;
	}
	OperationsMenu.clear();
	var handler = mvel.AreaHandlers.find(element);
	if (handler != null) {
		handler.events.onMenuPopup(element, OperationsMenu);
	}
	if (element.hasClass("ui-draggable")) {
	  OperationsMenu.addItem('btnLock', 'ui-icon-locked', 'lock', lockButtonClick);
	  element.css('cursor', 'pointer');
	} else {
	  OperationsMenu.addItem('btnLock', 'ui-icon-unlocked', 'unlock', unlockButtonClick);
	  element.css('cursor', 'default');
	}
	OperationsMenu.addItem('btnClose', 'ui-icon-close', 'remove', removeButtonClick);
	OperationsMenu.attachTo(element);
  };
  function enterEventHandler(element) {
	if (element.parent().hasClass('area-element')) {
	  leaveElement(element.parent());
	}
	enterElement(element);
  };
  function leaveEventHandler(element) {
	leaveElement(element);
	if (element.parent().hasClass('area-element')) {
	  enterElement(element.parent());
	}
  };
  function resizeEventHandler(event, ui) {
    var element = ui.element;
	var handler = mvel.AreaHandlers.find(element);
	if (handler != null) {
		handler.events.onResize(element, ui);
	}
  }
  function resizeStartEventHandler(event, ui) {
    var element = ui.element,
	    _elementMargin = parseInt(element.css('margin')),
		_elementPadding = parseInt(element.css('padding')),
		_elementSpacing = _elementMargin + _elementPadding,
	    parent = element.parent(),
		_parentBottom = parent.position().top + parent.height(),
	    _parentRight = parent.position().left + parent.width(),
		_childrenBottom = -1,
	    _childrenRight = -1;
	element.children().each(function(e, g) {
      var child = $(g);
	  if (!child.hasClass('area-element')) {
		return;
	  };
	  var bottom = child.position().top + child.height();
	  var right = child.position().left + child.width();
	  /*if (child.hasClass('area-label')) {
		bottom -= _elementSpacing * 2;
		right -= _elementSpacing * 2;
	  };*/
	  if (bottom > _childrenBottom) {
		_childrenBottom = bottom;
	  }
	  if (right > _childrenRight) {
		_childrenRight = right;
	  }
	});
	if (_childrenRight > -1) {
	  element.resizable("option", "minWidth", _childrenRight + _elementSpacing);
	}
	if (_childrenBottom > -1) {
	  element.resizable("option", "minHeight", _childrenBottom + _elementSpacing);
	}
  };
  function random(max) {
    return Math.floor(Math.random() * max) + 1;
  };
  function getUniqueId(universe) {
    var x;
	do {
	  x = '_' + random(65536);
	} while (universe.find(x).length > 0);
    return x;
  };
  function startAreaElement(area, element) {
    element.draggable(Constants.DRAGGABLE_OPTIONS);
	if (element.hasClass('area-element-resizable')) {
      var ropts = Constants.RESIZABLE_OPTIONS;
      element.resizable(ropts);
	}
	if (element.hasClass('area-element-locked')) {
	  lockElement(element);
	}
	element.show();
  };
  function startAreaElements(area) {
    var selector = '#' + area.attr('id') + ' .area-element';
    $(selector).each(function(e, g) {
      startAreaElement(area, $(g));
    });
	area.show();
  };
  return {
	AreaHandlers: _AreaHandlers,
	AreaHandler: _AreaHandler,
	newArea: function(parent, id) {
	  parent.append("<div id='" + id + "'></div>");
	  var area = $('#' + id);
	  area.hide();
	  area.addClass('area');
	  return area;
	},
	runArea: startAreaElements,
	runAreaElement: startAreaElement,
	newAreaContainer: function(area, top, left, height, width, id) {
      var element = this.newAreaElement(area, 'container', id);
      if (!width) {
        width = random(area.width() / 4);
      }
      element.width(width);
      if (!height) {
        height = random(area.height() / 4);
      }
      element.height(height);
      if (!left) {
        left = random(area.width() - element.width());
      }
      element.css('left', left);
      if (!top) {
        top = random(area.height() - element.height());
      }
      element.css('top', top);
	  element.append('<div id="' + element.attr('id') + '_content" class="area-container-content"></div>');
      return element;
	},
	newAreaElement: function(area, kind, id) {
	  if (!id) {
		id = getUniqueId(area);
	  }
	  var element = $("<div id='" + id + "' class='area-element'></div>");
      element.data("kind", kind);
      element.addClass('area-' + kind);
	  element.addClass('area-element-resizable');
	  area.append(element);
	  element.hover(
		function () { enterEventHandler($(this)); },
		function() { leaveEventHandler($(this)); }
	  );
	  element.hide();
	  return element;
	},
	changeElementParent: function(aElement, aNewParent) {
      aElement.detach().appendTo(aNewParent);
      aElement.css('top', aNewParent.css('padding'));
      aElement.css('left', aNewParent.css('padding'));
    },
	changeContainerContent: function(aElement, aContent) {
      if (aElement.data('kind') == 'container') {
        $('#' + aElement.attr('id') + '_content').html(aContent);
      }
    },
	serializeArea: function(area) {
	  var serializedArea = { id: area.attr('id') };
	  $('#' + area.attr('id') + ' .area-element').each(function(e, g) {
		var element = $(g);
		enterElement(element);
		var handler = mvel.AreaHandlers.find(element);
		if (handler != null) {
			var serialized = handler.persistence.serialize(element);
			if (serialized != null) {
				serializedArea[element.attr('id')] = serialized;
			}
		} else
		switch (element.data("kind")) {
			default: {
				serializedArea[element.attr('id')] = {
				  kind: element.data("kind"),
				  parent: element.parent().attr('id'),
				  classes: element.attr('class'),
				  top: element.position().top,
				  left: element.position().left,
				  height: element.height(),
				  width: element.width(),
				  content: $('#' + element.attr('id') + '_content').html(),
				  order: element.css('z-index')
				};
				break;
			}
		}
		leaveElement(element);
	  });
	  return JSON.stringify(serializedArea);
	},
	deserializeArea: function(parent, serializedArea) {
	  var parsedArea = JSON.parse(serializedArea);
	  var area = this.newArea(parent, parsedArea.id);
	  delete parsedArea.id;
	  for (var propertyName in parsedArea) {
		var obj = parsedArea[propertyName];
        var element = null;
		var handler = this.AreaHandlers.get(obj.kind);
		if (handler != null) {
			element = handler.persistence.deserialize(area, obj, propertyName);
		} else
		switch (obj.kind) {
          case 'container': {
            element = this.newAreaContainer(area, obj.top, obj.left, obj.height, obj.width, propertyName);
            $('#' + element.attr('id') + '_content').html(obj.content);
            break;
          }
		}
		if (element == null) {
		  continue;
		}
        element.addClass(obj.classes);
		element.css("z-index", obj.order);
	  }
	  for (var propertyName in parsedArea) {
		var obj = parsedArea[propertyName];
		var element = $('#' + propertyName);
		if (element.parent().attr('id') != obj.parent) {
          element.detach().appendTo('#' + obj.parent);
		}
		element.click();
	  }
	  return area;
	}
  }
}(jQuery));
