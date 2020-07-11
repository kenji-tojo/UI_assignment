class Group {

  constructor (_branch_ids, _group_id) {
    this.branch_ids = _branch_ids; //branch ids in a group
    this.group_id = _group_id; // at index
    this.boundaryPoints = [];
    this.island = false;
    this.color;
    // this.connections = [];
    this.addBoundaryConnectionPoints();
    // this.calcConnectionPoints();
    // this.connection_score;
  }

  setColor( _color){
    this.color = _color;
    // console.log(this.color );
  }

  getColor(){
    return this.color;
  }

  addBoundaryConnectionPoints(){
    for (var i=0; i<this.branch_ids.length; i++) {
      var branch_id = this.branch_ids[i];
      var _branch = getBranchById(branch_id); //browse all branches in this group
      // console.log("branch id is " + branch_id);
      _branch.setGroup(this);                    //write the group number in the branch class
      _branch.island = false;
      for (var j=0; j<_branch.bounds.length; j++) {      //browse all the boundary joints of the currently selected branch
        this.boundaryPoints.push(_branch.bounds[j]);
        // console.log(typeof _branch.bounds[j]);
      }
    }
  }

  getConnectionPoints(_weight){
    var _score = 0;
    var _new_connection = false;
    var _complete = false;

    for(var i=0; i<this.boundaryPoints.length; i++ ){
      console.log(this.boundaryPoints.length);
      _score += _weight;
      if(boundary.isCompleted()) {
        _complete = true;
        console.log("group.js, completed!")
        // score.complete = true;
      }
      if(!this.boundaryPoints[i].isGroupConnectChecked()) {
        this.boundaryPoints[i].setGroupConnectChecked();
        _new_connection = true;
      }
    }
    var result = [_score, _new_connection, _complete ];
    // console.log(result);
    return result;
  }

  checkIslands(){
    this.island = false;
    if (this.boundaryPoints.length === 0) {
      this.island = true;
      for (var i=0; i<this.branch_ids.length; i++) {
        var branch_id = this.branch_ids[i];
        var _branch = getBranchById(branch_id); //browse all branches in this group
        _branch.setIsland();
      }
    }
    return this.island;
  }

  // getConnectionDist(){
  //   var _scores =[];
  //   for (var i=0; i<this.connections.length; i++) {
  //     var P1 = this.connections[i][0].center;
  //     var P2 = this.connections[i][1].center;
  //     _scores.push(round(P1.dist(P2)));
  //   }
  //   var _total = 0;
  //   for(var i = 0; i < _scores.length; i ++){
  //     _total += _scores[i];
  //   }
  //   // console.log(_scores + " , " + _total);
  //
  //   return _total;
  // }


}
