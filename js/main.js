$(function(){
	var f = firebase.database();
	/*
    f.ref().on('value', function(snapshot) {
        console.log(snapshot.val());
    });
	*/
    var user = localStorage.getItem("user");
    f.ref('users/'+user).on('value',function(snapshot){
      $('.profile-pic').attr("src",snapshot.val().profilePicture);
      $('.dropdown-toggle').html("<img class=\"profile-pic\" src=\""+snapshot.val().profilePicture+"\">"+snapshot.val().username+"<span class=\"caret\"></span>");
      
      if(snapshot.child("venceu").exists()){
      	$("#venceu").html("Venceu: "+snapshot.val().venceu);
      	localStorage.setItem("venceu",snapshot.val().venceu);

      }else{
      	firebase.database().ref('users/' + user).update({
            venceu: 0
        });
      	localStorage.setItem("venceu",0);
      }	

      if(snapshot.child("perdeu").exists()){
      	$("#perdeu").html("Perdeu: "+snapshot.val().perdeu);
      	localStorage.setItem("perdeu",snapshot.val().perdeu);	
      }else{
      	firebase.database().ref('users/' + user).update({
            perdeu: 0
        });
        localStorage.setItem("perdeu",0);
      }

      if(snapshot.child("empatou").exists()){
      	$("#empatou").html("Empatou: "+snapshot.val().empatou);
      	localStorage.setItem("empatou",snapshot.val().empatou);

      }else{
      	firebase.database().ref('users/' + user).update({
            empatou: 0
        });
        localStorage.setItem("empatou",snapshot.val().empatou);
      }

      if(snapshot.child("jogou").exists()){
      	$("#jogou").html("Jogou: "+snapshot.val().jogou);
      	localStorage.setItem("jogou",snapshot.val().jogou);

      }else{
      	firebase.database().ref('users/' + user).update({
            jogou: 0
        });
        localStorage.setItem("jogou",snapshot.val().jogou);
      }			

    });

	/*
    
    f.ref('users/'+userId+'/venceu').transaction(function(venceu){
        if (venceu) {
            console.log("teste");
            return +venceu+ 1;
        }
        else{
        	console.log("deu n");
        	return 10;	
        }
    });
	*/

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
	
	$('#todos-grupos, #todos-amigos, #geral').on('click', 'li', function(event){
		/* TRATA O CLICK EM ELEMENTOS DA SIDEBAR*/
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
		popupAux(event);
		$('#todos-grupos').append("<li class='list-group-item' id=" + 'fifa-grupos-' + spacesToUnderline(novo_grupo_nome.value) + ">" + novo_grupo_nome.value + "</li>");
		$('#todos-grupos li:last-child').trigger('click');
	});
	$('#add_nova_partida_btn').click(function(event){
		/* CODIGO PARA ADICIONAR PARTIDA */
		popupAux(event);
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
	});
	$('#add_amigos_btn').click(function(event){
		/* CODIGO PARA ADICIONAR AMIGOS */
		popupAux(event);
		$('#todos-amigos').append("<li class='list-group-item' id=" + 'fifa-amigos-' + spacesToUnderline(amigo_nome.value) + ">" + amigo_nome.value + "</li>");
		$('#todos-amigos li:last-child').trigger('click');
	});
});
