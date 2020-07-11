
class Boundary {

  constructor() {
    this.shift_val = 50;

    var pnt1 = new createVector(this.shift_val, this.shift_val); //top left
    var pnt2 = new createVector(width - this.shift_val, this.shift_val); // top right
    var pnt3 = new createVector(width - this.shift_val, height - this.shift_val); // bottom right
    var pnt4 = new createVector(this.shift_val, height - this.shift_val); // bottom left
    this.right_X = pnt2.x;
    this.left_X = pnt1.x;
    this.top_Y = pnt1.y;
    this.bottom_Y = pnt3.y;
    this.thickness = 10;

    this.corner_points = [pnt1, pnt2, pnt3, pnt4];
    // this.excessLen;

    this.target_points = [];
    // this.target_point_shift = [createVector()];
    var targets = [pnt1, pnt2, pnt3, pnt4];
    this.setTargetPoints(targets);
    this.setActiveTargetPoints();

    this.width = getBoundingBox(this.corner_points)[0];
    this.height = getBoundingBox(this.corner_points)[1];
  }


  drawBoundary() {
    push();
    rectMode(CORNER);
    stroke(30, 30, 0, 100);
    noFill();
    strokeWeight(20);
    beginShape();
    for (var i = 0; i < this.corner_points.length; i++) {
      vertex(this.corner_points[i].x, this.corner_points[i].y);
    }
    endShape(CLOSE);
    pop();
  }

  setTargetPoints(_points) {
    for (var i = 0; i < _points.length; i++) {
      // if( _points[i].y ===0) _points[i].add(this.shift_val, this.shift_val);
      // _points[i].add(this.shift_val, this.shift_val);
      var _bool_pnt = new BoundPnt(_points[i]);
      this.target_points.push(_bool_pnt);
    }
    // console.log(this.target_points);
  }

  getWidth() {
    var _boundaryW = getBoundingBox;
    return _boundaryW = this.width;
  }

  getHeight() {
    var _boundaryH = this.height;
    return _boundaryH;
  }

  getThickness() {
    var _boundaryT = 20;
    return _boundaryT;
  }

  setActiveTargetPoints() {
    // for(var i=0; i<2; i++) this.addRandomTargetPoint();
    for (var i = 0; i < this.target_points.length; i++) this.target_points[i].setActive();

  }

  drawActivePoints(strokeW, _col) {
    push();
    noFill();
    var dia = sin(frameCount / 10) * 20;
    strokeWeight(dia);
    for (var i = 0; i < this.getActivePoints().length; i++) {
      // console.log("draw points");
      if (this.getActivePoints()[i].isConnected()) stroke(100);
      else stroke(_col);
      point(this.getActivePoints()[i].x, this.getActivePoints()[i].y);
    }
    stroke(_col);
    if (this.getActivePoints().length == 2) {
      strokeWeight(dia / 5);
      var pntA = this.getActivePoints()[0];
      var pntB = this.getActivePoints()[1];
      line(pntA.x, pntA.y, pntB.x, pntB.y);
    }
    pop();
  }

  updateActivePoint() {

    if (this.getActivePoints().length - this.getConnectedPoints().length > 0) {
      console.log("available active points exist");
      return;
    }

    if (score.island_exist) {
      console.log("Islands:" + score.island_exist);
      return;
    }

    if (this.getAvailablePoints().length > 0) {
      var random_index = floor(random(0, this.getAvailablePoints().length));
      console.log("target length:" + this.getAvailablePoints().length + " splice at:" + random_index);
      this.getAvailablePoints()[0].setActive();
    }
  }

  addRandomTargetPoint() {
    var random_index = floor(random(0, this.getAvailablePoints().length));
    // console.log("target length:" + this.getAvailablePoints().length + " splice at:" + random_index );
    this.getAvailablePoints()[random_index].setActive();
  }

  getActivePoints() {
    var active_points = [];
    for (var i = 0; i < this.target_points.length; i++) {
      if (this.target_points[i].isActive()) active_points.push(this.target_points[i]);
    }
    return active_points;
  }

  getConnectedPoints() {
    var connected_points = [];
    for (var i = 0; i < this.target_points.length; i++) {
      if (this.target_points[i].isConnected()) connected_points.push(this.target_points[i]);
    }
    return connected_points;
  }

  getAvailablePoints() {
    var _points = [];
    for (var i = 0; i < this.target_points.length; i++) {
      if (!this.target_points[i].isActive() && !this.target_points[i].isConnected())
        _points.push(this.target_points[i]);
    }
    return _points;
  }

  isCompleted() {
    var complete = false;
    if (this.getActivePoints().length - this.getConnectedPoints().length === 0) complete = true;
    return complete;
  }

  getConnectedBranchPoint(_branch_index) {
    var _point;
    for (var i = 0; i < this.target_points.length; i++) {
      if (this.target_points[i].getConnectedBranchId() === brc[_branch_index].getId())
        _point = this.target_points[i];
      // break;
    }
    return _point;
  }

  resetAllConnectedPoints() {
    for (var i = 0; i < this.target_points.length; i++) {
      this.target_points[i].connected = false;
    }
  }

  resetWithThisBranch(_branch_index) {
    var _point;
    for (var i = 0; i < this.target_points.length; i++) {
      if (this.target_points[i].getConnectedBranchId() === brc[_branch_index].getId())
        this.target_points[i].resetConnection();
    }
  }

  isThisBranchConnected(_branch_index) {
    var bool = false;
    for (var i = 0; i < this.target_points.length; i++) {
      if (this.target_points[i].getConnectedBranchId() === brc[_branch_index].getId())
        bool = true;
      break;
    }
    return bool;
  }

}

class BoundPnt {
  constructor(_pnt) {
    this.vec = _pnt;
    this.x = this.vec.x;
    this.y = this.vec.y;
    this.connected = false;
    this.active = false;
    this.paired_pnt;
    this.branch_id;
    this.group_connected = false;
    // this.
  }

  setActive() {
    this.active = true;
  }

  isActive() {
    return this.active;
  }

  setPair(_pnt) {
    this.paired_pnt = _pnt;
  }

  setGroupConnected() {
    this.group_connected = true;
  }

  getGroupConnected() {
    return this.group_connected;
  }

  setConnected(_id) {
    // this.active = false;
    this.connected = true;
    this.branch_id = _id;
  }

  getConnectedBranchId() {
    return this.branch_id;
  }

  resetConnection() {
    this.active = true;
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

}
