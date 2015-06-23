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
			sessionStorage.SERVERSTATUS = "Connected";
			$("#workoutServerStatus").css("background-image",'url("img/StatusLightGreen.png")').text("Connected");
		} else if(status == "noresponse"){
			console.log("Server Not Available");
			sessionStorage.SERVERSTATUS = "Not Available";
			$("#workoutServerStatus").css("background-image","url('img/StatusLightRed.png')").text("Not Available");
		} else if(status == "error"){
			console.log("Server Returned Error");
			sessionStorage.SERVERSTATUS = "Error";
			$("#workoutServerStatus").css("background-image","url('img/StatusLightAmber.png')").text("Error");
		} else {
			console.log("An Unknown Server Response Received");
			sessionStorage.SERVERSTATUS = "Unknown";
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
	sessionStorage.EXTERNALIP = json.ip;
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
								sessionStorage.EXTERNALIP = "1.1.1.1";
								config.ip = "1.1.1.1";
							} else {
								sessionStorage.EXTERNALIP = "173.33.147.9";
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
	return (sessionStorage.SERVERIP+":"+sessionStorage.SERVERPORT);
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

//function to return in server is up
function serverUp(){
	if(sessionStorage.SERVERSTATUS == "Connected"){
		return true;
	} else {
		return false;
	}
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
	},800,function() {
		navClickedBool = false;
	});

}


//init function - runs after page load
$(document).ready(function(){
	$('#javascriptOffMessage').addClass('hidden');
	$('#NavSection').removeClass('hidden');
	getConfig();
	if(typeof(Storage) !== "undefined") {
		if(sessionStorage.LOGGEDIN == "true"){
			alreadyLoggedIn();
		}
	} else {
		var message = "No Web Storage Support on your browser.\n" +
			"Some features may not function as designed.\n" +
			"You should update your browser to the latest version to ensure compatibility with this site.";
		console.log(message);
		alert(message);
	}
});
