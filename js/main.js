

function navMouseOver(sectionNumber) {
	for(var i = 1; i <=4; i++){
		if(i != sectionNumber){
			$("#section"+i).addClass("hidden");
			$("#navsection"+i).removeClass("section"+i).addClass("section"+i+"unselected");
		} else {
			$("#section"+i).removeClass("hidden");
			$("#navsection"+i).removeClass("section"+i+"unselected").addClass("section"+i);
		}
	}
}

function navClicked(sectionNumber) {
	navMouseOver(sectionNumber);
	$('html,body').animate({
		scrollTop: $("#section"+sectionNumber).offset().top
	},1500);
}
