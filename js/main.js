var amigosCont = 1;
var convidarAmigos = [];
var membrosGrupoCont = 3;

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
       			$('form #adversario_nome').append('<option>'+userFriend+'</option>');
       		}
        }
        var groups = snapshot.val().groups;
		$('div #todos-grupos').not(':first').empty();
		groupLabel = '<li class=\"list-group-item\">Grupos <a href=\"#\" data-mfp-src=\"#criar_grupo_popup\" class=\"small criar_grupo\"> <i class=\"fa fa-plus\" aria-hidden=\"true\"></i> add</a></li>'
		//$('div #todos-grupos').append(groupLabel);
		for(group in groups){
			appendGroup = '<li class=\"list-group-item\" id=\"fifaGrupos-'+group+'\">'+group+'</li>'
			
			$('div #todos-grupos').append(appendGroup);
			$('form #add_nova_partida_group').append('<option>'+group+'</option>');
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
	
	$('#add_pessoa').click(function(){
		$(this).prev().append("<li class='list-group-item adicionado-dinamicamente'><input class='form-control' type='text' name='amigo' id='membro_nome" + membrosGrupoCont + "' placeholder='Nome'></li>");
		membrosGrupoCont++;
	});

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
		amigosCont = 1;
		convidarAmigos = [];
		membrosGrupoCont = 3;
	}

	function spacesToUnderline(val){
		return val.replace(/\s/g, '_');
	}

	function underlineToSpaces(val){
		return val.replace(/_/g,' ');
	}

	$('#add_novo_grupo_btn').click(function(event){
		/* CODIGO PARA ADICIONAR GRUPO */
		var listItems = $("#integrantes_grupo li input");
		that.f.ref('groups').once('value',function(snapshot){
			var group_name = $("#novo_grupo_nome")[0].value
			if(!snapshot.child(group_name).exists()){
				var group_creator = {};
				group_creator[that.userNickName] = that.user;
				that.f.ref('groups/'+group_name+'/membros').set(group_creator);
				var group_name_obj = {};
				group_name_obj[group_name] = group_name;
				that.f.ref('usersFacebook/'+that.user+'/groups').update(group_name_obj);
				listItems.each(function(idx, input){
					var input = $(input);
    				var friend_name = input[0].value
    				if(friend_name != ''){
    					f.ref('usersNickNames').once('value',function(snapshot){		
    						if(snapshot.child(friend_name).exists()){
								f.ref('usersNickNames/'+friend_name).once("value",function(snapshot){
									friendId = snapshot.val()[Object.keys(snapshot.val())[0]];
									var foo = {};
									foo[friend_name] = friendId;
									f.ref('groups/'+group_name+'/membros').update(foo);
									f.ref('usersFacebook/'+friendId+'/groups').update(group_name_obj);
								});	

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
		popupAux(event);

	});
	$('#add_nova_partida_btn').click(function(event){
		/* CODIGO PARA ADICIONAR PARTIDA */
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
					friendId = snapshot.val()[Object.keys(snapshot.val())[0]];
					if(usuario_time==''){
						alert('Please enter your team');
						return;	
					}
					if(adversario_time==''){
						alert('Please enter your friend\'s team');
						return;
					}
					/*
					if( /^\d+$/.test(usuario_gols)){
						alert('Please enter a number for your number of goals');	
						return;
					}
					if( /^\d+$/.test(adversario_gols)){
						alert('Please enter a number for your friend\'s number of goals');
						return	
					}
					*/
					that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName).once('value',function(adversario_snapshot){
						var adversario_empatou = adversario_snapshot.val().empatou;
						var adversario_venceu = adversario_snapshot.val().venceu;
						var adversario_perdeu = adversario_snapshot.val().perdeu;
						var nova_partida = {}
    	        		partida_obj = {
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
							that.f.ref('usersFacebook/'+that.user+'/perdeu').transaction(function(perdeu){
	    						return (+perdeu+1);
							});
							that.f.ref('usersFacebook/'+friendId+'/venceu').transaction(function(venceu){
	    						return (+venceu+1);
							});
							that.f.ref('usersFacebook/'+that.user+'/friends/'+adversario_nome+'/perdeu').set(usuario_perdeu+1);
							that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName+'/venceu').set(adversario_venceu+1);		
						}else{
							that.f.ref('usersFacebook/'+that.user+'/empatou').transaction(function(empatou){
	    						return (+empatou+1);
							});
							that.f.ref('usersFacebook/'+friendId+'/empatou').transaction(function(empatou){
	    						return (+empatou+1);
							});
							that.f.ref('usersFacebook/'+that.user+'/friends/'+adversario_nome+'/empatou').set(usuario_empatou+1);
							that.f.ref('usersFacebook/'+friendId+'/friends/'+that.userNickName+'/empatou').set(adversario_empatou+1);		
						}
					});
				

				});	
				
			}else alert("We could not find "+adversario_nome);
		});	
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

	$("#convite_amizade_popup").on('click','button.accept-friend-request',function(e){
		var id = e.target.id.substring(19,e.target.id.length);
		f.ref('usersNickNames/'+id).once("value",function(snapshot){
			var friendRequestFbUrl = snapshot.val()[Object.keys(snapshot.val())[0]];
			f.ref('usersFacebook/'+that.user+'/friendRequestReceived/'+id).remove();
			f.ref('usersFacebook/'+friendRequestFbUrl+'/friendRequestSent/'+that.userNickName).remove();

			f.ref('usersFacebook/'+that.user+'/friends/'+id).update({
				venceu:0,
				perdeu:0,
				empatou:0	
			});

			f.ref('usersFacebook/'+friendRequestFbUrl+'/friends/'+that.userNickName).update({
				venceu:0,
				perdeu:0,
				empatou:0	
			});
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
