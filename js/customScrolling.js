/**
 * Created by Cory on 15-03-13.
 */

$(document).ready(function(){
	$(window).scroll(function() {
		var newScroll = getScrollTop();
		var percent = getPercentScroll();
		var message = "Scrolling To: " + newScroll + " which is " + percent + "%"
		console.log(message);
		$('#thisIsAnID')[0].innerHTML = message;
	});
});

function getPercentScroll(){
	var newScroll = getScrollTop();
	var height = $(document).height();
	var winHeight = $(window).height();
	return newScroll/(height - winHeight)*100;
}

function getScrollTop() {
	return $(window).scrollTop();
}
