function facebook_login() {
    this.f = firebase.database();
    this.provider = new firebase.auth.FacebookAuthProvider();
    that = this;

    this.loginFacebook = function() {
        firebase.auth().signInWithPopup(that.provider).then(function(result) {
  		    that.token = result.credential.accessToken;
  		    that.user = result.user;
            that.name = that.user.displayName;
            that.email = that.user.email;
            that.profilePicture = that.user.photoURL;
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1;
            var yyyy = today.getFullYear();
            if(dd<10) {
                dd='0'+dd;
            }

            if(mm<10) {
                mm='0'+mm;
             }
            today = mm+'/'+dd+'/'+yyyy;
            firebase.database().ref('usersFacebook').on('value',function(snapshot){
                if(!snapshot.child(that.user.uid).exists()){
                    firebase.database().ref('usersFacebook/'+that.user.uid).set({
                        userName: that.name,
                        profilePicture: that.profilePicture,
                        email: that.email,
                        date:that.today,
                    });    
                }else console.log("user already exists");
            });
            localStorage.setItem("user",that.user.uid);
            window.location = 'landing.html'; 

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
        firebase.auth().signOut().then(function() {
            localStorage.clear();
            window.location = "index.html";
        }, function(error) {
            console.log(error);
        });
    };
}


$(function(){
	 var facebookLogin = new facebook_login();

	$('#fb-login').on('click',function(e){
		 facebookLogin.loginFacebook();
	});

});
