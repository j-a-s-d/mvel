/* mvel - Minimal Visual Elements Library */
/* 2013 @ Javier Santo Domingo (j-a-s-d@coderesearchlabs.com) */
/* - */
/* demo */

$(function() {
	var parent = $('body');
	if (document.getElementById('board')) {
		parent = $('#board');
	}
	var area = mvel.newArea(parent, 'mainArea');

	function random(max) {
		return Math.floor(Math.random() * max) + 1;
	}

	$("#addElement").button().click(function() {
		var menu = $(this).next().show().position({
			my: "left top", at: "left bottom", of: this
		});
		$(document).one("click", function() {
			menu.hide();
		});
		return false;
	}).buttonset().next().hide().menu();

	$("#persistTest").button().click(function(event) {
		event.preventDefault();
		var serialized = mvel.serializeArea(area);
		$('body').append('<hr/>' + serialized);
		area.remove();
		setTimeout(function() {
			area = mvel.deserializeArea(parent, serialized);
			mvel.runArea(area);
		}, 500);
	});

	function filiateTo(aElement, aNewParent) {
		mvel.changeElementParent(aElement, aNewParent);
	}

	function newLabel(area, caption, top, left) {
		var element = null;
		var handler = mvel.AreaHandlers.get('label');
		if (handler != null) {
			element = handler.create(area, { caption: caption, top: top, left: left });
		}
		return element;
	}

	function newContainer(area, top, left, height, width) {
		return mvel.newAreaContainer(area, top, left, height, width);
	}

	function newBox(area, top, left, height, width) {
		var aBox = newContainer(area, top, left, height, width);
		aBox.addClass('area-box');
		return aBox;
	}

	function newFrame(area, top, left, height, width) {
		var aFrame = newContainer(area, top, left, height, width);
		aFrame.addClass('area-frame');
		return aFrame;
	}

	function newSection(area, top, left, height, width) {
		var aSection = newContainer(area, top, left, height, width);
		aSection.addClass('area-section');
		return aSection;
	}

	function newZone(area, top, left, height, width) {
		var aZone = newContainer(area, top, left, height, width);
		aZone.addClass('area-zone');
		return aZone;
	}
	$("#addLabel").button().click(function(event) {
		event.preventDefault();
		mvel.runAreaElement(area, newLabel(area, "Label"));
	});
	$("#addBox").button().click(function(event) {
		event.preventDefault();
		mvel.runAreaElement(area, newBox(area));
	});
	$("#addFrame").button().click(function(event) {
		event.preventDefault();
		mvel.runAreaElement(area, newFrame(area));
	});
	$("#addSection").button().click(function(event) {
		event.preventDefault();
		mvel.runAreaElement(area, newSection(area));
	});
	$("#addZone").button().click(function(event) {
		event.preventDefault();
		mvel.runAreaElement(area, newZone(area));
	});

	var aLabel = newLabel(area, "Label");
	var aBox = newBox(area);
	aBox.width(100);
	aBox.height(50);
	mvel.changeContainerContent(aBox, '<u>Box</u>');
	var aFrame = newFrame(area);
	aFrame.width(200);
	aFrame.height(100);
	mvel.changeContainerContent(aFrame, '<sup>Frame</sup>');
	var aSection = newSection(area);
	aSection.width(400);
	aSection.height(200);
	mvel.changeContainerContent(aSection, '<center><i>Section');
	var aZone = newZone(area, 30, 30, 400, 800);
	mvel.changeContainerContent(aZone, '<b>Zone</b>');
	var aLabel2 = newLabel(area, "Label2", 300, 400);
	filiateTo(aLabel2, aZone);
	var aSection2 = newSection(area, 100, 450, 150, 300);
	mvel.changeContainerContent(aSection2, '<i>Another Section</i>');
	filiateTo(aSection2, aZone);

	filiateTo(aLabel, aBox);
	filiateTo(aBox, aFrame);
	filiateTo(aFrame, aSection);
	filiateTo(aSection, aZone);

	var aLabel3 = newLabel(area, "Label3");
	filiateTo(aLabel3, aZone);

	aZone.dblclick(function() {
		alert('Zone double clicked.');
	});
	mvel.runArea(area);
	$('#status').text(new Date());
});
