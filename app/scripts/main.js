// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBH8HTsYQBLPwnh9KfWVhDKxCW6fGgZVUM",
  authDomain: "fifa-manager-4b146.firebaseapp.com",
  databaseURL: "https://fifa-manager-4b146.firebaseio.com",
  storageBucket: ""
});

// ==================== GLOBAL VARIABLES =============================
let graficoResumo;
// ===================================================================


// ===================== HANDLEBARS HELPERS ==========================
Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if(lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});



// ===================================================================
// ======== Function to interact with Facebook, both =================
// ======== login and logout =========================================
// ===================================================================
function facebook_login(f, userInfo) {
    this.provider = new firebase.auth.FacebookAuthProvider();
    this.userInfo = userInfo;
    const that = this;

    this.loginFacebook = function() {
        firebase.auth().signInWithPopup(that.provider).then(function(result) {
  	    that.userInfo.token = result.credential.accessToken;
            that.userInfo.name = result.user.displayName;
            that.userInfo.email = result.user.email;
            that.userInfo.profilePicture = result.user.photoURL;
            userInfo.uid = result.user.uid
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
            that.userInfo.today = mm+'/'+dd+'/'+yyyy;
            firebase.database().ref('usersFacebook').on('value',function(snapshot){
                if(!snapshot.child(that.userInfo.uid).exists()){
                    firebase.database().ref('usersFacebook/'+that.userInfo.uid).set({
                        userName: that.userInfo.name,
                        profilePicture: that.userInfo.profilePicture,
                        email: that.userInfo.email,
                        date:that.userInfo.today,
                    });    
                }else console.log("user already exists");
            });
            render_main(userInfo);
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
    	userInfo = {};
        firebase.auth().signOut().then(function() {
        	location.reload();
        }, function(error) {
            console.log(error);
        });
    };
}

// ===================================================================
// ======== Function to populate the Pop-ups with the right ==========
// ======== template and then open the Pop-up ========================
// ===================================================================
function open_popup(popup, obj){
	if (popup == 'navbar_criar_grupo') popup='criar_grupo';
	if (popup == 'add_partida_circle') popup='add_partida';
	popup = popup + '_popup';
	switch (popup){
		case 'criar_grupo_popup':
			let criarGrupoPopup = MyApp.templates.criarGrupoPopup();
			$('.popup').html(criarGrupoPopup);
			break;
		case 'convidar_amigos_popup':
			let convidarAmigosPopup = MyApp.templates.convidarAmigosPopup();
			$('.popup').html(convidarAmigosPopup);
			break;
		case 'add_partida_popup':
			let addPartidaPopup = MyApp.templates.addPartidaPopup({obj:obj});
			$('.popup').html(addPartidaPopup);
			break;
		case 'nomeUsuario_popup':
			let addnomeUsuariopup = MyApp.templates.nomeUsuarioPopup({obj:obj});
			$('.popup').html(addnomeUsuariopup);
			break;
		case 'navbar_convite_amizade_popup':
			let conviteAmizadePopup = MyApp.templates.conviteAmizadePopup({obj:obj});
			$('.popup').html(conviteAmizadePopup); 
			break;

	}

	$.magnificPopup.open({
		items: {
			src: '.popup',
			type: 'inline'
		},
		callbacks: {
		    open: function() {
		      $.magnificPopup.instance.close = function() {
        		$('#integrantes_grupo li:not(:first)').remove();
				$('#lista_adicionar_amigos li:not(:first)').remove();
		        $.magnificPopup.proto.close.call(this);
		      };
		    }
		}
	});
}


// ===================================================================
// ======== Function to render Chart.js that shows the score =========
// ======== of a player in a group, against a friend or overall ======
// ===================================================================
function criar_grafico(userInfo){
	let graficoContainer = $("#myChart");
	
	graficoResumo = new Chart(graficoContainer, {
	    type: 'pie',
	    data: {
	        labels: ["Venceu", "Empatou", "Perdeu"],
	        datasets: [{
	            label: 'numero de partidas',
	            data: [userInfo.venceu, userInfo.empatou, userInfo.perdeu],
	            backgroundColor: [
	                "green",
	                "blue",
	                "red"
	            ],
	            hoverBackgroundColor: [
	                "darkgreen",
	                "darkblue",
	                "darkred"
	            ]
	        }]
	    },
	    options: {
	        
	    }
	});
	
}

// ==================================================
// ======== Render Main View after login ============
// ==================================================
function render_main(userInfo,that){
	f = firebase.database();
	f.ref('usersFacebook/'+userInfo.uid).once('value',function(snapshot){
		// NICKNAME
		if(!snapshot.child("nickName").exists()){
			//se entrou aqui, usuario ainda nao tem nick name
			console.log('doesnt have nickName');
			open_popup("nomeUsuario", userInfo);
		}else userInfo.userNickName = snapshot.val().nickName;

		if(snapshot.child("friendRequestReceived").exists()){
			console.log('Has friend Request');
			userInfo.friendRequests = snapshot.val().friendRequestReceived;
		}

		if(snapshot.val()){
			// POPULATE FRIENDS
			userInfo.friends = snapshot.val().friends;
			// POPULATE GROUPS 
			userInfo.groups = snapshot.val().groups;
		
		}
		
		// POPULATE THE USER INFORMATION ABOUT GAMES PLAYED
		if(snapshot.child("venceu").exists()){
			userInfo.venceu = snapshot.val().venceu;
		}else{
			firebase.database().ref('usersFacebook/' + userInfo.uid).update({
		    venceu: 0
		});
			userInfo.venceu = 0;
		}	

		if(snapshot.child("perdeu").exists()){
			userInfo.perdeu = snapshot.val().perdeu;	
		}else{
			firebase.database().ref('usersFacebook/' + userInfo.uid).update({
		    perdeu: 0
		});
			userInfo.perdeu = 0;
		}

		if(snapshot.child("empatou").exists()){
			userInfo.empatou = snapshot.val().empatou;

		}else{
			firebase.database().ref('usersFacebook/' + userInfo.uid).update({
		    empatou: 0
		});
			userInfo.empatou = 0;
		}

		//userInfo.friendRequests = snapshot.val().friendRequestReceived
		userInfo.total = userInfo.perdeu + userInfo.empatou + userInfo.venceu;
		
		// ==================== DINAMIC PARTIALS ====================
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		Handlebars.registerPartial("mainHeader", mainHeader);

		groupslist = MyApp.templates.groupslist({obj:userInfo});
		Handlebars.registerPartial("groupslist", groupslist);

		friendslist = MyApp.templates.friendslist({obj:userInfo});
		Handlebars.registerPartial("friendslist", friendslist);

		resumo = MyApp.templates.resumo({obj:userInfo});
		Handlebars.registerPartial("resumo", resumo);
		// ==========================================================

		//criar_grafico(userInfo);
		let navbar = MyApp.templates.navbar({name:userInfo.name, pic:userInfo.picture});
		let main;
		let isMobile = window.matchMedia("only screen and (max-width: 760px)");
		if (isMobile.matches) {
    		main = MyApp.templates.mainMobile({obj:userInfo});
    	}else{
    		main = MyApp.templates.main({obj:userInfo});
    	}
		$('.conteudo').html(navbar).append(main);

	});	
	
}


$(function(){

	// ========== Initializing variables ===========
	let userInfo = {};
	userInfo.pageInfo = {};
	userInfo.pageInfo.context = 'Resumo';
	userInfo.pageInfo.mode = 'Geral';
	let mainHeader, resumo, groupslist, friendslist;
	let recenteTemplate = null;
	// =============================================


	// initialize firebase
	let f = this.f = firebase.database();
	// loads user from localStorage
	this.user = localStorage.getItem('user');
	// initialize user's nickname
	this.userNickName = null;
	// pass the actual state of the database to that, this way we can refer to it later 
	const that = this;

	// Verify if user is signed in to decide which template should be loaded
	firebase.auth().onAuthStateChanged(function(user) {
  		if (user) {
    		// User is signed in.
            userInfo.uid = user.uid
            userInfo.name = user.displayName;
            userInfo.picture = user.photoURL;
            render_main(userInfo,that);

  		} else {
    	    // No user is signed in
    		let home = MyApp.templates.home();
			$('.conteudo').html(home);
  		}
	});
	// ======================================================================


	// ================ Login and Logout FB =========================
	$(document).on('click','#fb_login', function(e){
		let facebookLogin = new facebook_login(f, userInfo);
		facebookLogin.loginFacebook();
	});

	$(document).on('click', '#fb_logout', function(e){
		var fb_login = new facebook_login(f, userInfo);
		fb_login.logout();
	});
	// ==============================================================



	// =================== FRONTEND LISTENERS =======================

	// Popups
	$(document).on('click', '#criar_grupo, #convidar_amigos, #add_partida, #navbar_criar_grupo, #navbar_convite_amizade, #add_partida_circle', function(e){
		open_popup(this.id, userInfo);

		//ADD one more member input on criar grupo popup
		$('#add_membros_input').click(function(){
			let newmemberinput = "<li class='list-group-item'><input class='form-control' type='text' placeholder='Nome'></li>"
			$('#integrantes_grupo').append(newmemberinput);
		});

		$('#add_amigos_input').click(function(){
			let newmemberinput = "<li class='list-group-item'><input class='form-control' type='text' placeholder='Nome'></li>"
			$('#lista_adicionar_amigos').append(newmemberinput);
		});

		

	});

	//Cancelar
	$(document).on('click', '.cancelar',  function(e){
		$('#integrantes_grupo li:not(:first)').remove();
		$('#lista_adicionar_amigos li:not(:first)').remove();
		e.preventDefault();
		$.magnificPopup.close();
	});	

	// Recente - Resumo
	$(document).on('click', '#resumo, #recente', function(){		
		this.id == 'resumo' ? userInfo.pageInfo.context = 'Resumo' : userInfo.pageInfo.context = 'Recente';
		
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		$('.main-header-wrapper').html(mainHeader);
		
		if(userInfo.pageInfo.context == 'Recente'){
			if(recenteTemplate == null){
				recenteTemplate = MyApp.templates.recente({obj:userInfo});
				Handlebars.registerPartial("recenteTemplate", recenteTemplate);
				$('.main-content').append(recenteTemplate);
			}else{
				$('#recente-content').show();
			}
			$('#resumo-content').hide();			
		}else{
			$('#resumo-content').show();
			$('#recente-content').hide()
		}

		
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
	});

	//Geral Click
	$(document).on('click', '#geral>a', function(){
		$('#friends_list a').removeClass('active');
		$('#groups_list a').removeClass('active');
		$(this).addClass('active');
		userInfo.pageInfo.mode = $(this).text();
		

		//change main header
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		$('.main-header-wrapper').html(mainHeader)

	});

	//Group Click
	$(document).on('click', '#groups_list>a', function(){
		let htmlText = '' + $(this).text();

		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$('#friends_list a').removeClass('active');
		$('#geral').removeClass('active');
		
		
		that.f.ref('groups').once('value', function(snapshot){
			let groupsObj;
			let groupObj;
			groupsObj = snapshot.val();
			groupObj = groupsObj[htmlText];
			
		});
		
		//change main header
		userInfo.pageInfo.mode = htmlText;
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		$('.main-header-wrapper').html(mainHeader);

	});

	//Friends Click
	$(document).on('click', '#friends_list>a', function(){
		let htmlText = '' + $(this).text();

		$(this).addClass('active');
		$('#groups_list a').removeClass('active');
		$(this).siblings().removeClass('active');
		$('#geral').removeClass('active');

		let friendObj = userInfo.friends[htmlText];
		userInfo.venceu = friendObj.venceu;
		userInfo.perdeu = friendObj.perdeu;
		userInfo.empatou = friendObj.empatou;

		//change main header
		userInfo.pageInfo.mode = htmlText;
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		$('.main-header-wrapper').html(mainHeader);

		//change resumo
		graficoResumo.data.datasets[0].data = [userInfo.venceu, userInfo.empatou, userInfo.perdeu];
		graficoResumo.update();
		

	});

	//ADD Nickname
	$(document).on('click', "#add_nome_usuario", function(e){
		e.preventDefault();
		var nickName = $('#nome_usuario')[0].value
		var nameValidation = /^[a-zA-Z0-9.\-_$@*!]{3,30}$/.test(nickName)
		if(nameValidation){
			f.ref('usersNickNames').once('value',function(snapshot){
				if(!snapshot.child(nickName).exists()){
					f.ref('usersFacebook/'+userInfo.uid).update({nickName:nickName});
					f.ref('usersNickNames/'+nickName).set(userInfo.uid);
					userInfo.userNickName = nickName;
					$.magnificPopup.close();
					return;
				}else alert("User with this nickname already exists");
			});
		}else{
			alert("Name does not match");
		}
		$.magnificPopup.close();
	});


	//ADD Partida
	$(document).on('click', '#add_nova_partida_btn', function(e){
		e.preventDefault();
		var adversario_nome = $("#adversario_nome option:selected").text();
		var usuario_time = $('#usuario_time')[0].value
		var usuario_gols = $('#usuario_gols')[0].value
		var adversario_time = $('#adversario_time')[0].value
		var adversario_gols = $('#adversario_gols')[0].value
		var add_nova_partida_group = $("#add_nova_partida_group option:selected").text();
		that.f.ref('usersFacebook/'+that.user+'/friends').once('value',function(snapshot){
			if(snapshot.child(adversario_nome).exists()){
				var usuario_empatou = snapshot.val()[adversario_nome].empatou;
				var usuario_venceu = snapshot.val()[adversario_nome].venceu;
				var usuario_perdeu = snapshot.val()[adversario_nome].perdeu;
				f.ref('usersNickNames/'+adversario_nome).once("value",function(snapshot){
					let friendId = snapshot.val()[Object.keys(snapshot.val())[0]];
					if(usuario_time==''){
						alert('Please enter your team');
						return;	
					}
					if(adversario_time==''){
						alert('Please enter your friend\'s team');
						return;
					}
					
					that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName).once('value',function(adversario_snapshot){
						var adversario_empatou = adversario_snapshot.val().empatou;
						var adversario_venceu = adversario_snapshot.val().venceu;
						var adversario_perdeu = adversario_snapshot.val().perdeu;
						var nova_partida = {}
    	        		let partida_obj = {
    	 	   	    		'player1':that.userNickName,	
		  	          		'player2':adversario_nome,
   		 	        		'player1Goals':usuario_gols,
    	    	    		'player2Goals':adversario_gols,
	    	        		'player1Team':usuario_time,
 	  	    	     		'player2Team':adversario_time
 	  	  		       	}	   		         	
		            	var time_stamp = Math.floor(Date.now() / 1000); 
   			         	nova_partida[time_stamp] = partida_obj;	
						if(add_nova_partida_group!='Nenhum'){			
							that.f.ref('groups/'+add_nova_partida_group+'/jogos').update(nova_partida);
						}
						nova_partida[time_stamp].group = add_nova_partida_group;
						that.f.ref('usersFacebook/'+that.user+'/friends/'+adversario_nome+'/jogos').update(nova_partida);
						that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName+'/jogos').update(nova_partida);
						if(usuario_gols > adversario_gols){
							userInfo.venceu++;
							that.f.ref('usersFacebook/'+that.user+'/venceu').transaction(function(venceu){
	    						return (+venceu+1);
							});
							that.f.ref('usersFacebook/'+friendId+'/perdeu').transaction(function(perdeu){
	    						return (+perdeu+1);
							});
							that.f.ref('usersFacebook/'+that.user+'/friends/'+adversario_nome+'/venceu').set(usuario_venceu+1);
							that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName+'/perdeu').set(adversario_perdeu+1);
						}
						else if(usuario_gols < adversario_gols){
							userInfo.perdeu++;
							that.f.ref('usersFacebook/'+that.user+'/perdeu').transaction(function(perdeu){
	    						return (+perdeu+1);
							});
							that.f.ref('usersFacebook/'+friendId+'/venceu').transaction(function(venceu){
	    						return (+venceu+1);
							});
							that.f.ref('usersFacebook/'+that.user+'/friends/'+adversario_nome+'/perdeu').set(usuario_perdeu+1);
							that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName+'/venceu').set(adversario_venceu+1);		
						}else{
							userInfo.empatou++;
							that.f.ref('usersFacebook/'+that.user+'/empatou').transaction(function(empatou){
	    						return (+empatou+1);
							});
							that.f.ref('usersFacebook/'+friendId+'/empatou').transaction(function(empatou){
	    						return (+empatou+1);
							});
							that.f.ref('usersFacebook/'+that.user+'/friends/'+adversario_nome+'/empatou').set(usuario_empatou+1);
							that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName+'/empatou').set(adversario_empatou+1);		

						}
						userInfo.total = userInfo.venceu + userInfo.empatou + userInfo.perdeu;						

						graficoResumo.data.datasets[0].data = [userInfo.venceu, userInfo.empatou, userInfo.perdeu];
						graficoResumo.update();

						mainHeader = MyApp.templates.mainHeader({obj:userInfo});						
						$('.main-header-wrapper').html(mainHeader);

						$.magnificPopup.close();
					});
				

				});	
				
			}else alert("We could not find "+adversario_nome);			
		});
	});

	//ADD novo grupo
	$(document).on('click', '#add_novo_grupo_btn', function(event){
		event.preventDefault();
		var listItems = $("#integrantes_grupo li input");
		f.ref('groups').once('value',function(snapshot){
			var group_name = $("#novo_grupo_nome")[0].value
			if(!snapshot.child(group_name).exists()){
				
				var group_creator = {};
				group_creator[userInfo.userNickName] = userInfo.uid;
				f.ref('groups/'+group_name+'/membros').set(group_creator);
				var group_name_obj = {};
				group_name_obj[group_name] = group_name;
				f.ref('usersFacebook/'+userInfo.uid+'/groups').update(group_name_obj);
				listItems.each(function(idx, input){
				var input = $(input);
    				var friend_name = input[0].value
    				if(friend_name != ''){
    					f.ref('usersNickNames').once('value',function(snapshot){		
    						if(snapshot.child(friend_name).exists()){
								f.ref('usersNickNames/'+friend_name).once("value",function(snapshot){
									let friendId = snapshot.val();
									var foo = {};
									foo[friend_name] = friendId;
									f.ref('groups/'+group_name+'/membros').update(foo);
									f.ref('usersFacebook/'+friendId+'/groups').update(group_name_obj);
								});
								if(!userInfo.groups)userInfo.groups = {}
								userInfo.groups[group_name] = group_name;
								groupslist = MyApp.templates.groupslist({obj:userInfo});
								$('#groups_list').html(groupslist);
    						}
    						else alert("We could not find "+friend_name);
						});	
    				}else alert("Please do not enter an empty name")	
				});
			
			}
			
			else{
				alert('Group: '+group_name+' already exists');	
			}
			
			
		});
		$.magnificPopup.close();
	});

	//ADD New friend
	$(document).on('click','#add_amigos_btn',function(e){
		e.preventDefault();
		var friend_name = $("list-group-item li input").val();
		$('#lista_adicionar_amigos li input').each(function(i)
		{
   			$(this).attr('rel');
			var friend_name = $(this)[0].value;					
			f.ref('usersNickNames').once('value',function(snapshot){
				if(snapshot.child(friend_name).exists()){
					f.ref('usersFacebook/'+userInfo.uid+'/friends').once('value',function(snapshot){
						if(!snapshot.child(friend_name).exists()){			
							f.ref('usersNickNames/'+friend_name).once("value",function(snapshot){
								friendId = snapshot.val()
								var foo = {};
								foo[friend_name] = friendId;
								var bar = {};
								bar[userInfo.userNickName] = userInfo.uid;
								f.ref('usersFacebook/'+userInfo.uid+'/friendRequestSent').update(foo);
								f.ref('usersFacebook/'+friendId+'/friendRequestReceived').update(bar);
							});
						}else alert("user "+friend_name+" already is your friend");
					});
				
				}else alert("We could not find "+friend_name);
			});
		});
		$.magnificPopup.close();

	});

	//Request amizade

	//Aceitar
	$(document).on('click','#friend_request_list>li>div>.btn:first-of-type',function(e){
		var id = this.id.substring(24,e.target.id.length);
		f.ref('usersNickNames/'+id).once("value",function(snapshot){
			var friendRequestFbUrl = snapshot.val();
			f.ref('usersFacebook/'+userInfo.uid+'/friendRequestReceived/'+id).remove();
			f.ref('usersFacebook/'+friendRequestFbUrl+'/friendRequestSent/'+userInfo.userNickName).remove();

			f.ref('usersFacebook/'+userInfo.uid+'/friends/'+id).update({
				venceu:0,
				perdeu:0,
				empatou:0	
			});

			f.ref('usersFacebook/'+friendRequestFbUrl+'/friends/'+userInfo.userNickName).update({
				venceu:0,
				perdeu:0,
				empatou:0	
			});
			
		});

		// I've done this "work around" here to retrieve the friends and update them instantly in the UI, but it takes one more request to Firebase,
		// please let me know if you have a better idea of how to do that, I've already tried creating new objects but it doesn't work due
		// the asynchronous nature of the code.

		f.ref('usersFacebook/'+userInfo.uid).once('value',function(snapshot){
			userInfo.friends = snapshot.val().friends;
			friendslist = MyApp.templates.friendslist({obj:userInfo});
			$('#friends_list').html(friendslist);
		});

		$.magnificPopup.close();

	});

	//Rejeitar
	$(document).on('click','#friend_request_list>li>div>.btn:last-of-type',function(e){
		var id = this.id.substring(25,e.target.id.length);
		//Basically, get rid of the friend request in both the UI and Firebase

	});

});
























