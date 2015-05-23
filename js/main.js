
var globalConfig;

function loadJSON(path, callback) {

	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}
function getConfig(){
	loadJSON('config.properties',function(response){
		globalConfig = JSON.parse(response);
		console.log("Config Loaded\nIP : "+globalConfig.ip+"\nPORT : "+globalConfig.port+"\nENVIRONMENT : "+globalConfig.env+"\n");
	});
}

$(document).ready(function(){
	getConfig();
});

function getServerURL() {
	return (globalConfig.ip+":"+globalConfig.port);
}

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

function login() {
	var username = $('#username').val();
	var password = $('#password').val();
	var URL = "http://"+ getServerURL() + "/login.php";
	$.ajax({
		type: "POST",
		url: URL,
		dataType: "text",
		data: ("name="+username+"&pass="+password),
		success: function(reply) {
			if(reply=="success") {
				alert("Logged In Successfully");
			} else if(reply=="invalid") {
				alert("Invalid Credentials");
			} else {
				alert("An Error Occurred : " + reply);
			}
		},
		error: function(error){
			alert(error);
		}
	});

}
