

function navMouseOver(sectionNumber) {
	for(var i = 1; i <=4; i++){
		if(i != sectionNumber){
			$("#section"+i).addClass("hidden");
		} else {
			$("#section"+i).removeClass("hidden");
		}
	}
}
