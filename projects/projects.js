const {remote, ipcRenderer} = require('electron');

function setupComponentList(){

	var source = $("#project-setup-list").html(); 
	var template = Handlebars.compile(source); 

	var data = firstSetup;

	$('#component-setup ul').append(template(data));

	ipcRenderer.on('stripSetUp', function() {
  		$(".slot").eq(2).removeClass("missing");
  		$(".slot").eq(2).addClass("active");
  	});

}

function setupLibrary(){


	var sourceSetu = $("#lib-setup").html(); 
	var sourceComp = $("#lib-components").html(); 
	var sourceRela = $("#lib-relations").html(); 

	var templateSetu = Handlebars.compile(sourceSetu); 
	var templateComp = Handlebars.compile(sourceComp); 
	var templateRela = Handlebars.compile(sourceRela); 

	var dataSetu = librarySetups;
	var dataComp = libraryComponents;
	var dataRela = libraryRelations;


	$('#library-lists ul').eq(0).append(templateSetu(dataSetu));
	$('#library-lists ul').eq(1).append(templateComp(dataComp));
	$('#library-lists ul').eq(2).append(templateRela(dataRela));

}


function toggleRelation(){

	$(".activation-toggle").click(function(){

		var relation = $(this).closest(".relation");

		if( relation.hasClass("passive") ){
			relation.removeClass("passive");
		}else{
			relation.addClass("passive");
		}

	});

}

function libraryToggle(){
  
  	var libraryVisible = false;

	$("#library_toggle").click(function(){

		 ipcRenderer.send('library_toggle');

		 if(libraryVisible){
			$("#library_toggle").removeClass("shown");
			libraryVisible = false;
			setTimeout(function(){
				$("#programm").removeClass("libShown");
			},300);

		}else{
			$("#programm").addClass("libShown");
			$("#library_toggle").addClass("shown");
			libraryVisible = true;
		}	


	});

}

function infoToggle(){

	var prevHtml;

	$(".library-entry").click(function(){


		var entry = $(this);

		var infoHeight = $("#info").outerHeight();
		var topBarHeight = $("#topBar-library").outerHeight();


		if( entry.hasClass("infoshown") ){

			$(".infoshown").removeClass("infoshown");
			$("#info").removeClass("visible");
			$("#library-lists").css("height", "calc( 100vh - " + (topBarHeight + 1) + "px )");

			entry.html(prevHtml);

		}else{

			$(".infoshown").removeClass("infoshown");
			entry.addClass("infoshown");
			$("#info").addClass("visible");
			$("#library-lists").css("height", "calc( 100vh - " + (infoHeight + topBarHeight) + "px )");

			prevHtml = entry.html();
			entry.html('<div class="bookmark"><img src="../global/img/btn/bookmarked-white.svg"></div><img class="library_comp_symbol" src="../global/img/ISO/stepper-white.svg"><div class="meta"><h2>Stepper Nema 17</h2></div><div class="icons"><img src="../global/img/btn/more-white.svg">	<img src="../global/img/btn/download-white.svg"><img src="../global/img/misc/do-white.svg"></div>');

		}

	});

}

function newRelation(){

	var rel = $("#newRelation");

	var modeCount = 1;

	rel.click(function( e ){

		switch(modeCount){

			// start
			case 1:
				var relID = $(".relation").length;

				rel.addClass("nowWorkingOn");

				rel.find(".relation-head").attr("id-nr",relID);
				rel.find(".id-nr").html(relID);
			break;

			//choose if
			case 2:

				rel.find(".if_choice").css("height","0");
				rel.find(".actual_relation").css("height","191");

				setTimeout(function(){

					rel.find(".actual_relation").css("height","auto");

					rel.css("overflow","visible");
					rel.find(".actual_relation").css("overflow","visible")

				},400);

			break;
			case 3:

				$("#choose_component").css("display","block");
				rel.find(".if_choice").remove();

			break;
			case 4:

				$("#choose_component").css("display","none");
				rel.find(".code_if").append('<span class="ifttt component">Main Button</span> is ');

				rel.find(".relation-vis-component-name").eq(0).html("Main Button");
				rel.find(".relation-vis-component-slot").eq(0).html("1");
				rel.find("img").eq(0).css("opacity","0.7");

			break;
			case 5:

				$("#choose_btn_state").css("display","block");

			break;
			case 6:

				$("#choose_btn_state").css("display","none");
				rel.find(".code_if").append('<span class="ifttt choice">held</span> ');

			break;
			case 7:

				$("#choose_component2").css("display","block");

			break;
			case 8:

				$("#choose_component2").css("display","none");
				rel.find(".code_then").append('<span class="ifttt component">LED Strip</span> ');

				rel.find(".relation-vis-component-name").eq(1).html("LED Strip");
				rel.find(".relation-vis-component-slot").eq(1).html("3");
				rel.find("img").eq(1).css("opacity","0.7");

			break;
			case 9:

				$("#choose_led_action").css("display","block");

			break;
			case 10:

				$("#choose_led_action").css("display","none");
				rel.find(".code_then").append('<span class="ifttt choice">fades colour</span> to ');

			break;
			case 11:

				$("#choose_led_colour").css("display","block");

			break;
			case 12:

				$("#choose_led_colour").css("display","none");
				rel.find(".code_then").append('<span class="ifttt choice">red</span> ');

				rel.removeAttr("id").removeClass("nowWorkingOn");
				$(".relation_column").eq(0).prepend('<div id="newRelation" class="relation notSetYet"></div>');

				setTimeout(function(){
					$("#newRelation").removeClass('notSetYet');
				},300);
				

			break;
		}

		modeCount++;

	});

}

function projectRunControl(){

	var play = false;

	$("#playPause-setup").click(function(){

		/*
		if(play){
			ipcRenderer.send('stop');
			$("#playPause-setup img").attr("src","../global/img/misc/play.svg");
			play=false;
		}else{
			ipcRenderer.send('play');
			$("#playPause-setup img").attr("src","../global/img/misc/stopp.svg");
			play=true;
		}
		*/
		ipcRenderer.send('playPause');

	});

	ipcRenderer.on('runProject', function() {
    	if(play){
			$("#playPause-setup img").attr("src","../global/img/misc/play.svg");
			play=false;
			$("#runTitle-setup").html("Run Project");
		}else{
			$("#playPause-setup img").attr("src","../global/img/misc/stopp.svg");
			play=true;
			$("#runTitle-setup").html("Project is running");
		}
  	});

}


function restartApp(){

	$("#restart-app").click(function(){
	
		remote.app.relaunch();
		remote.app.exit(0);

	});	

}


$(document).ready(function(){
	
	setupComponentList();

	toggleRelation();

	setupLibrary();
	libraryToggle();
	infoToggle();

	newRelation();

	restartApp();

	projectRunControl();

	//ipcRenderer.send('setup_click', "new note");

});




