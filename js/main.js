'use strict';

var globalConfig = {
	"ip":"",
	"port":"",
	"env":""
};
var externalIP;

var navClickedBool = false;

//function to setup session storage
function initSession(){
	console.log("Setting up Session Storage");
	if(typeof(Storage) !== "undefined") {
		sessionStorage.EXTERNALIP = externalIP;
		sessionStorage.SERVERIP = globalConfig.ip;
		sessionStorage.SERVERPORT = globalConfig.port;
		sessionStorage.ENVIRONMENT = globalConfig.env;
	} else {
		console.log("No Web Storage Support on your browse");
	}
	console.log("Setup and Config Complete :)")
}

//Used as the success callback for getting external ip address
function getipSuccess(json){
	externalIP = json.ip;
	if(globalConfig.ip == externalIP){
		console.log("Connecting from within Server's Router.");
		globalConfig.ip = "192.168.0.204";
		globalConfig.port = "80";
	} else {
		console.log("Connecting From : "+json.ip);
	}
	console.log("Config Loaded\nIP : "+globalConfig.ip+"\nPORT : "+globalConfig.port+"\nENVIRONMENT : "+globalConfig.env);
	initSession();
}

//Function to send local ajax request, used to load local files
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

//Function called to make calls to determine external ip and set global config variable for use anywhere within the app
function getConfig(){
	console.log("Getting Config");
	loadJSON('config.properties',function(response){
		globalConfig = JSON.parse(response);
		if(globalConfig.env == "live"){
			$.ajax({
				url: "http://jsonip.appspot.com/callback=?",
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
							getipSuccess();
						}
					});
				}
			});
		} else {
			console.log("Connecting from localhost.");
			console.log("Config Loaded\nIP : "+globalConfig.ip+"\nPORT : "+globalConfig.port+"\nENVIRONMENT : "+globalConfig.env);
			initSession();
		}

	});
}

//function that gets the server address for use of server calls
function getServerURL() {
	return (globalConfig.ip+":"+globalConfig.port);
}

//function used to change selected panel on top section
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

//function used to animate and lock the section moving too
function navClicked(sectionNumber) {

	navMouseOver(sectionNumber);
	navClickedBool = true;
	$('html,body').animate({
		scrollTop: $("#section"+sectionNumber).offset().top
	},800);
	navClickedBool = false;
}

//function login success function
function loggedIn(){
	$("#workoutLogin").fadeOut(1000, function() {
		$("#workoutContent").fadeIn(1000, function() {

		});
	});
}

//function for when already logged in
function alreadyLoggedIn(){
	$("#workoutLogin").fadeOut(10, function() {
		$("#workoutContent").fadeIn(10, function() {

		});
	});
}

//function used for login confirmation with the server, called by section 4 Workout Tracking
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
				//alert("Logged In Successfully");
				sessionStorage.LOGGEDIN = true;
				loggedIn();
			} else if(reply=="invalid") {
				//alert("Invalid Credentials");
			} else {
				alert("An Error Occurred : " + reply);
			}
		},
		error: function(error){
			alert(error);
		}
	});
}

//init function - runs after page load
$(document).ready(function(){
	getConfig();
	if(typeof(Storage) !== "undefined") {
		if(sessionStorage.LOGGEDIN){
			alreadyLoggedIn();
		}
	} else {
		console.log("No Web Storage Support on your browse");
	}
});
