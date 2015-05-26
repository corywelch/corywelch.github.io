
var globalConfig;
var externalIP;

var navClickedBool = false;

function getipSuccess(json){
	externalIP = json.ip;
	if(globalConfig.ip == externalIP){
		console.log("Connecting from within Server's Router.");
		globalConfig.ip = "192.168.0.204";
		globalConfig.port = "80";
	} else {
		console.log("Connecting From : "+json.ip);
	}
}

function userDetLocation() {
	if(globalConfig.ip == externalIP){
		console.log("Connecting from within Server's Router.");
		globalConfig.ip = "192.168.0.204";
		globalConfig.port = "80";
	}
}

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
		if(globalConfig.env == "live"){
			$.ajax({
				url: "http://jsonip.appspot.com/",
				type: "GET",
				dataType: "JSON",
				success: function(response){getipSuccess(response);},
				error: function(json) {
					console.log("Error with http://jsonip.appspot.com : "+ JSON.stringify(json));
					console.log("Trying another source");
					$.ajax({
						url: "http://ipinfo.io",
						type: "GET",
						dataType: "JSON",
						success: function(response){getipSuccess(response);},
						error: function(json) {
							console.log("Error with http://ipinfo.io : "+ JSON.stringify(json));
							if(confirm("Assuming you are connecting from outside the servers router?") == true) {
								externalIP = "1.1.1.1";
							} else {
								externalIP = "173.33.147.9";
							}
							userDetLocation();
						}
					});
				}
			});
		} else {
			console.log("Connecting from localhost.");
		}

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
	if(!navClickedBool){
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
}

function navClicked(sectionNumber) {

	navMouseOver(sectionNumber);
	navClickedBool = true;
	$('html,body').animate({
		scrollTop: $("#section"+sectionNumber).offset().top
	},800);
	navClickedBool = false;
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
