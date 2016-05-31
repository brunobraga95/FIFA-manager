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

	$('#resumo').click(function(){
		$(this).toggleClass('active');
		$(this).siblings().toggleClass('active');
		$('.canvas-container').removeClass('hidden');
		$('.recente-wrapper').addClass('hidden');
		$('.main-header > h2').html('Resumo');

	});
	$('#recente').click(function(){
		$(this).toggleClass('active');
		$(this).siblings().toggleClass('active');
		$('.canvas-container').addClass('hidden');
		$('.recente-wrapper').removeClass('hidden');
		$('.main-header > h2').html('Recente');
	});
});
