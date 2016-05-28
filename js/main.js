$(function(){
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
