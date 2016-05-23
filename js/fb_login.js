var ll;
function LiveLinks(fbname) {
    var f = firebase.database();

    //var fifaManagerUsers= f.child('fifaManager/users');
    console.log(f);
    firebase.database().ref().on('value', function(snapshot) {
        console.log(snapshot.val());
    });
    /*
    this.fifaManagerUsers = fifaManagerUsers;
    console.log("fifa users"+this.fifaManagerUsers);
    var uid;
    var instance = this;
	*/

    //overridable functions
    this.onLogin = function(user) {};
    this.onLoginFailure = function() {};
    this.onLogout = function() {};
    this.onError = function(error) {};

    // long running firebase listener
    this.start = function() {
        firebase.onAuth(function (authResponse) {
            if (authResponse) {
                console.log("user is logged in");
                kamonaUsers.child(authResponse.uid).once('value', function(snapshot) {
                    instance.userData = authResponse;
                    localStorage.setItem("uid",authResponse.uid);
                    instance.onLogin(snapshot.val());
                });
            } else {
                console.log("user is logged out");
                instance.onLogout();
            }
        });
    };

    this.uid = function() {return uid;};

    this.loginFacebook = function(email,password) {
    	var provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function(result) {
  		// This gives you a Facebook Access Token. You can use it to access the Facebook API.
  		var token = result.credential.accessToken;
  		// The signed-in user info.
  		var user = result.user;
  		console.log(user);
        var name = user.displayName;
        var email = user.email;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }
        today = mm+'/'+dd+'/'+yyyy;
        
        firebase.database().ref('users/'+user.uid).on('value',function(snapshot){
            if(!snapshot.exists()){
                firebase.database().ref('users/' + user.uid).set({
                    username: name,
                    email: email,
                    date:today
                });
            }
            else console.log("user already exists");
        });
       
  		// ...
		}).catch(function(error) {
			// Handle Errors here.
 			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
 			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
		    var credential = error.credential;
  			// ...
		});

    };
    // logout
    this.logout = function() {
        this.firebase.unauth();
        localStorage.clear();
        instance.auth=null;
        location.reload();
    };
}


$(function(){
	 ll = new LiveLinks("brunobraga");

	$('#fb_login').on('click',function(e){
		 ll.loginFacebook();
	});

});