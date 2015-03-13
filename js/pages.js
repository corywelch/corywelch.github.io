/**
 * Created by Cory on 15-03-12.
 */

$(document).ready(init());

function init(){
	var height = $(window).height();
	var width = $(window).width();

	$.fn.scrollPath("getPath", {
		scrollSpeed: 20, // Default is 50
		rotationSpeed: Math.PI / 100 // Default is Math.PI / 15
	}).moveTo(0,0, {
		name: "section1"
	}).lineTo(0,height, {
		name: "section2"
	}).lineTo(width,height, {
		name: "section3"
	}).lineTo(width,2*height, {
		name: "section4"
	});

	$("#content").scrollPath({
		drawPath: false,
		wrapAround: false,
		scrollBar: false
	});
}


