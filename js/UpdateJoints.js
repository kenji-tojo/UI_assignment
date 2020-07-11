// UpdateJoint class


function UpdateJoints(_branch_index, _branch_id) {
  this.maxNearDist, this.active; //= this.active_branch.dia;
  this.skeletonNearPnt = []; // somehow it nees to declare array here.
  this.skeletonNearPntIndexes, this.other_index;
  this.maxJointAngle = 150;
  this.branch_index = _branch_index;
  this.branch_id = _branch_id;
  // this.branch = brc[_branch_index];
}

UpdateJoints.prototype = {
  update: function(){

    this.skeletonNearPnt = [];
    this.skeletonNearPntIndexes =[];
    this.other_index = [];

    try{
        // this.maxNearDist =brc[this.branch_index].dia;
        this.maxNearDist = 30;
        this.checkBoundaryConnection(this.branch_index);
        this.checkPairBranches(this.branch_index);
        this.evaluateJoints(this.branch_index);
      } catch(err){
        console.log (err);
      }
    },

  checkBoundaryConnection: function(_index){
    boundary.resetWithThisBranch(_index);
    // if(boundary.isThisBranchConnected(_index));
    var connection = [false, createVector(0,0)];
    connection = this.checkCloseBoundaryPoints(boundary.getActivePoints());

    if (connection[0] === true) {
      // console.log("divideContourAtBoundary");
      var dividedSkeleton = divideSkeletonAtBoundary(brc[_index].transformed_skeleton);
      var dividedCountor = divideContourAtBoundary(brc[_index].transformed_contour, boundary.getThickness()/2);
      brc[_index].transformed_contour = dividedCountor[0];
      var contourOutside = dividedCountor;
      brc[_index].transformed_skeleton = dividedSkeleton[0];
      var skeletonOutside = dividedSkeleton;
      // var _bound_pt =
      var bound_joint = new BoundaryJoint(connection[1], connection[2], skeletonOutside, contourOutside);
      bound_joint.setSkeletonIndex(connection[3][0], connection[3][1]);
      bound_joint.setBoundIndex(connection[3][2]);
      bound_joint.setBranchId(this.branch_id);
      brc[_index].bounds.push( bound_joint );
      // if(boundary.target_points[])
      // console.log("bound connected!");
    }
  },

  checkCloseBoundaryPoints: function( _pts){
    var _boolean = false;
    var _joint_pt;
    var nearIndexes = this.checkClosestPoints(brc[this.branch_index].transformed_skeleton, _pts);
    _joint_pt = brc[this.branch_index].transformed_skeleton[nearIndexes[0]][nearIndexes[1]].copy();
    var boundaryPnt = _pts[nearIndexes[2]];
    var dist = _joint_pt.dist(boundaryPnt.vec);
    if (dist<this.maxNearDist) {
      _boolean =true;
      _pts[nearIndexes[2]].setConnected(brc[this.branch_index].getId());
    }
    return [_boolean, _joint_pt, boundaryPnt, nearIndexes]; // return the bound's index
  },

  checkClosestPoints: function(vertices, pnts){ //skeleton // boundary points
    var indexes = new Array(3); // or var indexes = [];?
    var min_dist = Infinity;
    for (var i=0; i<vertices.length; i++) {
      for (var j=0; j<vertices[i].length; j++) {
        for (var k=0; k<pnts.length; k++) {
          var temp_vector = pnts[k].vec.copy();
          var dist = temp_vector.dist(vertices[i][j]);
          if (dist<min_dist) {
            min_dist = dist;
            indexes = [i, j, k];
          }
        }
      }
    }
    return indexes;
  },

  /*PART TWO: for each pair of branches,
  which are the two closest skeleton points, and are these close enough?
  */
  checkPairBranches: function( _index){
    for(var i=0; i<brc.length; i++ ){
      if(i === _index)   continue;
      var closest_indices = this.checkClosestPoints_sk_sk(brc[_index].transformed_skeleton, brc[i].transformed_skeleton );
      if (closest_indices[0][0] == -1 || closest_indices[0][1] == -1 || closest_indices[1][0] == -1 || closest_indices[1][1] == -1)  continue;
      // console.log(closest_indices);
      var p1 = brc[_index].transformed_skeleton[closest_indices[0][0]][closest_indices[0][1]];
      var p2 = brc[i].transformed_skeleton[closest_indices[1][0]][closest_indices[1][1]];
      if (p1===null || p2===null) continue;
      if (p1.dist(p2)>this.maxNearDist) continue;
      var intersectionPnt = this.averagePoint(p1, p2);

      this.other_index.push(i);
      this.skeletonNearPntIndexes.push(closest_indices);
      this.skeletonNearPnt.push(intersectionPnt);

// second nearest point is not working properly yet
      // var second_closest_indices = this.checkOtherClosestPoints_sk_sk(brc[_index].transformed_skeleton, brc[i].transformed_skeleton, closest_indices)
      // if(second_closest_indices) {
      //   var _p1 = brc[_index].transformed_skeleton[second_closest_indices[0][0]][second_closest_indices[0][1]];
      //   var _p2 = brc[i].transformed_skeleton[second_closest_indices[1][0]][second_closest_indices[1][1]];
      //   if (_p1===null || _p2===null) continue;
      //   if (_p1.dist(_p2)>this.maxNearDist) continue;
      //   var _intersectionPnt = this.averagePoint(_p1, _p2);
      //   // this.other_index.push(i);
      //   // this.skeletonNearPntIndexes.push(second_closest_indices);
      //   // this.skeletonNearPnt.push(_intersectionPnt);
      //   console.log("second nearest point was found");
      // }
    }
  },

  checkSecondClosest(_index){
  },

  /*3A - INTERSECTION ANGLE. Measure the angle of intersection between the two skeletons
  in order to find out if it is either a possible edge joint, or if it exceeds the maximum angle of a cross joint
  */
  calcJointAngle: function(_index_active, _i, _closest_indices) {
    var p1Shifted = this.getSkeletonShiftedIndexes(brc[_index_active], _closest_indices[0][0], _closest_indices[0][1]);
    var p2Shifted = this.getSkeletonShiftedIndexes(brc[this.other_index[_i]], _closest_indices[1][0], _closest_indices[1][1]);
    // console.log(_closest_indices + " ,p1Start:" + p1Start + " ,p1End:"+ p1End + " ,p2Start:" + p2Start + " ,p2End:" + p2End);

    var vec1 = brc[_index_active].transformed_skeleton[_closest_indices[0][0]][p1Shifted[1]].copy();
    try{
      var vec_other1 = brc[_index_active].transformed_skeleton[_closest_indices[0][0]][p1Shifted[0]].copy();
    }
    catch(err){
      console.log("length:" + brc[_index_active].transformed_skeleton[_closest_indices[0][0]].length + " ,index" + p1Shifted[0]);
    }
    vec1.sub(vec_other1); ////often something wrong here????
    var vec2 = brc[this.other_index[_i]].transformed_skeleton[_closest_indices[1][0]][ p2Shifted[1]].copy();

    try{
      var vec_other2 = brc[this.other_index[_i]].transformed_skeleton[_closest_indices[1][0]][p2Shifted[0]].copy();
    }
    catch(err){
      console.log("length:" + brc[this.other_index[_i]].transformed_skeleton[_closest_indices[1][0]].length + " ,index" +p2Shifted[0]);
    }
    vec2.sub(vec_other2); ////often something wrong here????
    var _angleBet = degrees(p5.Vector.angleBetween(vec1, vec2));
    // console.log(_i + " ,"+ _angleBet);
    return _angleBet;
  },

  getSkeletonShiftedIndexes: function( _brc, _index1, _index2){ // index1: sub_branch index, index2:point index in the sub_branch
    var shift_index = 3;
    var pStart = _index2 -shift_index;
    if (pStart < 0) pStart = 0;
    var pEnd = _index2 +shift_index; //index
    var _pEnd = _brc.transformed_skeleton[ _index1 ].length -1; // the first dimension is for getting sub-branch index
    if (pEnd > _pEnd) pEnd = _pEnd;
    var indexes = [pEnd, pStart];
    return   indexes;
  },
  /*PART THREE: If a nearby skeleton is detected,
  find what type of intersection it is and put it in the right class
  */
  evaluateJoints: function( _index){

    for(var i=0; i<this.other_index.length; i++ ){
      if (brc[_index].dia < brc[i].dia) this.maxNearDist = brc[i].dia;
      var closest_indices = this.skeletonNearPntIndexes[i];
      var angle_between = this.calcJointAngle(_index, i, closest_indices);

      // Instance 2) If the intersection angle exceeds the this.maxJointAngle, the joint is invalid.
      if (angle_between>this.maxJointAngle || angle_between<(180-this.maxJointAngle)) {
        this.addInvalid(_index, i, "Maximum intersection angle exceeded");
        continue;
      }

      // check near invalid points
      for(var k = 0; k< brc[_index].transformed_invalid_points.length; k++){
        var invalid = brc[_index].transformed_invalid_points[k].copy();
        if(invalid.dist(this.skeletonNearPnt[i]) < 20) {
          this.addInvalid(_index, i, "near invalid points");
          console.log("near invalid points");
          continue;
        }
      }

      // Instance 3) If an enpoint of one of the two intersecting skeleton branches is involved, the cross joint is invalid.
      var lengthSkeltonBranch0 = brc[_index].transformed_skeleton[closest_indices[0][0]].length -1;
      var lengthSkeltonBranch1 = brc[this.other_index[i]].transformed_skeleton[closest_indices[1][0]].length -1;
      if (closest_indices[0][1] === 0 || closest_indices[0][1] === lengthSkeltonBranch0 || closest_indices[1][1] === 0 || closest_indices[1][1] === lengthSkeltonBranch1) {
        this.addInvalid(_index, i, "Insufficient overlap" );
        continue;
      }

      // Instance 4) If the branches are both mirrored or both Non-mirrored, the joint is invalid.
      // if (brc[_index].mirror === brc[this.other_index[i]].mirror) {
      //   this.addInvalid(_index, i, "need to be mirrored");
      //   continue;
      // }

      // Instance 5) If the intersection is happening outside the boundary, the joint is invalid.
      if (this.skeletonNearPnt[i].x <0 || this.skeletonNearPnt[i].x> width || this.skeletonNearPnt[i].y<0 || this.skeletonNearPnt[i].y>height) {
        this.addInvalid(_index, i, "Outside boundary");
        continue;
      }

      // Instance 6) Finally, if the intersection is Non of the invalid above, it should be an approved joint.
      brc[_index].joints.push( new Joint(brc[this.other_index[i]].id, this.skeletonNearPnt[i] ));
      brc[this.other_index[i]].joints.push( new Joint(brc[_index].id, this.skeletonNearPnt[i] ));
    }
  },

  addInvalid: function(_index, _i, _message){
    brc[_index].invalid_joints.push(new InvalidOverlap(brc[this.other_index[_i]].id, this.skeletonNearPnt[_i], _message));
    brc[this.other_index[_i]].invalid_joints.push(new InvalidOverlap(brc[_index].id, this.skeletonNearPnt[_i], _message));
  },

  checkClosestPoints_sk_sk: function(vertices1, vertices2) {
    var indexes = [];
    var min_dist = Infinity;
    var counts = 0;

    for (var i=0; i<vertices1.length; i++) {
      for (var j=0; j<vertices1[i].length; j++) {
        for (var m=0; m<vertices2.length; m++) {
          for (var n=0; n<vertices2[m].length; n++) {
            if (vertices1[i][j]===null || vertices2[m][n]===null) continue;
            var distance = vertices1[i][j].dist(vertices2[m][n]);
            counts ++;
            if (distance<min_dist) {
              min_dist = distance;
              indexes = [ [i, j], [m, n] ];
            }
          }
        }
      }
    }
    // console.log(brc[_index]_index + " , "  + indexes + " , " + min_dist);
    // this.intersect_skeleton = [ vertices1[intdexes[0][0]][indexes[0][1]], vertices2[intdexes[1][0]][indexes[1][1]] ];
    return indexes;
  },

  checkOtherClosestPoints_sk_sk: function(vertices1, vertices2, first_indexes) {
    var indexes = [];
    var min_dist = Infinity;
    var counts = 0;

    for (var i=0; i<vertices1.length; i++) {
      for (var j=0; j<vertices1[i].length; j++) {
        for (var m=0; m<vertices2.length; m++) {
          for (var n=0; n<vertices2[m].length; n++) {
            if (vertices1[i][j]===null || vertices2[m][n]===null) continue;
            var distance = vertices1[i][j].dist(vertices2[m][n]);
            counts ++;
            if (distance<min_dist) {
              if(i === first_indexes[0][0] && m === first_indexes[1][0]) continue;
              if(abs(j - first_indexes[0][1]) < 10 || abs(n - first_indexes[1][1]) < 10) continue;
              if(i !== first_indexes[0][0] || m !== first_indexes[1][0]) {
                min_dist = distance;
                indexes = [ [i, j], [m, n] ];
              }
            }
          }
        }
      }
    }
    // console.log(brc[_index]_index + " , "  + indexes + " , " + min_dist);
    // this.intersect_skeleton = [ vertices1[intdexes[0][0]][indexes[0][1]], vertices2[intdexes[1][0]][indexes[1][1]] ];
    return indexes;
  },

  getClosePoint: function(_brc){
    return this.close_point;
  },

  setSleep: function(){
    this.active = false;
  },

  drawIntersects: function(){
    if(this.skeletonNearPnt.length > 0 ) {
      strokeWeight(10);
      stroke(30);
      // for(var _pnts in this.skeletonNearPnt) console.log(_pnts.x); //point(_pnts);
      for(var i = 0; i < this.skeletonNearPnt.length; i++) {
        var _pnts = this.skeletonNearPnt[i];
        point(_pnts.x, _pnts.y);
      }
    }
  },

  averagePoint: function( _pnt1, _pnt2) {
    var x_sum = (_pnt1.x+_pnt2.x)/2;
    var y_sum = (_pnt1.y+_pnt2.y)/2;
    var new_point = new createVector(x_sum, y_sum);
    return new_point;
  },

  // findIntersectionLine: function( ){
  //
  // }

};


/*


 checkClosestPoints_2 = (vertices1, vertices2) { //PVector[] vertices1, PVector[] vertices2
  int[] indexes = new int[2];
  float min_dist = 9999;
  for (int j=0; j<vertices1.length; j++) {
    for (int k=0; k<vertices2.length; k++) {
      float distance = vertices1[j].dist(vertices2[k]);
      if (distance < min_dist) {
        min_dist = distance;
        indexes[0] = j;
        indexes[1] = k;           //index of closest skeleton point of the branch which the current branch is compared with
      }
    }
  }
  return indexes;
}
*/
