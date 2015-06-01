'use strict';

var globalConfig = {
	"ip":"",
	"port":"",
	"env":""
};

var navClickedBool = false;

//function to get system status
function getServerStatus(){
	console.log("Getting Server Status");
	ping(function callback(status){
		if(status == "success"){
			console.log("Connected to Server");
			if(typeof(Storage) !== "undefined") {
				sessionStorage.SERVERSTATUS = "Connected";
			} else {
				window.SERVERSTATUS = "Connected";
			}
			$("#workoutServerStatus").css("background-image",'url("img/StatusLightGreen.png")').text("Connected");
		} else if(status == "noresponse"){
			console.log("Server Not Available");
			if(typeof(Storage) !== "undefined") {
				sessionStorage.SERVERSTATUS = "Not Available";
			} else {
				window.SERVERSTATUS = "Not Available";
			}
			$("#workoutServerStatus").css("background-image","url('img/StatusLightRed.png')").text("Not Available");
		} else if(status == "error"){
			console.log("Server Returned Error");
			if(typeof(Storage) !== "undefined") {
				sessionStorage.SERVERSTATUS = "Error";
			} else {
				window.SERVERSTATUS = "Error";
			}
			$("#workoutServerStatus").css("background-image","url('img/StatusLightAmber.png')").text("Error");
		} else {
			console.log("An Unknown Server Response Received");
			if(typeof(Storage) !== "undefined") {
				sessionStorage.SERVERSTATUS = "Unknown";
			} else {
				window.SERVERSTATUS = "Unknown";
			}
			$("#workoutServerStatus").css("background-image","url('img/StatusLightDarkGrey.png')").text("Unknown Response");
		}
	});
}

//function to setup session storage
function initSession(){
	console.log("Setting up Session Storage");
	if(typeof(Storage) !== "undefined") {
		sessionStorage.SERVERIP = globalConfig.ip;
		sessionStorage.SERVERPORT = globalConfig.port;
		sessionStorage.ENVIRONMENT = globalConfig.env;
	} else {
		console.log("No Web Storage Support on your browse");
	}
	console.log("Setup and Config Complete :)");
	getServerStatus();
}

//Used as the success callback for getting external ip address
function getipSuccess(json){
	var exIP = json.ip;
	if(typeof(Storage) !== "undefined") {
		sessionStorage.EXTERNALIP = json.ip;
	} else {
		window.externalIP = json.ip;
	}
	if(globalConfig.ip == exIP){
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

//function called to make calls to determine external ip and set global config variable for use anywhere within the app
function getConfig(){
	console.log("Getting Config");
	loadJSON('config.properties',function(response){
		globalConfig = JSON.parse(response);
		if(globalConfig.env == "live"){
			$.ajax({
				url: "http://ipinfo.io",
				type: "GET",
				dataType: "JSON",
				success: function(response){
					console.log("ipinfo.io response : "+JSON.stringify(response));
					getipSuccess(response);
				},
				error: function(response) {
					console.log("Error with http://ipinfo.io : "+ JSON.stringify(response));
					console.log("Trying another source");
					$.ajax({
						url: "http://jsonip.appspot.com/callback=?",
						type: "GET",
						dataType: "JSON",
						success: function(response2){
							console.log("jsonip.appspot.com response : "+JSON.stringify(response2));
							getipSuccess(response2);
						},
						error: function(response2) {
							console.log("Error with http://jsonip.appspot.com : "+ JSON.stringify(response2));
							var config = {
								"ip":""
							}
							if(confirm("Assuming you are connecting from outside the servers router?") == true) {
								if(typeof(Storage) !== "undefined") {
									sessionStorage.EXTERNALIP = "1.1.1.1";
								} else {
									window.externalIP = "1.1.1.1";
								}
								config.ip = "1.1.1.1";
							} else {
								if(typeof(Storage) !== "undefined") {
									sessionStorage.EXTERNALIP = "173.33.147.9";
								} else {
									window.externalIP = "173.33.147.9";
								}
								config.ip = "173.33.147.9";
							}
							getipSuccess(config);
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

//function for testing ping to server
function ping(callback){
	var URL = "http://"+ getServerURL() + "/status.php";
	$.ajax({
		url: URL,
		timeout: 5000,
		success: function(result){
			if(result == "success"){
				callback("success");
			} else if (result == "error"){
				callback("error");
			} else {
				callback(result);
			}
		},
		error: function(result){
			callback("noresponse");
		}
	});
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
	var serverUp = false;
	if(typeof(Storage) != "undefined"){
		if(sessionStorage.SERVERSTATUS == "Connected"){
			serverUp = true;
		}
	} else {
		if(window.SERVERSTATUS == "Connected"){
			serverUp = true;
		}
	}

	if(serverUp){
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
					$("#workoutLoginMessage").removeClass("errorText").text("Logged in Successfully");
					sessionStorage.LOGGEDIN = true;
					loggedIn();
				} else if(reply=="invalid") {
					//alert("Invalid Credentials");
					$("#workoutLoginMessage").addClass("errorText").text("Invalid Credentials");
				} else {
					alert("An Error Occurred : " + reply);
					$("#workoutLoginMessage").addClass("errorText").text("An Error Occurred");
				}
			},
			error: function(error){
				alert(error);
			}
		});
	} else {
		console.log("Can't Login to Server when it is down");
		$("#workoutLoginMessage").addClass("errorText").text("Can't Login to Server when it is down");

	}

}

//init function - runs after page load
$(document).ready(function(){
	getConfig();
	if(typeof(Storage) !== "undefined") {
		if(sessionStorage.LOGGEDIN){
			alreadyLoggedIn();
		}
	} else {
		console.log("No Web Storage Support on your browser");
	}
});
