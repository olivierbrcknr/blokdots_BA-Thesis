// Johnny-Fife uses stdin, which causes Electron to crash
// this reroutes stdin, so it can be used

var Readable = require("stream").Readable;  
var util = require("util");  
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



var five = require("johnny-five");
var pixel = require("node-pixel");



var board = new five.Board({
  port: "/dev/tty.SNES-DevB"
});


board.on("ready", function() {

	console.log("board ready");

});