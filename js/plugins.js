// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

// Magnific Popup

$('#add_partida').magnificPopup({
  type: 'inline'
});

$('.criar_grupo').magnificPopup({
  type: 'inline'
});

$('#convidar_amigo').magnificPopup({
  type: 'inline'
});

//Chart.js

// ==== Frontend way ==
estatisticas = [0,0,0];
// ====================

var graficoContainer = $("#myChart");
var graficoResumoGeral = new Chart(graficoContainer, {
    type: 'pie',
    data: {
        labels: ["Venceu", "Empatou", "Perdeu"],
        datasets: [{
            label: 'numero de partidas',
            data: [localStorage.getItem("venceu"), localStorage.getItem("empatou"), localStorage.getItem("perdeu")],
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


