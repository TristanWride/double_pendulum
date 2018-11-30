// Retrieve canvas elements
var canvas    = document.getElementById("pendulum");
var graph     = document.getElementById("graph");
var map       = document.getElementById("map");
var timeGraph = document.getElementById("timeGraph");

// Create graphics contexts
var ctx  = canvas.getContext('2d');
var gctx = graph.getContext('2d');
var mctx = map.getContext('2d');
var tctx = timeGraph.getContext('2d');

// Arrays for storing the graphing data
var timeData = [];
var t2Data   = [];

// Variables
var midx = canvas.width/2;
var midy = canvas.height/2;

var playing = false;
var mapPlot = false;

// Set colours and styles of the graphing contexts
ctx.lineWidth    = 2;
ctx.strokeStyle  = "#FFFFFF";
ctx.fillStyle    = "#00FFFF";
gctx.fillStyle   = "#FFFFFF";
mctx.fillStyle   = "#FFFFFF";
tctx.fillStyle   = "#FFFFFF";
tctx.strokeStyle = "#FFFFFF";
tctx.lineWidth   = 2;

// Pendulum object
var t1 = 0;
var t2 = 0;

var dt1 = 0;
var dt2 = 0;

var r1 = 1;
var r2 = 1;

var m1 = 1;
var m2 = 1;
      
var h = 0.005;
var g = 9.81;

var m2px = 120; 

var totalTime = 0;

var k = [[0, 0, 0, 0],
         [0, 0, 0, 0],
         [0, 0, 0, 0],
         [0, 0, 0, 0]];


reset();
requestAnimationFrame(mainLoop);


function ddt1(t1, t2, dt1, dt2) {
  return (-g * (2 * m1 + m2) * Math.sin(t1) - m2 * g * Math.sin(t1 - 2 * t2) 
    - 2 * Math.sin(t1 - t2) * m2 * (dt2 * dt2 * r2 + dt1 * dt1 * r1 
    * Math.cos(t1 - t2))) / (r1 * (2 * m1 + m2 - m2 
    * Math.cos(2 * t1 - 2 * t2))); 
}

function ddt2(t1, t2, dt1, dt2) {
  return (2 * Math.sin(t1 - t2) * (dt1 * dt1 * r1 * (m1 + m2) + g * (m1 + m2) 
    * Math.cos(t1) + dt2 * dt2 * r2 * m2 * Math.cos(t1 - t2))) / (r2 * (2 
    * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2)));
}

function play() {
  if(playing) {
    document.getElementById("playPauseButton").innerHTML = "<b>PLAY</b>";
  }
  else {
    document.getElementById("playPauseButton").innerHTML = "<b>PAUSE</b>";
  }
  playing = !playing;
}

function reset() {	
  t1  = Number(document.getElementById("t1") .value);
  t2  = Number(document.getElementById("t2") .value);
  dt1 = Number(document.getElementById("dt1").value);
  dt2 = Number(document.getElementById("dt2").value);
  m1  = Number(document.getElementById("m1") .value);
  m2  = Number(document.getElementById("m2") .value);
  r1  = Number(document.getElementById("r1") .value);
  r2  = Number(document.getElementById("r2") .value);
  g   = Number(document.getElementById("g")  .value);
  h   = Number(document.getElementById("h")  .value);
    
  playing = false;
  document.getElementById("playPauseButton").innerHTML = "<b>PLAY</b>";
  gctx.clearRect(0, 0, graph.width, graph.height);
  mctx.clearRect(0, 0, map.width, map.height);
  tctx.beginPath();
  tctx.clearRect(0, 0, timeGraph.width, timeGraph.height);
    
  while(t1 > Math.PI) {
    t1 -= 2 * Math.PI;
  }
  while(t1 < -Math.PI) {
    t1 += 2 * Math.PI;
  }
  while(t2 > Math.PI) {
    t2 -= 2 * Math.PI;
  }
  while(t2 < -Math.PI) {
    t2 += 2 * Math.PI;
  }

  t2Data = [t2];
  totalTime = 0;	
}

function section(a, b) {
  if(a - b >= 0) {
    return true;
  }
  else {
    return false;
  }
}

function render() {	
  var p1x = midx + r1 * m2px * Math.sin(t1);
  var p1y = midx + r1 * m2px * Math.cos(t1);
  
  var p2x = p1x + r2 * m2px * Math.sin(t2);
  var p2y = p1y + r2 * m2px * Math.cos(t2);
	
  ctx.beginPath();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.moveTo(canvas.width/2, canvas.height/2);
  ctx.moveTo(midx, midy);
  ctx.lineTo(p1x, p1y);
  ctx.lineTo(p2x, p2y);
  ctx.stroke();
  
  ctx.fillRect(p1x - 5, p1y - 5, 10, 10);
  ctx.fillRect(p2x - 5, p2y - 5, 10, 10);
	
  gctx.fillRect(t1/(2 * Math.PI) * 500 + 250, 250 - 
  t2/(2 * Math.PI) * 500, 2, 2);
	
  if(mapPlot) {
  	mctx.fillRect(t1/(2 * Math.PI) * 500 + 250, 250 - 
  	t2/(2 * Math.PI) * 500, 2, 2);
  	mapPlot = false;	
  }
	
  tctx.beginPath();
  tctx.clearRect(0, 0, timeGraph.width, timeGraph.height);
	
  tctx.moveTo(1500, 150 - t2Data[t2Data.length - 1]/(2 * Math.PI) * 300);
	
  for(var i = 1; i < t2Data.length; i++) {
    if(Math.abs(t2Data[t2Data.length - 1 - i] - t2Data[t2Data.length - i]) < 3) {
      tctx.lineTo(1500 - i, 150 - t2Data[t2Data.length - 1 - i] / (2 * Math.PI) * 300);
    }
    else {
      tctx.moveTo(1500 - i, 150 - t2Data[t2Data.length - 1 - i] / (2 * Math.PI) * 300);	
    }
  }

  tctx.stroke();	
}

function update() {	
  var before = section(dt1, dt2);
	
  k[0][0] = h * dt1;
  k[0][1] = h * dt2;
  k[0][2] = h * ddt1(t1, t2, dt1, dt2);
  k[0][3] = h * ddt2(t1, t2, dt1, dt2);
	
  k[1][0] = h * (dt1 + 0.5 * k[0][2]);
  k[1][1] = h * (dt2 + 0.5 * k[0][3]);
  k[1][2] = h * ddt1(t1 + 0.5 * k[0][0], t2 + 0.5 * k[0][1], dt1 + 0.5 * k[0][2], dt2 + 0.5 * k[0][3]);
  k[1][3] = h * ddt2(t1 + 0.5 * k[0][0], t2 + 0.5 * k[0][1], dt1 + 0.5 * k[0][2], dt2 + 0.5 * k[0][3]);

  k[2][0] = h * (dt1 + 0.5 * k[1][2]);
  k[2][1] = h * (dt2 + 0.5 * k[1][3]);
  k[2][2] = h * ddt1(t1 + 0.5 * k[1][0], t2 + 0.5 * k[1][1], dt1 + 0.5 * k[1][2], dt2 + 0.5 * k[1][3]);
  k[2][3] = h * ddt2(t1 + 0.5 * k[1][0], t2 + 0.5 * k[1][1], dt1 + 0.5 * k[1][2], dt2 + 0.5 * k[1][3]);

  k[3][0] = h * (dt1 + k[2][2]);
  k[3][1] = h * (dt2 + k[2][3]);
  k[3][2] = h * ddt1(t1 + k[2][0], t2 + k[2][1], dt1 + k[2][2], dt2 + k[2][3]);
  k[3][3] = h * ddt2(t1 + k[2][0], t2 + k[2][1], dt1 + k[2][2], dt2 + k[2][3]);	
	
  t1 += k[0][0]/6 + k[1][0]/3 + k[2][0]/3 + k[3][0]/6;
  t2 += k[0][1]/6 + k[1][1]/3 + k[2][1]/3 + k[3][1]/6;
  dt1 += k[0][2]/6 + k[1][2]/3 + k[2][2]/3 + k[3][2]/6;
  dt2 += k[0][3]/6 + k[1][3]/3 + k[2][3]/3 + k[3][3]/6;
	
  if(before != section(dt1, dt2)) {
    mapPlot = true;
  }
	
  while(t1 > Math.PI) {
    t1 -= 2 * Math.PI;
  }
  while(t1 < -Math.PI) {
    t1 += 2 * Math.PI;
  }
  while(t2 > Math.PI) {
    t2 -= 2 * Math.PI;
  }
  while(t2 < -Math.PI) {
    t2 += 2 * Math.PI;
  }	
	
  totalTime += h;
  t2Data.push(t2);	
}       
function mainLoop() {	
  if(playing) {
    update();
  }
  render();
  requestAnimationFrame(mainLoop);	
}
