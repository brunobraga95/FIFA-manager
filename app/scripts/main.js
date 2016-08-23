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
			console.log(popup);
			let conviteAmizadePopup = MyApp.templates.conviteAmizadePopup({obj:obj});
			$('.popup').html(conviteAmizadePopup); 
			break;
		case 'add_novo_membro_popup':
			console.log(MyApp.templates);
			let addFriendToGroup = MyApp.templates.addFriendToGroupPopup({obj:obj});
			$('.popup').html(addFriendToGroup);
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

		userInfo.friendRequests = snapshot.val().friendRequestReceived
		//userInfo.teamsList = [['Argentina Primeira Divisão','Argentinos Jrs.','Bahía Blanca','Banfield','Belgrano','Boca Juniors','Estudiantes','Fl. Varela','G. La Plata','Godoy Cruz','Independiente','Junín','Lanús','Mar del Plata','Mataderos','Newells','Parque Patricios','Posadas','Quilmes','Racing Club','Rafaela','River Plate','Rosario Central','San Juan','San Lorenzo','Santa Fe','Sarandí','Temperley','Tigre','Unión','Vélez Sarsfield'],['Australia Hyundai A-League','Adelaide United','Brisbane Roar','Central Coast','Melb. Victory','Melbourne City','Newcastle Jets','Perth Glory','Sydney FC','Well. Phoenix','WS Wanderers'],['Austria  Ö. Bundesliga','Admira Wacker','Austria Wien','RB Salzburg','SCR Altach','SK Rapid Wien','SK Sturm Graz','SV Grödig','SV Mattersburg','SV Ried','Wolfsberger AC'],['Belgium Pro League','Club Brugge','KAA Gent','KRC Genk','KV Kortrijk','KV Mechelen','KV Oostende','KVC Westerlo','OH Leuven','Royal Mouscron','RSC Anderlecht','Sint-Truiden','Sp. Charleroi','Sport. Lokeren','Standard Liège','Waasl. Beveren','Zulte-Waregem'],['Chile Camp. Scotiabank','Audax Italiano','CD Antofagasta','CD Cobresal','CD Huachipato','CD OHiggins','CD Palestino','Colo-Colo','Depor. Iquique','San Luis','San Marcos','Uni. Católica','Uni. Concepción','Uni. de Chile','Unión Española','Unión La Calera','Wanderers'],['Colombia Liga Dimayor','Águilas Doradas','Al. Petrolera','Atl. Nacional','Atlético Huila','Boyacá Chicó','Cortuluá','Cúcuta Depor.','Deportes Tolima','Deportivo Cali','Deportivo Pasto','Envigado','Ind. Santa Fe','Indep. Medellín','Jaguares','Junior','La Equidad','Millonarios','Once Caldas','Patriotas','Uniautónoma'],['Denmark Alka Superliga','Aalborg BK','Aarhus GF','Brøndby IF','Esbjerg fB','FC København','FC Midtjylland','FC Nordsjælland','Hobro IK','Odense BK','Randers FC','SønderjyskE','Viborg FF'],['England Barclays Premier League','Arsenal','Aston Villa','Bournemouth','Chelsea','Crystal Palace','Everton','Leicester City','Liverpool','Manchester City','Manchester Utd','Newcastle Utd','Norwich','Southampton','Spurs','Stoke City','Sunderland','Swansea City','Watford','West Brom','West Ham'],['England Football League Championship','Birmingham City','Blackburn Rovers','Bolton','Brentford','Brighton','Bristol City','Burnley','Cardiff City','Charlton Ath','Derby County','Fulham','Huddersfield','Hull City','Ipswich','Leeds United','Middlesbrough','MK Dons','Nottm Forest','Preston','QPR','Reading','Rotherham Utd','Sheffield Wed','Wolves'],['England Football League 1','Barnsley','Blackpool','Bradford City','Burton Albion','Bury','Chesterfield','Colchester','Coventry City','Crewe Alexandra','Doncaster','Fleetwood Town','Gillingham','Millwall','Oldham Athletic','Peterborough','Port Vale','Rochdale','Scunthorpe Utd','Sheffield Utd','Shrewsbury','Southend United','Swindon Town','Walsall','Wigan Athletic'],['England Football League 2','Accrington','AFC Wimbledon','Barnet','Bristol Rovers','Cambridge Utd','Carlisle United','Crawley Town','Dag & Red','Exeter City','Hartlepool','Leyton Orient','Luton Town','Mansfield Town','Morecambe','Newport County','Northampton','Notts County','Oxford United','Plymouth Argyle','Portsmouth','Stevenage','Wycombe','Yeovil Town','York City'],['France Ligue 1','Angers SCO','AS Monaco','AS Saint-Étienne','EA Guingamp','ES Troyes AC','FC Lorient','FC Nantes','GFC Ajaccio','Giron. Bordeaux','LOSC Lille','Montpellier HSC','OGC Nice','Olym. Lyonnais','Olym. Marseille','PSG','SC Bastia','SM Caen','Stade de Reims','Stade Rennais','Toulouse FC'],['France Ligue 2','AC Ajaccio','AJ Auxerre','AS Nancy','Bourg-Péronnas','Cham. Niortais','Clermont Foot','Dijon FCO','Évian TG','FC Metz','FC Sochaux','Le Havre AC','Nîmes Olympique','Paris FC','RC Lens','Red Star FC','Stade Brestois','Stade Lavallois','Tours FC','US Créteil','Valenciennes FC'],['Germany Bundesliga','1. FC Köln','1. FSV Mainz 05','1899 Hoffenheim','Bayer 04','Bor. Dortmund','Bor. Mgladbach','Eint. Frankfurt','FC Augsburg','FC Bayern','FC Ingolstadt','FC Schalke 04','Hamburger SV','Hannover 96','Hertha BSC','SV Darmstadt','VfB Stuttgart','VfL Wolfsburg','Werder Bremen'],['Germany Bundesliga 2','1. FC Heidenheim','1. FC Nürnberg','1860 München','Arminia Bielefeld','Braunschweig','F. Düsseldorf','FC St. Pauli','FSV Frankfurt','Greuther Fürth','Kaiserslautern','Karlsruher SC','MSV Duisburg','RB Leipzig','SC Freiburg','SC Paderborn','SV Sandhausen','Union Berlin','VfL Bochum'],['Italy Serie A TIM','Atalanta','Bologna','Carpi','Chievo Verona','Empoli','Fiorentina','Frosinone','Genoa','Hellas Verona','Inter','Juventus','Lazio','Milan','Napoli','Palermo','Roma','Sampdoria','Sassuolo','Torino','Udinese'],['Italy Serie B','Ascoli**','Avellino*','Bari*','Brescia*','Cagliari','Cesena','Chiavari**','Como*','Crotone*','La Spezia*','Lanciano*','Latina*','Livorno*','Modena*','Novara*','Perugia*','Pescara*','Salerno*','Terni*','Trapani*','Vercelli*','Vicenza*'],['Korea K LEAGUE Classic','Busan IPark','Daejeon Citizen','FC Seoul','GwangJu FC','Incheon United','Jeju United','Jeonbuk Hyundai','Jeonnam Dragons','Pohang Steelers','Seongnam FC','Suwon Bluewings','Ulsan Hyundai'],['Mexico Liga Bancomer MX','América','Atlas','Chiapas','Cruz Azul','Dorados','Guadalajara','León','Monarcas Morelia','Monterrey','Pachuca','Puebla','Querétaro','Santos Laguna','Tigres','Tijuana','Toluca','U.N.A.M.','Veracruz'],['Holland Eredivisie','ADO Den Haag','Ajax','AZ','De Graafschap','Excelsior','FC Groningen','FC Twente','FC Utrecht','Feyenoord','Heracles Almelo','N.E.C.','PEC Zwolle','PSV','Roda JC','SC Cambuur','SC Heerenveen','Vitesse','Willem II'],['Norway Tippeligaen','Aalesunds FK','FK Bodø/Glimt','FK Haugesund','IK Start','Lillestrøm SK','Mjøndalen IF','Molde FK','Odds BK','Rosenborg BK','Sandefjord','Sarpsborg 08 FF','Stabæk Fotball','Strømsgodset IF','Tromsø IL','Vålerenga Fotball','Viking FK'],['Poland Ekstraklasa','Cracovia','Górnik Łęczna','Górnik Zabrze','Jagiellonia','Korona Kielce','Lech Poznań','Lechia Gdańsk','Legia Warszawa','Piast Gliwice','Podbeskidzie','Pogoń Szczecin','Ruch Chorzów','Śląsk Wrocław','Termalica','Wisła Kraków','Zagłębie Lubin'],['Portugal Liga NOS','Académica','Arouca','Belenenses','Boavista','Estoril Praia','FC Porto','Madeira*','Marítimo','Moreirense','Nacional','Paços Ferreira','Rio Ave','SC Braga','SL Benfica','Sporting CP','Tondela*','V. Guimarães','V. Setúbal'],['Rep. Ireland SSE Airtricity League','Bohemian FC','Bray Wanderers','Cork City','Derry City','Drogheda Utd','Dundalk','Galway United','Limerick','Longford Town','Shamrock Rovers','Sligo Rovers','St. Pats'],['Rest of World ','adidas All-Star','Atlético Mineiro**','Atl. Paranaense**','Avaí**','Classic XI','Chapecoense**','Coritiba**','Cruzeiro**','Figueirense**','Fluminense**','Grêmio**','Joinville**','Internacional**','Kaizer Chiefs','MLS All Stars','Olympiakos CFP','Orlando Pirates','Palmeiras**','Panathinaikos','PAOK','Ponte Preta**','Santos**','São Paulo**','Shakhtar Donetsk','Vasco da Gama**','World XI'],['Russia Russian League','Amkar Perm','Anzhi Makhachkala','CSKA Moscow','Dinamo Moscow','FC Krasnodar','FC Rostov','FC Ufa','FC Ural','Krylya Sovetov','Kuban Krasnodar','Lokomotiv Moscow','Mordovia Saransk','Rubin Kazan','Spartak Moscow','Terek Grozny','Zenit'],['Saudi ALJ League','Al Ahli','Al Faisaly','Al Fateh','Al Hilal','Al Ittihad','Al Khaleej','Al Nassr','Al Qadisiyah','Al Raed','Al Shabab','Al Taawoun','Al Wehda','Hajer','Najran'],['Scotland Scottish Premiership','Aberdeen','Celtic','Dundee FC','Dundee United','Hamilton','Hearts','Inverness CT','Kilmarnock','Motherwell','Partick Thistle','Ross County','St. Johnstone'],['Spain Liga BBVA','Athletic Bilbao','Atlético Madrid','Celta Vigo','FC Barcelona','Getafe CF','Granada CF','Levante UD','Málaga CF','Rayo Vallecano','RC Deportivo','RCD Espanyol','Real Betis','Real Madrid','Real Sociedad','SD Eibar','Sevilla FC','Sporting Gijón','UD Las Palmas','Valencia CF','Villarreal CF'],['Spain Liga Adelante','AD Alcorcón','Albacete','Bilbao Athletic','CA Osasuna','CD Leganés','CD Lugo','CD Mirandés','CD Numancia','CD Tenerife','Córdoba CF','Deport. Alavés','Elche CF','Gimnàstic','Girona CF','RCD Mallorca','Real Oviedo','Real Valladolid','Real Zaragoza','SD Huesca','SD Ponferradina','UD Almería','UE Llagostera'],['Sweden Allsvenskan','AIK','Åtvidabergs FF','BK Häcken','Djurgårdens IF','Falkenbergs FF','Gefle IF','GIF Sundsvall','Halmstads BK','Hammarby','Helsingborgs IF','IF Elfsborg','IFK Göteborg','IFK Norrköping','Kalmar FF','Malmö FF','Örebro SK'],['Switzerland Raffeisen SL','BSC Young Boys','FC Basel','FC Lugano','FC Luzern','FC Sion','FC St. Gallen','FC Thun','FC Vaduz','FC Zürich','Grasshopper'],['Turkey Süper Lig','Akhisarspor','Antalyaspor','Beşiktaş','Bursaspor','Çaykur Rizespor','Eskişehirspor','Fenerbahçe','Galatasaray','Gaziantepspor','Gençlerbirliği','Kasimpaşa','Kayserispor','Konyaspor','Medipol Başakşehir','Mersin','Osmanlıspor','Sivasspor','Trabzonspor'],['USA MLS','Chicago Fire','Colorado Rapids','Columbus Crew SC','D.C. United','FC Dallas','Houston Dynamo','LA Galaxy','Montreal Impact','New England','NY Red Bulls','NYCFC','Orlando City','Philadelphia','Portland','Real Salt Lake','SJ Earthquakes','Sounders FC','Sporting KC','Toronto FC','Whitecaps FC'],['Men’s National ','Argentina','Australia','Austria','Belgium*','Bolivia*','Brazil','Bulgaria*','Cameroon*','Canada','Chile*','China PR','Colombia*','Côte dIvoire*','Czech Republic','Denmark','Ecuador','Egypt*','England','Finland*','France','Germany','Greece','Hungary*','India*','Ireland','Italy','Mexico','Netherlands','New Zealand*','Northern Ireland','Norway*','Paraguay*','Peru*','Poland','Portugal*','Romania*','Russia*','Scotland','Slovenia*','South Africa*','Spain','Sweden','Switzerland*','Turkey','United States','Uruguay*','Venezuela*','Wales'],['Women’s National ','Australia','Brazil','Canada','China PR','England','France','Germany','Italy','Mexico','Spain','Sweden','United States']];

		teamsList = [['Argentina Primeira Divisão','Argentinos Jrs.','Bahía Blanca','Banfield','Belgrano','Boca Juniors','Estudiantes','Fl. Varela','G. La Plata','Godoy Cruz','Independiente','Junín','Lanús','Mar del Plata','Mataderos','Newells','Parque Patricios','Posadas','Quilmes','Racing Club','Rafaela','River Plate','Rosario Central','San Juan','San Lorenzo','Santa Fe','Sarandí','Temperley','Tigre','Unión','Vélez Sarsfield'],['Australia Hyundai A-League','Adelaide United','Brisbane Roar','Central Coast','Melb. Victory','Melbourne City','Newcastle Jets','Perth Glory','Sydney FC','Well. Phoenix','WS Wanderers'],['Austria  Ö. Bundesliga','Admira Wacker','Austria Wien','RB Salzburg','SCR Altach','SK Rapid Wien','SK Sturm Graz','SV Grödig','SV Mattersburg','SV Ried','Wolfsberger AC'],['Belgium Pro League','Club Brugge','KAA Gent','KRC Genk','KV Kortrijk','KV Mechelen','KV Oostende','KVC Westerlo','OH Leuven','Royal Mouscron','RSC Anderlecht','Sint-Truiden','Sp. Charleroi','Sport. Lokeren','Standard Liège','Waasl. Beveren','Zulte-Waregem'],['Chile Camp. Scotiabank','Audax Italiano','CD Antofagasta','CD Cobresal','CD Huachipato','CD OHiggins','CD Palestino','Colo-Colo','Depor. Iquique','San Luis','San Marcos','Uni. Católica','Uni. Concepción','Uni. de Chile','Unión Española','Unión La Calera','Wanderers'],['Colombia Liga Dimayor','Águilas Doradas','Al. Petrolera','Atl. Nacional','Atlético Huila','Boyacá Chicó','Cortuluá','Cúcuta Depor.','Deportes Tolima','Deportivo Cali','Deportivo Pasto','Envigado','Ind. Santa Fe','Indep. Medellín','Jaguares','Junior','La Equidad','Millonarios','Once Caldas','Patriotas','Uniautónoma'],['Denmark Alka Superliga','Aalborg BK','Aarhus GF','Brøndby IF','Esbjerg fB','FC København','FC Midtjylland','FC Nordsjælland','Hobro IK','Odense BK','Randers FC','SønderjyskE','Viborg FF'],['England Barclays Premier League','Arsenal','Aston Villa','Bournemouth','Chelsea','Crystal Palace','Everton','Leicester City','Liverpool','Manchester City','Manchester Utd','Newcastle Utd','Norwich','Southampton','Spurs','Stoke City','Sunderland','Swansea City','Watford','West Brom','West Ham'],['England Football League Championship','Birmingham City','Blackburn Rovers','Bolton','Brentford','Brighton','Bristol City','Burnley','Cardiff City','Charlton Ath','Derby County','Fulham','Huddersfield','Hull City','Ipswich','Leeds United','Middlesbrough','MK Dons','Nottm Forest','Preston','QPR','Reading','Rotherham Utd','Sheffield Wed','Wolves'],['England Football League 1','Barnsley','Blackpool','Bradford City','Burton Albion','Bury','Chesterfield','Colchester','Coventry City','Crewe Alexandra','Doncaster','Fleetwood Town','Gillingham','Millwall','Oldham Athletic','Peterborough','Port Vale','Rochdale','Scunthorpe Utd','Sheffield Utd','Shrewsbury','Southend United','Swindon Town','Walsall','Wigan Athletic'],['England Football League 2','Accrington','AFC Wimbledon','Barnet','Bristol Rovers','Cambridge Utd','Carlisle United','Crawley Town','Dag & Red','Exeter City','Hartlepool','Leyton Orient','Luton Town','Mansfield Town','Morecambe','Newport County','Northampton','Notts County','Oxford United','Plymouth Argyle','Portsmouth','Stevenage','Wycombe','Yeovil Town','York City'],['France Ligue 1','Angers SCO','AS Monaco','AS Saint-Étienne','EA Guingamp','ES Troyes AC','FC Lorient','FC Nantes','GFC Ajaccio','Giron. Bordeaux','LOSC Lille','Montpellier HSC','OGC Nice','Olym. Lyonnais','Olym. Marseille','PSG','SC Bastia','SM Caen','Stade de Reims','Stade Rennais','Toulouse FC'],['France Ligue 2','AC Ajaccio','AJ Auxerre','AS Nancy','Bourg-Péronnas','Cham. Niortais','Clermont Foot','Dijon FCO','Évian TG','FC Metz','FC Sochaux','Le Havre AC','Nîmes Olympique','Paris FC','RC Lens','Red Star FC','Stade Brestois','Stade Lavallois','Tours FC','US Créteil','Valenciennes FC'],['Germany Bundesliga','1. FC Köln','1. FSV Mainz 05','1899 Hoffenheim','Bayer 04','Bor. Dortmund','Bor. Mgladbach','Eint. Frankfurt','FC Augsburg','FC Bayern','FC Ingolstadt','FC Schalke 04','Hamburger SV','Hannover 96','Hertha BSC','SV Darmstadt','VfB Stuttgart','VfL Wolfsburg','Werder Bremen'],['Germany Bundesliga 2','1. FC Heidenheim','1. FC Nürnberg','1860 München','Arminia Bielefeld','Braunschweig','F. Düsseldorf','FC St. Pauli','FSV Frankfurt','Greuther Fürth','Kaiserslautern','Karlsruher SC','MSV Duisburg','RB Leipzig','SC Freiburg','SC Paderborn','SV Sandhausen','Union Berlin','VfL Bochum'],['Italy Serie A TIM','Atalanta','Bologna','Carpi','Chievo Verona','Empoli','Fiorentina','Frosinone','Genoa','Hellas Verona','Inter','Juventus','Lazio','Milan','Napoli','Palermo','Roma','Sampdoria','Sassuolo','Torino','Udinese'],['Italy Serie B','Ascoli**','Avellino*','Bari*','Brescia*','Cagliari','Cesena','Chiavari**','Como*','Crotone*','La Spezia*','Lanciano*','Latina*','Livorno*','Modena*','Novara*','Perugia*','Pescara*','Salerno*','Terni*','Trapani*','Vercelli*','Vicenza*'],['Korea K LEAGUE Classic','Busan IPark','Daejeon Citizen','FC Seoul','GwangJu FC','Incheon United','Jeju United','Jeonbuk Hyundai','Jeonnam Dragons','Pohang Steelers','Seongnam FC','Suwon Bluewings','Ulsan Hyundai'],['Mexico Liga Bancomer MX','América','Atlas','Chiapas','Cruz Azul','Dorados','Guadalajara','León','Monarcas Morelia','Monterrey','Pachuca','Puebla','Querétaro','Santos Laguna','Tigres','Tijuana','Toluca','U.N.A.M.','Veracruz'],['Holland Eredivisie','ADO Den Haag','Ajax','AZ','De Graafschap','Excelsior','FC Groningen','FC Twente','FC Utrecht','Feyenoord','Heracles Almelo','N.E.C.','PEC Zwolle','PSV','Roda JC','SC Cambuur','SC Heerenveen','Vitesse','Willem II'],['Norway Tippeligaen','Aalesunds FK','FK Bodø/Glimt','FK Haugesund','IK Start','Lillestrøm SK','Mjøndalen IF','Molde FK','Odds BK','Rosenborg BK','Sandefjord','Sarpsborg 08 FF','Stabæk Fotball','Strømsgodset IF','Tromsø IL','Vålerenga Fotball','Viking FK'],['Poland Ekstraklasa','Cracovia','Górnik Łęczna','Górnik Zabrze','Jagiellonia','Korona Kielce','Lech Poznań','Lechia Gdańsk','Legia Warszawa','Piast Gliwice','Podbeskidzie','Pogoń Szczecin','Ruch Chorzów','Śląsk Wrocław','Termalica','Wisła Kraków','Zagłębie Lubin'],['Portugal Liga NOS','Académica','Arouca','Belenenses','Boavista','Estoril Praia','FC Porto','Madeira*','Marítimo','Moreirense','Nacional','Paços Ferreira','Rio Ave','SC Braga','SL Benfica','Sporting CP','Tondela*','V. Guimarães','V. Setúbal'],['Rep. Ireland SSE Airtricity League','Bohemian FC','Bray Wanderers','Cork City','Derry City','Drogheda Utd','Dundalk','Galway United','Limerick','Longford Town','Shamrock Rovers','Sligo Rovers','St. Pats'],['Rest of World ','adidas All-Star','Atlético Mineiro**','Atl. Paranaense**','Avaí**','Classic XI','Chapecoense**','Coritiba**','Cruzeiro**','Figueirense**','Fluminense**','Grêmio**','Joinville**','Internacional**','Kaizer Chiefs','MLS All Stars','Olympiakos CFP','Orlando Pirates','Palmeiras**','Panathinaikos','PAOK','Ponte Preta**','Santos**','São Paulo**','Shakhtar Donetsk','Vasco da Gama**','World XI'],['Russia Russian League','Amkar Perm','Anzhi Makhachkala','CSKA Moscow','Dinamo Moscow','FC Krasnodar','FC Rostov','FC Ufa','FC Ural','Krylya Sovetov','Kuban Krasnodar','Lokomotiv Moscow','Mordovia Saransk','Rubin Kazan','Spartak Moscow','Terek Grozny','Zenit'],['Saudi ALJ League','Al Ahli','Al Faisaly','Al Fateh','Al Hilal','Al Ittihad','Al Khaleej','Al Nassr','Al Qadisiyah','Al Raed','Al Shabab','Al Taawoun','Al Wehda','Hajer','Najran'],['Scotland Scottish Premiership','Aberdeen','Celtic','Dundee FC','Dundee United','Hamilton','Hearts','Inverness CT','Kilmarnock','Motherwell','Partick Thistle','Ross County','St. Johnstone'],['Spain Liga BBVA','Athletic Bilbao','Atlético Madrid','Celta Vigo','FC Barcelona','Getafe CF','Granada CF','Levante UD','Málaga CF','Rayo Vallecano','RC Deportivo','RCD Espanyol','Real Betis','Real Madrid','Real Sociedad','SD Eibar','Sevilla FC','Sporting Gijón','UD Las Palmas','Valencia CF','Villarreal CF'],['Spain Liga Adelante','AD Alcorcón','Albacete','Bilbao Athletic','CA Osasuna','CD Leganés','CD Lugo','CD Mirandés','CD Numancia','CD Tenerife','Córdoba CF','Deport. Alavés','Elche CF','Gimnàstic','Girona CF','RCD Mallorca','Real Oviedo','Real Valladolid','Real Zaragoza','SD Huesca','SD Ponferradina','UD Almería','UE Llagostera'],['Sweden Allsvenskan','AIK','Åtvidabergs FF','BK Häcken','Djurgårdens IF','Falkenbergs FF','Gefle IF','GIF Sundsvall','Halmstads BK','Hammarby','Helsingborgs IF','IF Elfsborg','IFK Göteborg','IFK Norrköping','Kalmar FF','Malmö FF','Örebro SK'],['Switzerland Raffeisen SL','BSC Young Boys','FC Basel','FC Lugano','FC Luzern','FC Sion','FC St. Gallen','FC Thun','FC Vaduz','FC Zürich','Grasshopper'],['Turkey Süper Lig','Akhisarspor','Antalyaspor','Beşiktaş','Bursaspor','Çaykur Rizespor','Eskişehirspor','Fenerbahçe','Galatasaray','Gaziantepspor','Gençlerbirliği','Kasimpaşa','Kayserispor','Konyaspor','Medipol Başakşehir','Mersin','Osmanlıspor','Sivasspor','Trabzonspor'],['USA MLS','Chicago Fire','Colorado Rapids','Columbus Crew SC','D.C. United','FC Dallas','Houston Dynamo','LA Galaxy','Montreal Impact','New England','NY Red Bulls','NYCFC','Orlando City','Philadelphia','Portland','Real Salt Lake','SJ Earthquakes','Sounders FC','Sporting KC','Toronto FC','Whitecaps FC'],['Men’s National ','Argentina','Australia','Austria','Belgium*','Bolivia*','Brazil','Bulgaria*','Cameroon*','Canada','Chile*','China PR','Colombia*','Côte dIvoire*','Czech Republic','Denmark','Ecuador','Egypt*','England','Finland*','France','Germany','Greece','Hungary*','India*','Ireland','Italy','Mexico','Netherlands','New Zealand*','Northern Ireland','Norway*','Paraguay*','Peru*','Poland','Portugal*','Romania*','Russia*','Scotland','Slovenia*','South Africa*','Spain','Sweden','Switzerland*','Turkey','United States','Uruguay*','Venezuela*','Wales'],['Women’s National ','Australia','Brazil','Canada','China PR','England','France','Germany','Italy','Mexico','Spain','Sweden','United States']];

		userInfo.teamsList = {}
		for(var i = 0;i < teamsList.length;i++){
			teams = [];
			for(var j = 1;j<teamsList[i].length;j++){
				teams.push(teamsList[i][j]);
			}
			userInfo.teamsList[teamsList[i][0]] = teams;
		}

		userInfo.total = userInfo.perdeu + userInfo.empatou + userInfo.venceu;
		console.log(userInfo);

		// ==================== DINAMIC PARTIALS ====================
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		Handlebars.registerPartial("mainHeader", mainHeader);

		groupslistTemplate = MyApp.templates.groupslistTemplate({obj:userInfo});
		Handlebars.registerPartial("groupslistTemplate", groupslistTemplate);

		friendslistTemplate = MyApp.templates.friendslistTemplate({obj:userInfo});
		Handlebars.registerPartial("friendslistTemplate", friendslistTemplate);

		geralResumoTemplate = MyApp.templates.geralResumoTemplate({obj:userInfo});
		Handlebars.registerPartial("geralResumoTemplate", geralResumoTemplate);

		geralRecenteTemplate = MyApp.templates.geralRecenteTemplate({obj:userInfo});
		Handlebars.registerPartial("geralRecenteTemplate", geralRecenteTemplate);

		amigoRecenteTemplate = MyApp.templates.amigoRecenteTemplate({obj:userInfo});
		Handlebars.registerPartial("amigoRecenteTemplate", amigoRecenteTemplate);

		grupoRecenteTemplate = MyApp.templates.grupoRecenteTemplate({obj:userInfo});
		Handlebars.registerPartial("grupoRecenteTemplate", grupoRecenteTemplate);

		amigoResumoTemplate = MyApp.templates.amigoResumoTemplate({obj:userInfo});
		Handlebars.registerPartial("amigoResumoTemplate", amigoResumoTemplate);

		grupoResumoTemplate = MyApp.templates.grupoResumoTemplate({obj:userInfo});
		Handlebars.registerPartial("grupoResumoTemplate", grupoResumoTemplate);
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

	// initializes userInfo
	let userInfo = {
		pageInfo: {
			context: 'Resumo',
			mode: {
				status: 'Geral',
				text: 'Geral'
			}
		}
	}
	// initializes firebase
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


	// ================ Login and Logout FB ========================
	$(document).on('click','#fb_login', function(e){
		let facebookLogin = new facebook_login(f, userInfo);
		facebookLogin.loginFacebook();
	});

	$(document).on('click', '#fb_logout', function(e){
		var fb_login = new facebook_login(f, userInfo);
		fb_login.logout();
	});
	// =============================================================



	// =================== FRONTEND LISTENERS ======================

	// Popups
	$(document).on('click', '#criar_grupo, #convidar_amigos, #add_partida, #navbar_criar_grupo, #navbar_convite_amizade, #add_partida_circle, #add_novo_membro', function(e){
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

		$('#add_amigos_to_group_input').click(function(){
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

	// Recente
	$(document).on('click', '#recente', function(){	
		if(userInfo.pageInfo.context == 'Resumo'){
			switch (userInfo.pageInfo.mode.status){
				case 'Geral':
					geralRecenteTemplate = MyApp.templates.geralRecenteTemplate({obj:userInfo});
					$('.main-content').html(geralRecenteTemplate);
					break;
				case 'Amigo':
					amigoRecenteTemplate = MyApp.templates.amigoRecenteTemplate({obj:userInfo});
					$('.main-content').html(amigoRecenteTemplate);
					break;
				case 'Grupo':
					grupoRecenteTemplate = MyApp.templates.grupoRecenteTemplate({obj:userInfo});
					$('.main-content').html(grupoRecenteTemplate);
					break;
			}

			userInfo.pageInfo.context = 'Recente';
			mainHeader = MyApp.templates.mainHeader({obj:userInfo});
			$('.main-header').html(mainHeader);
			$(this).addClass('active');
			$(this).siblings().removeClass('active');
		}	
	});

	// Resumo
	$(document).on('click', '#resumo', function(){
		if(userInfo.pageInfo.context == 'Recente'){
			switch (userInfo.pageInfo.mode.status){
				case 'Geral':
					geralResumoTemplate = MyApp.templates.geralResumoTemplate({obj:userInfo});
					$('.main-content').html(geralResumoTemplate);
					break;
				case 'Amigo':
					amigoResumoTemplate = MyApp.templates.amigoResumoTemplate({obj:userInfo});
					$('.main-content').html(amigoResumoTemplate);
					break;
				case 'Grupo':
					grupoResumoTemplate = MyApp.templates.grupoResumoTemplate({obj:userInfo});
					$('.main-content').html(grupoResumoTemplate);
					break;
			}

			userInfo.pageInfo.context = 'Resumo';
			mainHeader = MyApp.templates.mainHeader({obj:userInfo});
			$('.main-header').html(mainHeader);
			$(this).addClass('active');
			$(this).siblings().removeClass('active');
		}
	});

	// Geral
	$(document).on('click', '#geral>li', function(){
		if(userInfo.pageInfo.mode.status != 'Geral'){
			switch (userInfo.pageInfo.context){
				case 'Recente':
					geralRecenteTemplate = MyApp.templates.geralRecenteTemplate({obj:userInfo});
					$('.main-content').html(geralRecenteTemplate);
					break;
				case 'Resumo':
					geralResumoTemplate = MyApp.templates.geralResumoTemplate({obj:userInfo});
					$('.main-content').html(geralResumoTemplate);
					break;
			}

			$('#friends_list>li').removeClass('active');
			$('#groups_list>li').removeClass('active');
			$(this).addClass('active');
			userInfo.pageInfo.mode.status = 'Geral';
			userInfo.pageInfo.mode.text = $(this).text();
			
			//change main header
			mainHeader = MyApp.templates.mainHeader({obj:userInfo});
			$('.main-header').html(mainHeader)

		}

	});

	//Group Click
	$(document).on('click', '#groups_list>li:not(:first)', function(){	
		let htmlText = '' + $(this).text();

		switch (userInfo.pageInfo.context){
			case 'Recente':
				grupoRecenteTemplate = MyApp.templates.grupoRecenteTemplate({obj:userInfo});
				$('.main-content').html(grupoRecenteTemplate);
				break;
			case 'Resumo':
				grupoResumoTemplate = MyApp.templates.grupoResumoTemplate({obj:userInfo});
				$('.main-content').html(grupoResumoTemplate);
				break;
		}

		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$('#friends_list>li').removeClass('active');
		$('#geral>li').removeClass('active');
		
		
		that.f.ref('groups').once('value', function(snapshot){
			let groupsObj;
			let groupObj;
			groupsObj = snapshot.val();
			groupObj = groupsObj[htmlText];
			
		});

		//change main header
		userInfo.pageInfo.mode.status = 'Grupo';
		userInfo.pageInfo.mode.text = htmlText;
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		$('.main-header').html(mainHeader);

	});

	//Friends Click
	$(document).on('click', '#friends_list>li:not(:first)', function(){
		let htmlText = '' + $(this).text();

		switch (userInfo.pageInfo.context){
			case 'Recente':
				amigoRecenteTemplate = MyApp.templates.amigoRecenteTemplate({obj:userInfo});
				$('.main-content').html(amigoRecenteTemplate);
				break;
			case 'Resumo':
				amigoResumoTemplate = MyApp.templates.amigoResumoTemplate({obj:userInfo});
				$('.main-content').html(amigoResumoTemplate);
				break;
		}

		$(this).addClass('active');
		$('#groups_list>li').removeClass('active');
		$(this).siblings().removeClass('active');
		$('#geral>li').removeClass('active');

		let friendObj = userInfo.friends[htmlText];
		userInfo.venceu = friendObj.venceu;
		userInfo.perdeu = friendObj.perdeu;
		userInfo.empatou = friendObj.empatou;

		//change main header
		userInfo.pageInfo.mode.status = 'Amigo';
		userInfo.pageInfo.mode.text = htmlText;
		mainHeader = MyApp.templates.mainHeader({obj:userInfo});
		$('.main-header').html(mainHeader);

		//change resumo
		// graficoResumo.data.datasets[0].data = [userInfo.venceu, userInfo.empatou, userInfo.perdeu];
		// graficoResumo.update();
		

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
		f.ref('usersFacebook/'+userInfo.uid+'/friends').once('value',function(snapshot){		
			if(snapshot.child(adversario_nome).exists()){
				var usuario_empatou = snapshot.val()[adversario_nome].empatou;
				var usuario_venceu = snapshot.val()[adversario_nome].venceu;
				var usuario_perdeu = snapshot.val()[adversario_nome].perdeu;
				f.ref('usersNickNames/'+adversario_nome).once("value",function(snapshot){
					let friendId = snapshot.val();
					if(usuario_time==''){
						alert('Please enter your team');
						return;	
					}
					if(adversario_time==''){
						alert('Please enter your friend\'s team');
						return;
					}
					
					f.ref('usersFacebook/'+friendId+'/friends/'+userInfo.userNickName).once('value',function(adversario_snapshot){
						var nova_partida = {}
    	        		let partida_obj = {
    	 	   	    		'player1':userInfo.userNickName,	
		  	          		'player2':adversario_nome,
   		 	        		'player1Goals':usuario_gols,
    	    	    		'player2Goals':adversario_gols,
	    	        		'player1Team':usuario_time,
 	  	    	     		'player2Team':adversario_time
 	  	  		       	}	   		         	
		            	var time_stamp = Math.floor(Date.now() / 1000); 
   			         	nova_partida[time_stamp] = partida_obj;	
						if(add_nova_partida_group!='Nenhum'){			
							f.ref('groups/'+add_nova_partida_group+'/jogos').update(nova_partida);
						}
						nova_partida[time_stamp].group = add_nova_partida_group;
						f.ref('usersFacebook/'+userInfo.uid+'/friends/'+adversario_nome+'/jogos').update(nova_partida);
						f.ref('usersFacebook/'+friendId+'/friends/'+userInfo.userNickName+'/jogos').update(nova_partida);
						if(usuario_gols > adversario_gols){
							userInfo.venceu++;
							f.ref('usersFacebook/'+userInfo.uid+'/venceu').transaction(function(venceu){
	    						return (+venceu+1);
							});
							f.ref('usersFacebook/'+friendId+'/perdeu').transaction(function(perdeu){
	    						return (+perdeu+1);
							});
							f.ref('usersFacebook/'+userInfo.uid+'/friends/'+adversario_nome+'/venceu').transaction(function(venceu){
								return (+venceu+1)
							})
							f.ref('usersFacebook/'+friendId+'/friends/'+userInfo.userNickName+'/perdeu').transaction(function(perdeu){
								return (+perdeu+1)
							});						
						}
						else if(usuario_gols < adversario_gols){
							userInfo.perdeu++;
							f.ref('usersFacebook/'+userInfo.uid+'/perdeu').transaction(function(perdeu){
	    						return (+perdeu+1);
							});
							f.ref('usersFacebook/'+friendId+'/venceu').transaction(function(venceu){
	    						return (+venceu+1);
							});
							f.ref('usersFacebook/'+userInfo.uid+'/friends/'+adversario_nome+'/perdeu').transaction(function(perdeu){
								return (+perdeu+1)
							})
							f.ref('usersFacebook/'+friendId+'/friends/'+userInfo.userNickName+'/venceu').transaction(function(venceu){
								return (+venceu+1)
							});		
						}else{
							userInfo.empatou++;
							f.ref('usersFacebook/'+userInfo.uid+'/empatou').transaction(function(empatou){
	    						return (+empatou+1);
							});
							f.ref('usersFacebook/'+friendId+'/empatou').transaction(function(empatou){
	    						return (+empatou+1);
							});
							f.ref('usersFacebook/'+userInfo.uid+'/friends/'+adversario_nome+'/empatou').transaction(function(empatou){
								return (+empatou+1)
							});
							f.ref('usersFacebook/'+friendId+'/friends/'+userInfo.userNickName+'/empatou').transaction(function(empatou){
								return (+empatou+1)
							});		

						}
						userInfo.total = userInfo.venceu + userInfo.empatou + userInfo.perdeu;						

						//The two next lines that are commented do not work for some reason, they crash the code saying that data is not defined
						//graficoResumo.data.datasets[0].data = [userInfo.venceu, userInfo.empatou, userInfo.perdeu];
						//graficoResumo.update();

						mainHeader = MyApp.templates.mainHeader({obj:userInfo});						
						$('.main-header').html(mainHeader);

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
								groupslistTemplate = MyApp.templates.groupslistTemplate({obj:userInfo});
								$('#groups_list').html(groupslistTemplate);
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
			friendslistTemplate = MyApp.templates.friendslistTemplate({obj:userInfo});
			$('#friends_list').html(friendslistTemplate);
		});

		$.magnificPopup.close();

	});

	//Rejeitar
	$(document).on('click','#friend_request_list>li>div>.btn:last-of-type',function(e){
		var id = this.id.substring(25,e.target.id.length);
		//Basically, get rid of the friend request in both the UI and Firebase

	});

});
























