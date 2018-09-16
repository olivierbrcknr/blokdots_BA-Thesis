// johnny five w/ electron bugfix

var Readable = require("stream").Readable;  
const util = require("util");  

util.inherits(MyStream, Readable);  
function MyStream(opt) {  
  Readable.call(this, opt);
}
MyStream.prototype._read = function() {};  
// hook in our stream
process.__defineGetter__("stdin", function() {  
  if (process.__stdin) return process.__stdin;
  process.__stdin = new MyStream();
  return process.__stdin;
});


// Node modules
const {remote, ipcRenderer} = require('electron');
const {getCurrentWindow, globalShortcut} = require('electron').remote;

const five = require("johnny-five");
const pixel = require("../global/js/pixel.js");
// setup board
var board = new five.Board({
  repl: false, // does not work with browser console
  port: "/dev/tty.SNES-DevB"
});

// Functions ########################################

function setupComponentList(){


  var source = $("#lv-setup-brain").html(); 
  var template = Handlebars.compile(source); 

  var data = firstSetup;

  $('#brain_control ul').append(template(data));

}


function resizeWindow(){

  $(".fold").click(function(){

    var lvSize = $(window).outerHeight();

    var slot = $(this).parent(".slot");

    var controlExpand = slot.find(".control_expand");
    var toggler = controlExpand.find("img").outerHeight();

    if( slot.hasClass("expanded") ){
      toggler = toggler*-1;
      slot.removeClass("expanded");
      slot.css( "height" , 80 );
    }else{
      slot.addClass("expanded");
      slot.css( "height" , 80+toggler );
    }

    
    controlExpand.css( "height" , toggler );
    var newSize = lvSize + toggler;

    ipcRenderer.send('resize',newSize);

  });

}




$(document).ready(function(){
  
  setupComponentList();
  resizeWindow();

  IPCexchange();
  setupLedStrip();

});


// Hardware Setup ------------------------------------
var white = "#FFFFFF";

var strip = null;


function showMainLEDs(){

  strip = new pixel.Strip({
    data: 7,
    length: 9,
    color_order: pixel.COLOR_ORDER.GRB,
    board: board,
    controller: "FIRMATA",
  });

  var ioLED = strip.pixel(0);
  var conLED = strip.pixel(8);



  strip.on("ready", function() {

      console.log("Strip ready, let's go");

      strip.color("#ffe000");

      strip.show();

      setTimeout(function(){

        strip.off(); 

        ioLED.color(white);
        conLED.color(white);

        strip.pixel(1).color(white);
        strip.pixel(5).color(white);

        strip.show();

        //clickShowLED();
 
      }, 2000);

  });

}


function clickShowLED(){

  $(".slot.inactive").click(function(){

      var slot = $(this);
      var num = slot.index();

      var slotLED = strip.pixel(num);
      slotLED.color(white);

      strip.show();

  });

  $(".slot.active").click(function(){

      var slot = $(this);
      var num = slot.index();
      
      var slotLED = strip.pixel(num);
      slotLED.color("#ff0000");

      $(".slot").eq(2).find(".slot_indicator").css("background","#E74C3C");

      strip.show();

  });

}

var poti = null;
var button = null;



var btn_value = 0;

function sensors(){

  // Setup Sensor Bars

  $(".active").each(function(){

    var slot = $(this);

    // Add HTML

  })


  // Slot 1
  button = new five.Button(10);
  //button = new five.Buttons([ 10, 9, 6, 5, 13, 11, 'A1', 'A0', 'A3', 'A2' ]);
  //button = new five.Button('A3');
  // Slot 1
  // button = new five.Button(10);

  console.log(button)

  show_btn_value()

  button.on("down", function() {
    btn_value = 1;  
    show_btn_value();

    console.log("button-pressed")

  });

  button.on("up", function() {
    btn_value = 0;
    show_btn_value();
  });


  // Slot 1
  $(".slot").eq(0).find(".sensor_bar_inner").css("transition","none");


  poti = new five.Sensor("A5");

  // When the sensor value changes, log the value
  poti.on("change", function(value) {
    var potiSlot = $(".slot").eq(4);

    value = 1023 - value;

    // console.log( value );

    var sensorBarWidth = Math.round( 100 * (value/1024) ) +"%";
    potiSlot.find(".sensor_bar_inner").css("width",sensorBarWidth);

    potiSlot.find(".sensor_value").html(sensorBarWidth);
    potiSlot.find(".current_value").html( Math.round( value) );
  });

}

function show_btn_value(){

  var btnSlot = $(".slot").eq(0);

  btnSlot.find(".sensor_value").html(btn_value);
  btnSlot.find(".current_value").html(btn_value);

  var sensorBarWidth = 100 * btn_value +"%";
  btnSlot.find(".sensor_bar_inner").css("width",sensorBarWidth);

}


// Arduino

board.on("ready", function() {
  
  console.log('%cArduino ready', 'color: green;');

  
  showMainLEDs();

  //clickShowLED();

  sensors();

});

// if board is not ready after this time, reload app.
setTimeout(function(){

  if( !board.isReady ){
    console.log("%cBoard not ready, reloading ... ", 'color: red;');

    setTimeout(function(){
      getCurrentWindow().reload();
    },1000);
  }

},7000);

function IPCexchange(){
 

 /* ipcRenderer.on('setup_click2', function(event, data) {
    console.log(data);
  });
*/
  $("#open_project_btn").click(function(){

    ipcRenderer.send('showProject');

    strip.pixel(3).color("#ff0000");
    strip.show();

  });

  var play = false;

  $("#playPause-setup").click(function(){
    ipcRenderer.send('playPause');
  });

  var runningLedInterval;

  ipcRenderer.on('runProject', function() {
      if(play){
        $("#playPause-setup img").attr("src","../global/img/misc/play.svg");
        play=false;
        $("#runTitle-setup").html("Run Desk Lamp");

        // clearInterval(runningLedInterval);

      }else{
        $("#playPause-setup img").attr("src","../global/img/misc/stopp.svg");
        play=true;
        $("#runTitle-setup").html("Desk Lamp is running");



        RunDeskLamp();

      }
    });

}


var strip_ext = null;


function initStripExt(){

  strip_ext = new pixel.Strip({
    data: 2,
    length: 7,
    color_order: pixel.COLOR_ORDER.GRB,
    board: board,
    controller: "FIRMATA",
  });


  strip_ext.on("ready", function() {

      console.log("Strip 2 ready, let's go");

      strip_ext.color(white);

      strip_ext.show();
      //strip_ext.off();

      var slot = $(".slot").eq(2);
      slot.find(".sensor_bar_inner").css("width","100%");
      slot.find(".actuator_value").html("100%");
      slot.find(".current_value").html(Math.round(255));

  });

}

function RunDeskLamp(){

  console.log("Run Project");

  //initStripExt();

  var lampOn = true;

  var brightness = 255;
  var brightnessNotRedg = 255;
  var brightnessNotRedb = 255;

  var red = 1;

  var stripExtColor = "rgb("+brightness+","+brightness+","+brightness+")";

  poti.on("change", function(value) {

    brightness = Math.round( (1023 - value) / 4 );
    brightnessNotRedb = Math.round( brightness-red );
    brightnessNotRedg = Math.round( brightness-(red/1.66) );

    stripExtColor = "rgb("+brightness+","+brightnessNotRedg+","+brightnessNotRedb+")";
    strip_ext.color(stripExtColor);

    var slot = $(".slot").eq(2);
    var brigth_val = Math.round((brightness/255)*100)+"%";

    slot.find(".sensor_bar_inner").css("width",brigth_val);
    slot.find(".actuator_value").html(brigth_val);
    slot.find(".current_value").html(Math.round(brightness));

    if(lampOn){
      strip_ext.show();
    }

  });


  var held = false;
  var TurnRed;

  button.on('hold', function(){

    held = true;

    if(red < 200){

      red = red + 20;
      brightnessNotRedb = Math.round( brightness-red );
      brightnessNotRedg = Math.round( brightness-(red/1.66) );
      
      stripExtColor = "rgb("+brightness+","+brightnessNotRedg+","+brightnessNotRedb+")";
      strip_ext.color(stripExtColor);

      if(lampOn){
        strip_ext.show();
      }

    }

    console.log("held");

  });

  button.on('release', function(){

    if(held==false){
      if(lampOn){
        strip_ext.off();
        lampOn = false;
        red = 1;
      }else{

        stripExtColor = "rgb("+brightness+","+brightness+","+brightness+")";
        strip_ext.color(stripExtColor);
        strip_ext.show();

        lampOn = true;
      }
    }

    held = false;

    console.log('release');

  });



  // WORKAROUND _----------------------------

  // #####################################################
  // #####################################################
  // #####################################################

  document.addEventListener('keydown', (event) => {
    
    const code = event.keyCode;

    if( code == 13 ){ // 13 enter
          
      held = true;

      if(red < 200){

        red = red + 20;
        brightnessNotRedb = Math.round( brightness-red );
        brightnessNotRedg = Math.round( brightness-(red/1.66) );
        
        stripExtColor = "rgb("+brightness+","+brightnessNotRedg+","+brightnessNotRedb+")";
        strip_ext.color(stripExtColor);

        if(lampOn){
          strip_ext.show();
        }

      }

      console.log("held");

    }

  });

  document.addEventListener('keyup', (event) => {
    
    const code = event.keyCode;

    if( code == 32 ){ // space 32

      if(held==false){
        if(lampOn){
          strip_ext.off();
          lampOn = false;
          red = 1;
        }else{

          stripExtColor = "rgb("+brightness+","+brightness+","+brightness+")";
          strip_ext.color(stripExtColor);
          strip_ext.show();

          lampOn = true;
        }
      }

      held = false;

      console.log('release');
    }
  });

  // #####################################################
  // #####################################################
  // #####################################################

}



function setupLedStrip(){

  var mode = 1;

  $(".slot").eq(2).click(function(){

    var slot = $(this);
    
    switch(mode){

      case 1:

        slot.removeClass("inactive");
        slot.addClass("newComponent");

        slot.find(".not_conn").remove();

        slot.append('<div class="slot_control"><div class="CompSetupTitle">New Component Detected</div><div class="ghstBtnWhite">Set Up</div></div>');
        slot.append('<div class="control_expand"><img src="../global/img/screens/lv_expand-controls/chooseNewComp.png"> </div>');

      break;
      case 2:

        var lvSize = $(window).outerHeight();
        var slotSize = slot.outerHeight();

        slot.find(".slot_control").remove();

        slot.append('<img class="slot_symbol" src="../global/img/ISO/led_strip-white.svg"><div class="slot_control"><div class="slot_info_name">LED Strip</div><div class="slot_info_project">needed for Desk Lamp</div></div><div class="use_btn">Use</div>');

        slot.css( "height" , 280 );
        slot.find(".control_expand").css("height",200);
        var newSize = lvSize + 200;

        ipcRenderer.send('resize',newSize);

      break;
      case 3:


        var lvSize = $(window).outerHeight();
        var slotSize = slot.outerHeight();

        slot.find(".slot_control").remove();

        slot.removeClass("newComponent");
        slot.addClass("active");

        slot.find(".slot_control").remove();
        slot.find(".control_expand").remove();

        slot.find(".slot_symbol").attr("src","../global/img/ISO/led_strip.svg");

        slot.append('<div class="slot_control"><div class="actuator_parameter">Brightness</div><div class="actuator_value">0</div><div class="sensor_bar"><div class="sensor_bar_inner"><div class="actuator-handler"></div></div></div><div class="current_value">0</div></div><div class="use_btn">Use</div><img class="fold" src="../global/img/misc/fold_out.svg"><div class="control_expand"><img src="../global/img/screens/lv_expand-controls/led_strip.png"></div>');

        slot.css( "height" , 80 );

        var newSize = lvSize - 200;

        ipcRenderer.send('resize',newSize);

        ipcRenderer.send('stripSetUp');

        strip.pixel(3).color(white);

        strip.show();

        initStripExt();

      break;
      default:
        //
      break;

    }  

    mode++;

  });


 

}






// QUICK WORKAROUND BUTTON ##############################################


var key = 32; // space

document.addEventListener('keydown', (event) => {
  const code = event.keyCode;

  if( code == key ){
    btn_value = 1;
    show_btn_value();
  }
});


document.addEventListener('keyup', (event) => {
  const code = event.keyCode;

  if( code == key ){
    btn_value = 0;
    show_btn_value();
  }
});











