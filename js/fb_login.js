var facebookLogin;
function facebook_login() {
    var f = firebase.database();

    firebase.database().ref().on('value', function(snapshot) {
        console.log(snapshot.val());
    });
    
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

    this.loginFacebook = function() {
    	var provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function(result) {
  		// This gives you a Facebook Access Token. You can use it to access the Facebook API.
  		var token = result.credential.accessToken;
  		// The signed-in user info.
  		var user = result.user;
        var name = user.displayName;
        var email = user.email;
        var profilePicture = user.photoURL;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        console.log(user);

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }
        today = mm+'/'+dd+'/'+yyyy;
        
        firebase.database().ref('users/'+name).on('value',function(snapshot){
            if(!snapshot.exists()){
                firebase.database().ref('users/' + name +'/'+user.uid).set({
                        username: name,
                        profilePicture: profilePicture,
                        email: email,
                        date:today
                    });
                console.log("user with this name still does not exist");    
            }
            else{
                if(!snapshot.child(user.uid).exists()){
                    firebase.database().ref('users/' + name +'/'+user.uid).set({
                        username: name,
                        profilePicture: profilePicture,
                        email: email,
                        date:today
                    });    
                }else console.log("user already exists");
            }
        });
        localStorage.setItem("user",""+name+'/'+user.uid);
        window.location = 'landing.html'; 
       
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
	 facebookLogin = new facebook_login();

	$('#fb-login').on('click',function(e){
		 facebookLogin.loginFacebook();
	});

});
