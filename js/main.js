$(function(){
	$('#resumo').click(function(){
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$('.canvas-container').removeClass('hidden');
		$('.recente-wrapper').addClass('hidden');
		$('.main-header > h1 > small').html('Resumo');
		$('.main-sub-header').removeClass('hidden');

	});
	$('#recente').click(function(){
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$('.canvas-container').addClass('hidden');
		$('.recente-wrapper').removeClass('hidden');
		$('.main-header > h1 > small').html('Recente');
		$('.main-sub-header').addClass('hidden');
	});
	
	$('#todos-grupos li, #todos-amigos li, #geral li').click(function(event){
		var elemId = $(this).attr('id');
		console.log(elemId);
		if(elemId != undefined){
			if($('#resumo').hasClass('active')){
				var str = '<h1>' + elemId.substring(12) + '<small>Resumo</small></h1>'
			}else{
				var str = '<h1>' + elemId.substring(12) + '<small>Recente</small></h1>'
			}
			$('.main-header').html(str);
			$('#todos-amigos li, #todos-grupos li, #geral li').removeClass('active');
			$(this).addClass('active');
		}
	});

	$()
});
