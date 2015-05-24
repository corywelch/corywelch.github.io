
var globalConfig;
var externalIP;
var externalIPdetermined = false;

function getip(json){
	if(json == undefined || json == null || json.ip == undefined || json.ip == "" || json.ip == null){
		console.log("http://jsonip.appspot.com/?callback=getip is not getting ip");
		externalIPdetermined = false;
		console.log("Trying another source");
		$.get("http://ipinfo.io", function(response) {
			if(response == undefined || response == null || response.ip == undefined || response.ip == "" || response.ip == null){
				console.log("http://ipinfo.io is not getting ip");
				externalIPdetermined = false;
				userDetLocation();
			} else {
				console.log("Connecting From : "+response.ip);
				externalIP = response.ip.toString();
				externalIPdetermined = true;
			};
		}, "jsonp");
	} else {
		console.log("Connecting From : "+json.ip);
		externalIP = json.ip.toString();
		externalIPdetermined = true;
	}
}

function userDetLocation() {
	if(confirm("Are you connecting from outside the servers router?") == true) {
		externalIPdetermined = true;
		externalIP = "0.0.0.0";
	} else {
		externalIPdetermined = true;
		externalIP = "173.33.147.9";
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
		var ip = globalConfig.ip;
		if(ip == externalIP && externalIPdetermined == true){
			console.log("Connecting from within Server's Router. Updating Connection Details");
			globalConfig.ip = "192.168.0.204";
			globalConfig.port = "80";
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
	},800);
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
