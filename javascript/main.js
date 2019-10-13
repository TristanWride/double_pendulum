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

// Midpoint of the pendulum's canvas.
var midx = canvas.width/2;
var midy = canvas.height/2;

// Boolean values.
var playing = false;
var mapPlot = false;

// Set colours and styles of the graphing contexts
// Pendulum.
ctx.lineWidth    = 2;
ctx.strokeStyle  = "#FFFFFF";
ctx.fillStyle    = "#00FFFF";
// t1 against t2 graph.
gctx.fillStyle   = "#FFFFFF";
// Poincare map.
mctx.fillStyle   = "#FFFFFF";
// t2 against time graph.
tctx.fillStyle   = "#FFFFFF";
tctx.strokeStyle = "#FFFFFF";
tctx.lineWidth   = 2;

// Pendulum object
// The two angles (t1 and t2 for theta 1 and theta 2).
var t1 = 0;
var t2 = 0;

// Time derivatives of the angles.
var dt1 = 0;
var dt2 = 0;

// Length of the pendulum's sections.
var r1 = 1;
var r2 = 1;

// Mass of the pendulum's weights.
var m1 = 1;
var m2 = 1;
      
// Time step.
var h = 0.005;

// Contant gravitational acceleration.
var g = 9.81;

// Constant for conversion from meters to pixels.
var m2px = 120; 

// Time passed since beginning of simulation.
var totalTime = 0;

// Variables for the Runge-Kutta method.
var k = [[0, 0, 0, 0],
         [0, 0, 0, 0],
         [0, 0, 0, 0],
         [0, 0, 0, 0]];

// Reset the pendulum.
reset();
// Begin the main loop.
requestAnimationFrame(mainLoop);

// Second time derivative of t1.
// Equation is derived from Newtonian mechanics.
function ddt1(t1, t2, dt1, dt2) {
  return (-g * (2 * m1 + m2) * Math.sin(t1) - m2 * g * Math.sin(t1 - 2 * t2) 
    - 2 * Math.sin(t1 - t2) * m2 * (dt2 * dt2 * r2 + dt1 * dt1 * r1 
    * Math.cos(t1 - t2))) / (r1 * (2 * m1 + m2 - m2 
    * Math.cos(2 * t1 - 2 * t2))); 
}

// Second time derivative of t2
// Equation is derived from Newtonian mechanics.
function ddt2(t1, t2, dt1, dt2) {
  return (2 * Math.sin(t1 - t2) * (dt1 * dt1 * r1 * (m1 + m2) + g * (m1 + m2) 
    * Math.cos(t1) + dt2 * dt2 * r2 * m2 * Math.cos(t1 - t2))) / (r2 * (2 
    * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2)));
}

// Pause the simulation.
function pause() {
  playing = false;
  document.getElementById("playPauseButton").innerHTML = "<b>PLAY</b>";
}

// Play the simulation.
function play() {
  playing = true;
  document.getElementById("playPauseButton").innerHTML = "<b>PAUSE</b>";
}

// Set variables to the values chosen in the input boxes.
function setVars() {
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
}

// Clear canvasses.
function clear() {
  gctx.clearRect(0, 0, graph.width, graph.height);
  mctx.clearRect(0, 0, map.width, map.height);
  tctx.beginPath();
  tctx.clearRect(0, 0, timeGraph.width, timeGraph.height);
}

// Reset the simulation.
function reset() {  
  setVars();
  
  pause();

  clear();

  // Normalise angles to a value between -PI and +PI.
  normaliseAngles();

  // Add the new start value to the array of t2 values 
  // (for the Angle 2 against time graph)
  t2Data = [t2];
  totalTime = 0;  
}

// Normalise an angle to one between -PI and +PI.
function normalise(x) {
  while (x > Math.PI) {
    x -= 2 * Math.PI;
  }

  while (x < -Math.PI) {
    x += 2 * Math.PI;
  }

  return x;
}

// Normalise the angles to a value between -PI and +PI
function normaliseAngles() {
  t1 = normalise(t1);
  t2 = normalise(t2);
}

// Function for the subspace used for graphing the Poincare map.
// The subspace splits the phase space into multiple sections.  This function
// should return a different value in each of these sections of the phase
// space.
function section(a, b) {
  return a >= b;
}

// Update the pendulum canvas display.
function drawPendulum() {
  // Convert the x, y values of the pendulum masses to pixel values for the
  // canvas.
  var p1x = canvas.width / 2 + r1 * m2px * Math.sin(t1);
  var p1y = canvas.height / 2 + r1 * m2px * Math.cos(t1);
  
  var p2x = p1x + r2 * m2px * Math.sin(t2);
  var p2y = p1y + r2 * m2px * Math.cos(t2);

  var pendulumMassSize = 10;
  
  // Draw the pendulum rods.
  ctx.beginPath();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.moveTo(canvas.width / 2, canvas.height / 2);
  ctx.lineTo(p1x, p1y);
  ctx.lineTo(p2x, p2y);
  ctx.stroke();
  
  // Draw the pendulum masses.
  ctx.fillRect(p1x - pendulumMassSize / 2, p1y - pendulumMassSize / 2,
    pendulumMassSize, pendulumMassSize);
  ctx.fillRect(p2x - pendulumMassSize / 2, p2y - pendulumMassSize / 2,
    pendulumMassSize, pendulumMassSize);
}

// Plot a dot on the t1 vs t2 graph.
function drawt1vst2Graph() {
  // Calculate pixel location of dot.
  var xLoc = graph.width / 2 + t1/(2 * Math.PI) * graph.width;
  var yLoc = graph.height / 2 - t2/(2 * Math.PI) * graph.height;
  var dotSize = 2;

  // Plot dot.
  gctx.fillRect(xLoc - dotSize / 2, yLoc - dotSize / 2, dotSize, dotSize);
}

// Plot on the Poincare map.
// Similar to the t1 vs t2 graph, except only points are plotted when the
// system passes through a subspace in the phase space.
function poincarePlot() {
  // Plot a point on the poincare map if necessary.
  if (mapPlot) {
    // Calculate pixel location of dot.
    var xLoc = map.width / 2 + t1/(2 * Math.PI) * map.width;
    var yLoc = map.height / 2 - t2/(2 * Math.PI) * graph.height;
    var dotSize = 2;

    // Plot dot.
    mctx.fillRect(xLoc - dotSize / 2, yLoc - dotSize / 2, dotSize, dotSize);
    mapPlot = false;  
  }
}

// Draw the line for the angle 2 against time graph.
function drawTimeGraph() {
  // Plot on the angle 2 against time graph.
  tctx.beginPath();

  // Clear canvas first.
  tctx.clearRect(0, 0, timeGraph.width, timeGraph.height);
  
  // Plot values stored in t2Data array.
  tctx.moveTo(timeGraph.width, timeGraph.height / 2 - 
    t2Data[t2Data.length - 1] / (2 * Math.PI) * timeGraph.height);
  
  for (var i = 1; i < t2Data.length; i++) {
    if (Math.abs(t2Data[t2Data.length - 1 - i] - 
          t2Data[t2Data.length - i]) < 3) 
    {
      // Draw a continuous line.
      tctx.lineTo(timeGraph.width - i, timeGraph.height / 2 - 
        t2Data[t2Data.length - 1 - i] / (2 * Math.PI) * timeGraph.height);
    } else {
      // Value has wrapped around (exceeded +PI or dropped below -PI).
      // Start a new line.
      tctx.moveTo(timeGraph.width - i, timeGraph.height / 2 - 
        t2Data[t2Data.length - 1 - i] / (2 * Math.PI) * timeGraph.height);  
    }
  }

  tctx.stroke();  
}

// Apply the Runge-Kutta method to the system.
// This is a method for numerically solving differential equations.
function applyRungeKutta() {
  // Set variables for the Runge-Kutta method.
  // k[x][0] for 0 <= x <= 3 is used for the calculation of the new t1 value
  // k[x][1] for 0 <= x <= 3 is used for the calculation of the new t2 value
  // k[x][2] for 0 <= x <= 3 is used for the calculation of the new dt1 value
  // k[x][3] for 0 <= x <= 3 is used for the calculation of the new dt2 value
  k[0][0] = h * dt1;
  k[0][1] = h * dt2;
  k[0][2] = h * ddt1(t1, t2, dt1, dt2);
  k[0][3] = h * ddt2(t1, t2, dt1, dt2);
  
  k[1][0] = h * (dt1 + 0.5 * k[0][2]);
  k[1][1] = h * (dt2 + 0.5 * k[0][3]);
  k[1][2] = h * ddt1(t1 + 0.5 * k[0][0], t2 + 0.5 * k[0][1], dt1 + 0.5 *
    k[0][2], dt2 + 0.5 * k[0][3]);
  k[1][3] = h * ddt2(t1 + 0.5 * k[0][0], t2 + 0.5 * k[0][1], dt1 + 0.5 *
    k[0][2], dt2 + 0.5 * k[0][3]);

  k[2][0] = h * (dt1 + 0.5 * k[1][2]);
  k[2][1] = h * (dt2 + 0.5 * k[1][3]);
  k[2][2] = h * ddt1(t1 + 0.5 * k[1][0], t2 + 0.5 * k[1][1], dt1 + 0.5 *
    k[1][2], dt2 + 0.5 * k[1][3]);
  k[2][3] = h * ddt2(t1 + 0.5 * k[1][0], t2 + 0.5 * k[1][1], dt1 + 0.5 *
    k[1][2], dt2 + 0.5 * k[1][3]);

  k[3][0] = h * (dt1 + k[2][2]);
  k[3][1] = h * (dt2 + k[2][3]);
  k[3][2] = h * ddt1(t1 + k[2][0], t2 + k[2][1], dt1 + k[2][2], dt2 + k[2][3]);
  k[3][3] = h * ddt2(t1 + k[2][0], t2 + k[2][1], dt1 + k[2][2], dt2 + k[2][3]);  
  
  // Apply the Runge-Kutta method.
  t1 += k[0][0]/6 + k[1][0]/3 + k[2][0]/3 + k[3][0]/6;
  t2 += k[0][1]/6 + k[1][1]/3 + k[2][1]/3 + k[3][1]/6;
  dt1 += k[0][2]/6 + k[1][2]/3 + k[2][2]/3 + k[3][2]/6;
  dt2 += k[0][3]/6 + k[1][3]/3 + k[2][3]/3 + k[3][3]/6;
}

// Simulate one time step.
function update() {  
  var before = section(dt1, dt2);
  
  // Apply the Runge-Kutta method to increment the pendulum's variables
  // according to Newtonian mechanics.
  applyRungeKutta();
  
  // If output from the section function has changed, a point must be plotted
  // on the Poincare map.
  if(before != section(dt1, dt2)) {
    mapPlot = true;
  }
  
  // Normalise angles to a value between -PI and +PI
  normaliseAngles();
  
  // Increment time value.
  totalTime += h;
  // Add data to the array of t2 data.
  t2Data.push(t2);  
}       

// Draw to canvasses.
function render() {  
  drawPendulum();

  drawt1vst2Graph();
    
  poincarePlot();

  drawTimeGraph();
}

function playButtonPressed() {
  // Update the text displayed by the play/pause button.
  if (playing) {
    pause();
  } else {
    play();
  }
}

// Main loop for the canvasses.
function mainLoop() {  
  if(playing) {
    // Update variables.
    update();
  }

  // Draw to canvasses.
  render();

  // Repeat main loop.
  requestAnimationFrame(mainLoop);  
}
