'use strict';


//function login success function
function loggedIn(reply){
	$("#workoutLogin").fadeOut(1000, function() {
		$("#workoutContent").fadeIn(1000, function() {
			console.log("User ID : "+reply.id);
			console.log("Username : "+reply.username);
			console.log("First Name : "+reply.firstname);
			console.log("Last Name : "+reply.lastname);
			sessionStorage.USERID = reply.id;
			sessionStorage.USERUSERNAME = reply.username;
			sessionStorage.USERFIRSTNAME = reply.firstname;
			sessionStorage.USERLASTNAME = reply.lastname;
			dashboardUpdate();
		});
	});
}

//function logout
function loggedOut(){
	$("#workoutContent").fadeOut(500, function() {
		$("#workoutLogin").fadeIn(250, function() {
			sessionStorage.removeItem("USERID");
			sessionStorage.removeItem("USERUSERNAME");
			sessionStorage.removeItem("USERFIRSTNAME");
			sessionStorage.removeItem("USERLASTNAME");
		});
	});
}

//function for when already logged in
function alreadyLoggedIn(){
	$("#workoutLogin").fadeOut(10, function() {
		$("#workoutContent").fadeIn(10, function() {
			dashboardUpdate();
		});
	});
}

//function used for login confirmation with the server, called by section 4 Workout Tracking
function login() {
	if(serverUp()){
		var username = $('#username').val();
		var password = $('#password').val();
		var URL = "http://"+ getServerURL() + "/login.php";
		$.ajax({
			type: "POST",
			url: URL,
			dataType: "json",
			data: ("name="+username+"&pass="+password),
			success: function(reply) {
				if(reply.message =="success") {
					//alert("Logged In Successfully");
					console.log("Logged In Successfully");
					$("#workoutLoginMessage").removeClass("errorText").text("Logged in Successfully");
					sessionStorage.LOGGEDIN = true;
					$('#password').val("");
					loggedIn(reply);
				} else if(reply.message =="invalid") {
					//alert("Invalid Credentials");
					console.log("Invalid Credentials");
					$("#workoutLoginMessage").addClass("errorText").text("Invalid Credentials");
					$('#password').val("");
				} else if(reply.message == "error"){
					//alert("An Error Occurred : " + reply);
					console.log("An Error Occurred : " + reply.errormessage);
					$("#workoutLoginMessage").addClass("errorText").text("An Error Occurred");
					$('#password').val("");
				} else {
					console.log("An Uncaught Error Occurred");
					$("#workoutLoginMessage").addClass("errorText").text("An Error Occurred");
					$('#password').val("");
				}
			},
			error: function(error){
				console.log(JSON.stringify(error));
				alert("Error : " + JSON.stringify(error));
			}
		});
	} else {
		console.log("Can't Login to Server when it is down");
		$("#workoutLoginMessage").addClass("errorText").text("Can't Login to Server when it is down");

	}
}

//logout function
function logout() {
	sessionStorage.LOGGEDIN = false;
	console.log("Logging Out");
	loggedOut();
}

//enter to login
function loginButtonKeyup(event){
	if(event.keyCode == "13" || event.which == 13){
		login();
	}
}

//function to populate dashboards data
function dashboardUpdate(){
	$("#dashboardTitle").text(sessionStorage.USERFIRSTNAME + " " + sessionStorage.USERLASTNAME + "'s Dashboard");
	getWorkouts();
}

//function get workouts
function getWorkouts(){
	var userid = Number(sessionStorage.USERID);

	if(serverUp()){
		var URL = "http://"+ getServerURL() + "/getWorkouts";
		$.ajax({
			type: 'GET',
			url: URL,
			dataType: 'json',
			data: ("userid="+userid),
			success: function(reply){
				console.log("Workout Data Recieved for "+ sessionStorage.USERID + " : "+ sessionStorage.USERUSERNAME);
				window.workoutData = reply;
				for(var w=0; w<reply.length; w++){
					$('#workouts').append($("<div></div>").attr("id","workoutContainer"+w).attr("class","workoutContainer"));
					var workoutid = 'workout'+w;
					var workout = $("<div></div>").attr("id",workoutid).attr("class","workoutContent").attr("onclick","workoutClicked('workoutContainer"+w+"')").text('Workout at '+reply[w].location+' on '+reply[w].date+' at '+reply[w].starttime);
					$('#workoutContainer'+w).append(workout);
					for(var m=0; m<reply[w].move.length; m++){
						$('#workoutContainer'+w).append($("<div></div>").attr("id","moveContainer"+m+'workout'+w).attr("class","moveContainer hidden"));
						var moveid = 'move'+m;
						var amove = $("<div></div>").attr("id",moveid).attr("class","moveContent").attr("onclick","moveClicked('moveContainer"+m+"workout"+w+"')").text(reply[w].move[m].baseexercisename);
						$('#moveContainer'+m+'workout'+w).append(amove);
						for(var s=0; s<reply[w].move[m].set.length; s++){
							$('#moveContainer'+m+'workout'+w).append($("<div></div>").attr("id","setContainer"+s+'move'+m+'workout'+w).attr("class","setContainer hidden"));
							var setid = 'set'+s;
							var aset = $("<div></div>").attr("id",setid).attr("class","setContent").text(reply[w].move[m].set[s].exercise +" "+reply[w].move[m].set[s].settype+" Set - "+reply[w].move[m].set[s].reptime+" x "+reply[w].move[m].set[s].weight+reply[w].move[m].set[s].unit);
							$('#setContainer'+s+'move'+m+'workout'+w).append(aset);
						}
					}
				}
			},
			error: function(error){
				console.log(JSON.stringify(error));
				alert("Error : " + JSON.stringify(error));
			}
		})
	}
}

//function for workout content clicked
function workoutClicked(id){
	$('#'+id).children('.moveContainer').toggleClass('hidden');
}

//function for move content clicked
function moveClicked(id){
	$('#'+id).children('.setContainer').toggleClass('hidden');
}

