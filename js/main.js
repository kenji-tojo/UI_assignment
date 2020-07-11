'use strict';
// global variables
let brc = [];
let boundary;
let score;
let active_brc_index;

// preload branches BEFORE setup()
function preload() {
  getBranches(plate_12); // check this function in LibraryBranch.js. You can also try plate_20
}

function setup() {
  var canvas = createCanvas(500, 450);
  boundary = new Boundary(); // initialize the boundary including target points on the corners
  score = new Score(); // initialize the scoring system including joint evaluation 
  active_brc_index = 0;
  brc[active_brc_index].setMoveActive();
  score.updateScore(); // initial calculation
}

function draw() {
  background(250);
  boundary.drawBoundary(); 
  boundary.drawActivePoints(4, color(255, 240, 0, 200));
  for (var i = 0; i < brc.length; i++){
    brc[i].drawBranch();
  }

  // score.updateScore(); // this function is not here to avoid getting heavy. instead, it's calculated in Events.js
  
  // show effect when the game is completed
  if (score.complete) {
    textSize(70);
    textFont("Helvetica");
    noStroke();
    textStyle(BOLD);
    fill(50);
    text("Connected!", 60, height/2+20);
  }
}