// Joint class


class Joint{ // instanceof

  constructor(_other_id, _center){
    this.other_id  = _other_id;
    this.center = _center
  }
}

class InvalidOverlap{

  constructor(_other_id, _center, _reason) {
    this.reason = _reason;
    this.other_id = _other_id;
    this.center = _center;
  }
}

class BoundaryJoint {
  constructor ( _center, _bound_pt,  _excessPnts,  _excessPline) {
    // super(_center);
    this.center = _center;
    this.x = _center.x;
    this.y = _center.y;
    this.bound_point = _bound_pt;
    this.bound_index;
    this.skeleton_child_index;
    this.skeleton_index;
    this.branch_id;

    // this.bound_point_index

    this.excessPline = _excessPline[1];
    this.excessPnts = _excessPnts[1];

    this.skeleton_inside = _excessPnts[0];
    this.contour_inside = _excessPline[0];
    this.excessLen = this.getSkLength(this.excessPnts);
  }

  setBranchId( _id){
    this.branch_id = _id;
  }

  setBoundIndex(_bound_index){
    this.bound_index = _bound_index;
  }

  setSkeletonIndex(_skeleton_child_index, _skeleton_index){
    this.skeleton_child_index = _skeleton_child_index;
    this.skeleton_index = _skeleton_index;
  }

  getBranchId(){
    return this.branch_id;
  }

  getIndex(){
    var _dist= Infinity;
    var bound_point_index;
    for(var i=0; i< boundary.target_points.length; ){
      var _dist_bound = this.center.dist(bound_point);
      if(_dist_bound < _dist) {
        _dist = _dist_bound;
        bound_point_index = i;
      }
    }
    return bound_point_index;
  }

  setGroupConnectChecked(){
    this.bound_point.setGroupConnected();
  }

  isGroupConnectChecked(){
    return this.bound_point.group_connected;
  }

  getSkLength( _pnts) {
    var len = 0;
    for (var i=0; i< _pnts.length; i++) {
      for (var j=0; j< _pnts[i].length-1; j++) {
        len +=  _pnts[i][j].dist(_pnts[i][j+1]);
      }
    }
    return len;
  }
}
