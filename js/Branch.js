// Branch class
function Branch(_id, _pos) {

  // consts
  this.center, this.dia, this.boundingbox, this.radius;
  this.rot_during_drag = false, this.id = _id; //caused the error with undeleted points!
  this.original_contour, this.original_skeleton, this.original_invalid_points; // should not be changed
  this.contour = [], this.skeleton = [],  this.invalid_points = [];  // after shifting to its centroid
  this.icon;

  // not const
  this.index, this.pos = createVector(0, 0), this.rot = 0, this.color = color(255, 50, 0), this.group; // tend to be undefined
  this.transformed_contour = [], this.transformed_skeleton = [],  this.transformed_invalid_points = [];

  // status of this branch
  this.active = false;
  this.joints = []; //Joint
  this.invalid_joints = []; //InvalidJoint
  this.bounds = []; //BoundaryJoint
  this.mirror = false;
  this.island = true;
  this.update_joint; // joint updater

  if (arguments[1] instanceof p5.Vector) {
    this.pos = _pos;
  } else if (typeof (arguments[1]) == 'number') { //(br_no, pos.x, pos.y)
    this.pos = new createVector(arguments[1], arguments[2]);
  }

  // in case it's loaded from arrays
  if (arguments[3] instanceof Array) {
    var _contour = arguments[3];
    // console.log("contour was loaded" + ", the size of the coutour is: " + _contour.length);
    this.center = this.average(_contour);
    // console.log(this.center);
    this.original_contour = _contour;
    for (var i = 0; i < this.original_contour.length; i++) this.contour[i] = this.original_contour[i].copy().sub(this.center);
    this.boundingbox = getBoundingBox(this.contour);
  }
  this.radius = sqrt(sq(this.boundingbox[0]) + sq(this.boundingbox[1])) / 2;
  // console.log("bb:",this.boundingbox, "radius",this.radius );
}

Branch.prototype.average = function (vector_array) {
  var sumVector = new createVector(0, 0);
  var num_array = vector_array.length;
  for (var i = 0; i < num_array; i++) {
    sumVector.add(vector_array[i]);
  }
  const center_x = sumVector.x / num_array;
  const center_y = sumVector.y / num_array;
  var avgP = new createVector(center_x, center_y); //somehow this doesn
  return avgP;
};

Branch.prototype.setInvalids = function (_invalids) {
  this.original_invalid_points = _invalids;
  this.transformed_invalid_point = new Array(this.original_invalid_points.length);

  for (var i = 0; i < this.original_invalid_points.length; i++) {
    this.invalid_points[i] = this.original_invalid_points[i].copy().sub(this.center);
  }
};

Branch.prototype.addSkeleton = function (_skeleton_library) {
  this.original_skeleton = _skeleton_library;
  this.skeleton = [];
  for (var i = 0; i < this.original_skeleton.length; i++) {
    this.skeleton[i] = [];
    for (var j = 0; j < this.original_skeleton[i].length; j++) {
      var vector = this.original_skeleton[i][j].copy().sub(this.center);
      this.skeleton[i][j] = vector;
    }
  }
  this.dia = this.getAvgDiameter(this.skeleton, this.contour);
  this.transform();
  // console.log(this.dia);
  //console.log("pnt length: " + this.skeleton[0].length);
};

Branch.prototype.addBoundingBox = function (_x, _y) {
  this.boundingBox = [_x, _y];
};


Branch.prototype.initiateBranch = function (_x, _y, _rot, _mirror) {
  console.log("dropped:" + this.id);
  this.index = brc.length;
  if (typeof (arguments[1]) === 'number') this.setPosition(_x, _y);
  else this.setPosition(mouseVec.x, mouseVec.y);
  if (arguments.length > 2) {
    this.setAngle(_rot);
    this.mirror = _mirror;
    console.log("angle is set with" + _rot);
  }
  this.setUpdateJoint();
  this.transform();
  this.setSleep();
  active_brc_index = null;
  brc.push(this);
};

Branch.prototype.transform = function () {
  // console.log("test");
  this.transformed_contour = this.getTransformedContour();
  this.transformed_skeleton = this.getTransformedSkeleton();
  // this.getTransformeInvalidPoints();

  if (brc[active_brc_index] !== undefined) {
    this.refreshOtherBranchJoints();
    this.update_joint.update();
  }
};

Branch.prototype.refreshOtherBranchJoints = function () { // remove excess points
  this.joints = [];
  this.invalid_joints = [];
  this.bounds = [];
  //for branches connecting to current branch, clear the joints related to the current branch
  for (var i = 0; i < brc.length; i++) {
    if (i == this.index) continue;

    for (var j = 0; j < brc[i].joints.length; j++) {
      if (brc[i].joints[j].other_id == this.id) {
        brc[i].joints.splice(j, 1);
        // break;
      }
    }

    for (var n = 0; n < brc[i].invalid_joints.length; n++) {
      if (brc[i].invalid_joints[n].other_id === this.id) {
        brc[i].invalid_joints.splice(n, 1);
        // break;
      }
    }
  }
};

Branch.prototype.getTransformedContour = function () {
  var _contour = new Array(this.contour.length);
  for (var i = 0; i < this.contour.length; i++) {
    _contour[i] = this.contour[i].copy();
    if (this.mirror) _contour[i].x = -_contour[i].x;
    _contour[i].rotate(this.rot);
    _contour[i].add(this.pos);
  }
  return _contour;
};

Branch.prototype.getTransformeInvalidPoints = function () {
  for (var i = 0; i < this.invalid_points.length; i++) {
    var _invalid = this.invalid_points[i].copy();
    if (this.mirror) _invalid.x = -_invalid.x;
    _invalid.rotate(this.rot);
    _invalid.add(this.pos)
    this.transformed_invalid_points[i] = _invalid;
  }
};


Branch.prototype.getTransformedSkeleton = function () {
  var _skeleton = new Array(this.skeleton.length);
  for (var i = 0; i < _skeleton.length; i++) {
    _skeleton[i] = new Array(this.skeleton[i].length);
    for (var j = 0; j < _skeleton[i].length; j++) {
      _skeleton[i][j] = this.skeleton[i][j].copy();
      if (this.mirror) _skeleton[i][j].x = -_skeleton[i][j].x;
      _skeleton[i][j].rotate(this.rot);
      _skeleton[i][j].add(this.pos);
    }
  }
  //  print(sumVector.x + " , " + sumVector.y);
  return _skeleton;
};

Branch.prototype.drawBranch = function () {
  
  push();
  if(this.invalid) drawPolyline(this.transformed_contour, 4, this.color);
  else {
    drawPolyline(this.transformed_contour, 2, this.color);
  }

  strokeWeight(2);
  stroke(255, 255, 0);
  // noFill();
  // for (var i = 0; i < this.transformed_invalid_points.length; i++) {
  //   var _pnt = this.transformed_invalid_points[i];
  //   ellipse(_pnt.x, _pnt.y, 10, 10);
  // }

  this.drawIntersections();

  if (this.active) {
    //  you can add more graphic effects here.
    noStroke();
    fill(0, 0, 255, 255);
    if (keyIsDown(SHIFT)) {
      if (this.bounds.length >= 1 && typeof this.bounds[0] !== 'undefined') {
        rect(this.bounds[0].x - 6, this.bounds[0].y - 6, 12, 12);
        fill(0, 0, 255, 50);
        ellipse(this.bounds[0].x, this.bounds[0].y, this.radius, this.radius);
        // rect(this.pos.x - 6, this.pos.y - 6, 12, 12);
      }
      // else if (this.joints.length == 1 && typeof this.joints[0] !== 'undefined') {
      //   rect(this.joints[0].center.x - 6, this.joints[0].center.y - 6, 12, 12);
      //   // rect(this.pos.x - 6, this.pos.y - 6, 12, 12);
      // }
      else {
        rect(this.pos.x - 6, this.pos.y - 6, 12, 12);
        fill(0, 0, 255, 50);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
      }
    }
    else {
      fill(255, 0, 0, 50);
      ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    }
    // fill(0, 0, 255, 50);
    // ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
  }
  pop();
};

Branch.prototype.updateColor = function () {
  let gc = this.group.getColor();
  if (gc !== undefined) {
    this.color = gc;
  }
  if (this.island) this.color = color(255, 50, 0);
};


Branch.prototype.drawIntersections = function () {
  for (var i = 0; i < this.joints.length; i++) {
    drawPoint(this.joints[i].center, 20, color(0, 255, 0));
  }
  for (var i = 0; i < this.invalid_joints.length; i++) {
    drawPoint(this.invalid_joints[i].center, 20, color(255, 0, 0));
  }
  for (var i = 0; i < this.bounds.length; i++) {
    //draw_area(bounds.get(i).excessPline, color(230, 230, 230));
    drawDashedPolyline(this.bounds[i].excessPline, 1, color(150));
    drawPoint(this.bounds[i].center, 20, color(0, 255, 0));
  }
};


Branch.prototype.setAngle = function (_rot) {
  this.rot = _rot;
  this.transform();
};

Branch.prototype.setPosition = function (_x, _y) {
  this.pos.set(_x, _y);
  this.transform();
};

Branch.prototype.setMirror = function () {
  if (this.mirror) this.mirror = false;
  else this.mirror = true;
  this.transform();
  // console.log(this.mirror);
};

Branch.prototype.setMoveActive = function () {
  this.active = true;
};

Branch.prototype.setSleep = function () {
  this.pos = this.pos.copy();
  this.active = false;
  this.update_joint.setSleep();
};

Branch.prototype.setGroup = function (_group) {
  // console.log(_group);
  this.group = _group;
};

Branch.prototype.setIsland = function () {
  // console.log("island");
  this.island = true;
};

Branch.prototype.setUpdateJoint = function () {
  this.update_joint = new UpdateJoints(this.index, this.id);
};

Branch.prototype.getState = function () {
  return this.active;
};

Branch.prototype.setId = function (_id) {
  this.id = _id;
};

Branch.prototype.getId = function () {
  return this.id;
};

Branch.prototype.setIcon = function (_img) {
  this.icon = _img;
};


Branch.prototype.getAvgDiameter = function (S, C) { //S:skeleton, C:contour
  var diameter = 0;
  var diaCount = 0;
  // console.log(C.length);
  for (var i = 0; i < S.length; i++) {
    for (var j = 0; j < S[i].length - 3; j++) {
      var dirVec = S[i][j].copy();
      dirVec.sub(S[i][j + 3]);
      if (dirVec.mag() === 0) continue;
      dirVec.rotate(PI / 2); // get perpendicular vector
      // if(i == 0) console.log(S[i][j]);
      var dia0 = this.getClosestPointGeneral(S[i][j], C, dirVec, PI / 2); //intercection
      dirVec.rotate(PI); // get the other direction
      var dia1 = this.getClosestPointGeneral(S[i][j], C, dirVec, PI / 2);
      var local_diameter = dia0.dist(dia1);
      if (local_diameter > 1) {
        diameter = diameter + local_diameter;
        diaCount = diaCount + 1;
      }
    }
  }
  diameter = diameter / diaCount;
  // console.log(diameter);
  return diameter;
};

Branch.prototype.getClosestPointGeneral = function (pnt, pnt_list, _dir, deviation) {
  var closest_point = pnt.copy();
  var min_dist = Infinity;
  for (var i = 0; i < pnt_list.length; i++) {
    if (pnt.dist(pnt_list[i]) < 5) continue;
    var current_vec = pnt_list[i].copy();
    current_vec.sub(pnt);
    var current_angle = p5.Vector.angleBetween(current_vec, _dir);
    if (current_angle > deviation) continue;
    var distance = pnt.dist(pnt_list[i]);
    if (distance < min_dist) {
      min_dist = distance;
      closest_point = pnt_list[i].copy();
    }
  }
  return closest_point;
};

Branch.prototype.remove_points = function (pnts, delPnts) {
  var newPnts = new Array(pnts.length);
  for (var b = 0; b < pnts.length; b++) {
    var P = [];
    for (var i = 0; i < pnts[b].length; i++) P.push(pnts[b][i]);
    for (var i = 0; i < delPnts[b].length; i++) P.splice(check_closest_point_index(P, delPnts[b][i]), 1); // need to define other function!
    // newPnts[b] = P.toArray(new PVector[P.length]); // ?
  }
  return newPnts;
};
