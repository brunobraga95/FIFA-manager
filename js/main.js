$(function(){
	var f = this.f = firebase.database();
    this.user = localStorage.getItem("user");
    this.userNickName = null;
    that = this;
    f.ref('usersFacebook/'+that.user).on('value',function(snapshot){
      $('.profile-pic').attr("src",snapshot.val().profilePicture);
      $('.dropdown-toggle').html("<img class=\"profile-pic\" src=\""+snapshot.val().profilePicture+"\">"+snapshot.val().userName+"<span class=\"caret\"></span>");
      
       if(!snapshot.child("nickName").exists()){
       	$.magnificPopup.open({
  			items: {
    			src: '#nome_usuario_popup',
    			type: 'inline'
  			}
		});

       }else that.userNickName = snapshot.val().nickName;

       if(snapshot.child("friendRequestReceived").exists()){
       	$.magnificPopup.open({
    		items: {
        	src: '#convite_amizade_popup',
        	type: 'inline'
    		}
		});
		f.ref('usersFacebook/'+that.user+'/friendRequestReceived').on("value",function(snapshot){
			var requestArray = snapshot.val();
			for(var key in requestArray){
				var friendRequestInvitation = "<li class=\"list-group-item \" style=\"display:flex;justify-content: space-between\">"+
							"<p style=\"margin:0;\"><b>"+key+"</b></p><div><button class=\"btn btn-success accept-friend-request\" id = \"friendRequestAccept"+key+"\">Aceitar</button>"+
							"<button class=\"btn btn-danger reject-friend-request\" id = \"friendRequestReject"+key+"\">Rejeitar</button></div></li>"
				$("#friend-request-list").append(friendRequestInvitation);
			}
		});

       }

       var friends = snapshot.val().friends;
       if(friends){
       		for(key in friends){
       			var userFriend = "<li class=\"list-group-item\" id=\"fifa-amigos-"+key+"\">"+key+"</li>";
       			$("#todos-amigos").append(userFriend);
       		}
       }

      if(snapshot.child("venceu").exists()){
      	$("#venceu").html("Venceu: "+snapshot.val().venceu);
      	localStorage.setItem("venceu",snapshot.val().venceu);

      }else{
      	firebase.database().ref('usersFacebook/' + that.user).update({
            venceu: 0
        });
      	localStorage.setItem("venceu",0);
      }	

      if(snapshot.child("perdeu").exists()){
      	$("#perdeu").html("Perdeu: "+snapshot.val().perdeu);
      	localStorage.setItem("perdeu",snapshot.val().perdeu);	
      }else{
      	firebase.database().ref('usersFacebook/' + that.user).update({
            perdeu: 0
        });
        localStorage.setItem("perdeu",0);
      }

      if(snapshot.child("empatou").exists()){
      	$("#empatou").html("Empatou: "+snapshot.val().empatou);
      	localStorage.setItem("empatou",snapshot.val().empatou);

      }else{
      	firebase.database().ref('usersFacebook/' + that.user).update({
            empatou: 0
        });
        localStorage.setItem("empatou",snapshot.val().empatou);
      }

      if(snapshot.child("jogou").exists()){
      	$("#jogou").html("Jogou: "+snapshot.val().jogou);
      	localStorage.setItem("jogou",snapshot.val().jogou);

      }else{
      	firebase.database().ref('usersFacebook/' + that.user).update({
            jogou: 0
        });
        localStorage.setItem("jogou",snapshot.val().jogou);
      }


    });


    /* FRONTEND JS */

	var partidas = 0;
	$('#resumo').click(function(){
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		if (partidas != 0) {
			$('.canvas-container').removeClass('hidden');
			$('.recente-wrapper').addClass('hidden');
		}
		$('.main-header > h1 > small').html('Resumo');
		$('.main-sub-header').removeClass('hidden');

	});
	$('#recente').click(function(){
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		if(partidas != 0){
			$('.canvas-container').addClass('hidden');
			$('.recente-wrapper').removeClass('hidden');
		}
		$('.main-header > h1 > small').html('Recente');
		$('.main-sub-header').addClass('hidden');
		
	}); 	
		
	$('#add_nome_usuario').unbind().click(function(e){
    	var flag = false;
    	e.preventDefault();
		var nickName = $("#nome_usuario").val();
		if(nickName.indexOf(' ')>=0){
			alert("Please do not enter white spaces");
			return;
		}
		else{
			f.ref('usersNickNames').on('value',function(snapshot){
				if(!snapshot.child(nickName).exists()){
					that.userNickName = nickName;
					flag = true;
					f.ref('usersFacebook/'+user).update({nickName:nickName});
					f.ref('usersNickNames/'+nickName).set({facebookId:that.user});
					$.magnificPopup.close();
					return;
				}else if(!flag)alert.log("User with this nickname already exists");
			});
		}
	});
	
	$('#todos-grupos, #todos-amigos, #geral').on('click', 'li', function(event){
		/* TRATA O CLICK EM ELEMENTOS DA SIDEBAR */
		var elemId = $(this).attr('id');
		if(elemId != undefined){
			if($('#resumo').hasClass('active')){
				var str = underlineToSpaces(elemId.substring(12)) + '<small>Resumo</small>'
			}else{
				var str = underlineToSpaces(elemId.substring(12)) + '<small>Recente</small>'
			}
			$('.main-header h1').html(str);
			$('#todos-amigos li, #todos-grupos li, #geral li').removeClass('active');
			$(this).addClass('active');
		}
	});

	var membrosGrupoCont=3;
	$('#add_pessoa').click(function(){
		$(this).prev().append("<li class='list-group-item adicionado-dinamicamente'><input class='form-control' type='text' name='amigo' id='membro_nome" + membrosGrupoCont + "' placeholder='Nome'></li>");
		membrosGrupoCont++;
	});

	var convidarAmigos = [];
	var amigosCont=1;
	$('#add_mais_amigos').click(function(){
		var amigo_index = 'amigo_nome' + amigosCont;
		$(this).prev().append("<li class='list-group-item adicionado-dinamicamente'><input class='form-control' type='text' name='amigo' id='" + amigo_index + "' placeholder='Nome'></li>");
		convidarAmigos.push(amigo_index);
		amigosCont++;
	});


	/* BOTAO CANCELAR PARA TODAS AS POPUPS */
	$('.cancelar').click(function(e){
		popupAux(e);
	});

	function popupAux(event){
		event.preventDefault();
		$.magnificPopup.close();
	}

	function spacesToUnderline(val){
		return val.replace(/\s/g, '_');
	}

	function underlineToSpaces(val){
		return val.replace(/_/g,' ');
	}

	$('#add_novo_grupo_btn').click(function(event){
		/* CODIGO PARA ADICIONAR GRUPO */
		$('#todos-grupos').append("<li class='list-group-item' id=" + 'fifa-grupos-' + spacesToUnderline(novo_grupo_nome.value) + ">" + novo_grupo_nome.value + "</li>");
		$('#todos-grupos li:last-child').trigger('click');
		popupAux(event);

	});
	$('#add_nova_partida_btn').click(function(event){
		/* CODIGO PARA ADICIONAR PARTIDA */
		$('.recente-wrapper').append("<div><h5>" + adversario_nome.value + "</h5><h6>" + usuario_time.value +" " + usuario_gols.value + " x "+ adversario_gols.value + "  "+ adversario_time.value + " </h6></div>");
		if (usuario_gols.value > adversario_gols.value) {estatisticas[0]++;}
		if (usuario_gols.value == adversario_gols.value) {estatisticas[1]++;}
		if (usuario_gols.value < adversario_gols.value) {estatisticas[2]++;}
		partidas++;
		$('.nenhuma-partida').addClass('hidden');
		if($('#resumo').hasClass('active')){
			$('.canvas-container').removeClass('hidden');
		}else{
			$('.recente-wrapper').removeClass('hidden');
		}
		graficoResumoGeral.data.datasets[0].data = estatisticas;
		graficoResumoGeral.update();
		popupAux(event);

	});
	$('#add_amigos_btn').click(function(event){
		/* CODIGO PARA ADICIONAR AMIGOS */
		$('#todos-amigos').append("<li class='list-group-item' id=" + 'fifa-amigos-' + spacesToUnderline($('#amigo_nome0').val()) + ">" + $('#amigo_nome0').val() + "</li>");
		for(var i=0; i<convidarAmigos.length; i++){
			console.log(convidarAmigos[i]);
			$('#todos-amigos').append("<li class='list-group-item' id=" + 'fifa-amigos-' + spacesToUnderline($('#' + convidarAmigos[i]).val()) + ">" + $('#' + convidarAmigos[i]).val() + "</li>");
		}
		$('#todos-amigos li:last-child').trigger('click');
		amigosCont = 0;
		convidarAmigos = [];
		popupAux(event);

	});
	/*
	$("#amigo_nome").on("change paste keyup", function() {
   		var friend_name = $(this).val(); 
   		f.ref('usersNickNames').on('value',function(snapshot){
			if(!snapshot.child(friend_name).exists()){
				console.log("nao achou");
			}else console.log("achou");
		});
	});
	*/

	$("#convite_amizade_popup").on('click','button.accept-friend-request',function(e){
		var id = e.target.id.substring(19,e.target.id.length);
		f.ref('usersNickNames/'+id).once("value",function(snapshot){
			var friendRequestFbUrl = snapshot.val()[Object.keys(snapshot.val())[0]];
			f.ref('usersFacebook/'+that.user+'/friendRequestReceived/'+id).remove();
			f.ref('usersFacebook/'+friendRequestFbUrl+'/friendRequestSent/'+that.userNickName).remove();

			f.ref('usersFacebook/'+that.user+'/friends/'+id).update({
				jogos:0,
				venceu:0,
				perdeu:0,
				empatou:0	
			});

			f.ref('usersFacebook/'+friendRequestFbUrl+'/friends/'+that.userNickName).update({
				jogos:0,
				venceu:0,
				perdeu:0,
				empatou:0	
			});
		});
		
	});

	$("#convite_amizade_popup").on('click','button.reject-friend-request',function(e){
		var id = e.target.id.substring(19,e.target.id.length);
		f.ref('usersNickNames/'+id).once("value",function(snapshot){
			var friendRequestFbUrl = snapshot.val()[Object.keys(snapshot.val())[0]];
			f.ref('usersFacebook/'+that.user+'/friendRequestReceived/'+id).remove();
			f.ref('usersFacebook/'+friendRequestFbUrl+'/friendRequestSent/'+that.userNickName).remove();
		});
	});

	$("#add_amigos_btn").on('click',function(e){
		e.preventDefault();
		var friend_name = $("#amigo_nome0").val();
		f.ref('usersNickNames').once('value',function(snapshot){
			if(snapshot.child(friend_name).exists()){
				f.ref('usersFacebook/'+that.user+'/friends').once('value',function(snapshot){
					if(!snapshot.child(friend_name).exists()){			
						f.ref('usersNickNames/'+friend_name).once("value",function(snapshot){
						friendId = snapshot.val()[Object.keys(snapshot.val())[0]];
						var foo = {};
						foo[friend_name] = friendId;
						var bar = {};
						bar[userNickName] = this.user;
						f.ref('usersFacebook/'+that.user+'/friendRequestSent').update(foo);
						f.ref('usersFacebook/'+friendId+'/friendRequestReceived').update(bar);

				});				
					}else alert("user "+friend_name+" already is your friend");
				});

				
			}else alert("We could not find "+friend_name);
		});
	});

	$(".log-out-button").on('click',function(e){
		var fb_login = new facebook_login();
		fb_login.logout();
	});
});
