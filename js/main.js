'use strict';

var globalConfig = {
	"ip":"",
	"port":"",
	"env":""
};

var navClickedBool = false;

//function to get system status
function getServerStatus(status){
	console.log("Getting Server Status");
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

//function to get config from config.properties. Test connection to server and set variables
function getConfig(){
	console.log("Getting Config");
	loadJSON('config.properties',function(response){
		globalConfig = JSON.parse(response);
		ping("http://"+globalConfig.ip+":"+globalConfig.port,function(result){
			if(result == "noresponse"){
				console.log("External IP timeout. Checking Internal");
				ping("http://"+globalConfig.intip+":"+globalConfig.port,function(result2){
					sessionStorage.SERVERIP = globalConfig.intip;
					sessionStorage.SERVERPORT = globalConfig.port;
					console.log("Connecting via "+globalConfig.intip+":"+globalConfig.port);
					getServerStatus(result2);

				});
			} else {
				sessionStorage.SERVERIP = globalConfig.ip;
				sessionStorage.SERVERPORT = globalConfig.port;
				console.log("Connecting via "+globalConfig.ip+":"+globalConfig.port);
				getServerStatus(result);
			}
		});
	});
}

//function for testing ping to server
function ping(url,callback){
	var URL = url + "/status.php";
	$.ajax({
		url: URL,
		type: "GET",
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
		error: function(){
			callback("noresponse");
		}
	});
}

//function that gets the server address for use of server calls
function getServerURL() {
	return (sessionStorage.SERVERIP+":"+sessionStorage.SERVERPORT);
}

//function to return if server is up
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

function accountLinkMouseOver(site){
	$('#'+site).toggleClass(site+'unselected').toggleClass(site);
}


//init function - runs after page load
$(document).ready(function(){
	$('#javascriptOffMessage').addClass('hidden');
	$('#NavSection').removeClass('hidden');
	$( "#newWorkoutDate" ).datepicker({ dateFormat: 'yy-mm-dd'});
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
