class Score {

  constructor() {
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.initializeScore();
    this.total_score = 0;
    this.invalid_num;
    this.best_score = localStorage.getItem("best_score");
    this.bestContainer.textContent = localStorage.getItem("best_score");
    this.island_exist = false;
    this.new_connected = false;
    this.complete = false;

    this.accross_bound_weight = 500;
    this.island_weight = -1000;
    this.valid_joint_weight = 100;
    this.boundary_joint_weight = 200;
    this.invalids_weight = -100;
    this.cutoff_weight = -5;
    this.group_weight = -200;

    // this.group_color = [];
    // this.colors = [];
  }

  initializeScore() {
    this.joint_score = 0;
    this.boundary_joint_score = 0;
    this.boundary_joint_material_cutoff_score = 0;
    this.invalids_score = 0;
    this.branch_group_score = 0;
    this.islands_score = 0;
    this.across_connection_score = 0;
    this.cycle_score = 0;
    this.groups = [];
    this.branch_groups = [];
    this.invalid_num = 0;
    this.new_connected = false;
    this.complete = false;
    // this.group_color = [];
  }

  updateScore() {
    this.initializeScore();
    this.calcJointScores();

    this.calcGroupScore();
    // console.log("branch_groups_length:" + this.branch_groups.length);
    this.calcConnectionScore();

    // console.log(
    //   this.joint_score + " , " + this.boundary_joint_score + " , " + this.invalids_score
    //   + " , " + this.branch_group_score + " , " + this.islands_score + " , " + this.boundary_joint_material_cutoff_score + " , " + this.across_connection_score
    // );

    var _total = this.joint_score + this.boundary_joint_score + this.invalids_score
      + this.branch_group_score + this.islands_score + this.boundary_joint_material_cutoff_score + this.across_connection_score;

    var difference = _total - this.total_score;
    this.total_score = _total;
    this.scoreContainer.textContent = this.total_score;
    if (this.best_score < this.total_score) {
      this.best_score = this.total_score;
      this.bestContainer.textContent = this.best_score;
      localStorage.setItem("best_score", this.best_score);
      animateObject(this.bestContainer, "score-addition", this.best_score)
    }

    if (difference > 0) animateObject(this.scoreContainer, "score-addition", difference);
    else if (difference < 0) animateObject(this.scoreContainer, "score-reduction", difference);

    for (var i = 0; i < brc.length; i++)  brc[i].updateColor();
  }

  calcJointScores() {
    for (var i = 0; i < brc.length; i++) {
      for (var j = 0; j < brc[i].joints.length; j++) {
        if (j < 5) {
          this.joint_score += this.valid_joint_weight;
        }
        else this.joint_score += 1; // ??
      }
      for (var j = 0; j < brc[i].bounds.length; j++) {
        this.boundary_joint_score += this.boundary_joint_weight;
        this.boundary_joint_material_cutoff_score += round(this.cutoff_weight * brc[i].bounds[j].excessLen);
        // console.log(this.boundary_joint_material_cutoff_score);

      }
      for (var j = 0; j < brc[i].invalid_joints.length; j++) {
        this.invalids_score += this.invalids_weight;
        this.invalid_num++;
      }
    }
  }

  calcGroupScore() {
    // console.log("// calcGroupScore started");
    for (var i = 0; i < brc.length; i++) {//browse all branches
      var group = [];
      if (this.branch_groups.length === 0) {  //if there are no preexisting groups, start a new group with this branch
        group.push(brc[i].getId());   //add no to intlist
        this.branch_groups.push(group);
        // console.log("first group was created! branch" + brc[i].getId() + " was added to group:" + this.branch_groups);
        continue;
      }
      //If there are preexisting groups, check if the next branch is connected to any branches in those groups
      var group_connections = [];  //innitiate new array list that will store the indexes of the groups which the current branch is connected to
      for (var k = 0; k < this.branch_groups.length; k++) { //browse the existing groups
        var connected = false;
        for (var n = 0; n < this.branch_groups[k].length; n++) {             //browse the items in existing groups
          // console.log(k + ","  + n + ',' + this.branch_groups[k][n]);
          if (connected) break;
          var _branch = getBranchById(this.branch_groups[k][n]);
          var group_item_id = _branch.getId();
          // console.log(group_item_id);
          for (var j = 0; j < brc[i].joints.length; j++) {               //browse which items current branch is connected to
            if (connected) break;
            var joint_other_id = brc[i].joints[j].other_id;
            if (joint_other_id === group_item_id) {
              group_connections.push(k);
              connected = true;
              // console.log(_branch.getId() + " is connected");
              break;
            }
          }
        }
      }

      // if the branch is not connected, then create the new group
      if (group_connections.length === 0) { //i.e. the branch has a joint, but is not connected to any previously existing groups. Therefore, initiate a new group with this item
        var group = [];
        group.push(brc[i].getId());
        this.branch_groups.push(group);
        // console.log("a new group is created", group);
        // console.log(this.branch_groups.length + " group was created! branch " +brc[i].getId() + " was added to group:"+ this.branch_groups);
      }
      else { //the branch has a joint, and it is connected to one or more branches in one or more previous groups
        // console.log("group connections:" + group_connections);
        // update the newly added branch to be belonged to the existing group
        var combined_groups = [];  //initiate a new list which will contain all the items in a new group, including the older groups and the new item
        combined_groups.push(brc[i].getId());                         //append the current branch
        var no_of_group_connections = group_connections.length;
        for (var j = no_of_group_connections - 1; j >= 0; j--) {   //browse the groups with which the current branch is connected
          var group_index = group_connections[j];      //pick up the index of the current group
          for (var k = 0; k < this.branch_groups[group_index].length; k++) {
            combined_groups.push(this.branch_groups[group_index][k]); //add old group items to the new list
            // console.log("combined groups:",combined_groups);
          }
          this.branch_groups.splice(group_index, 1);               //remove old group items
        }
        this.branch_groups.push(combined_groups);                //add the new group to the this.branch_groups
      }
    }//close for i

    if (this.branch_groups.length > 1) score.branch_group_score += this.group_weight * (this.branch_groups.length - 1);
  }

  calcConnectionScore() {
    this.groups = [];
    var num_islands = 0;
    this.island_exist = false;
    // console.log("checkConnectionScore, _branch_groups.length:" +_branch_groups.length );
    var colors = [color(255, 130, 255, 200), color(126, 172, 255, 200), color(126, 213, 97, 200), color(126, 213, 97, 200)]
    for (var i = 0; i < this.branch_groups.length; i++) {
      var _group = new Group(this.branch_groups[i], i);
      if (i < colors.length) var col = colors[i];
      else var col = colors[i - colors.length];
      _group.setColor(col);
      this.groups.push(_group);
      // console.log("branch_group:"+ this.branch_groups[i] +" at index:"+ i + " ,branch indexes:" + _group.branch_indexes + " ,group id:" + _group.group_id );
    }

    for (var i = 0; i < this.groups.length; i++) {

      if (this.groups[i].boundaryPoints.length > 1) {
        var result = this.groups[i].getConnectionPoints(this.accross_bound_weight);
        // console.log("new across_connection_score:" + result[0]);

        if (result[1] && this.invalid_num === 0) { // new connection found
          var message = "Connected score: " + result[0].toString();
          animateObject(document.querySelector(".added-score-container"), "connected", message);
          var els = document.getElementsByClassName("connected");
          if (els.length > 1) els[0].remove();
          boundary.updateActivePoint();
          this.new_connected = true;
        } // game is completed
        if (result[2] && this.invalid_num === 0 && this.groups.length === 1) {
          this.complete = true;
          console.log("score.js, game completed!")
        }
        // console.log(addScore);
        this.across_connection_score += result[0];
      }
      if (this.groups[i].checkIslands()) {
        this.island_exist = true;
        num_islands++;
      }
    }
    // console.log("across connection score:" + this.across_connection_score);
    this.islands_score = this.island_weight * num_islands;
    console.log("islands:", this.islands_score);
  }



  getNextBranch(joint_node) {
    var br = getBranchById(joint_node.id);
    if (br.joints.length > 0) {
      br.joints.sort(function (a, b) {
        return a.center.copy().dist(joint_node.from) - b.center.copy().dist(joint_node.from);
      });
      // console.log("br id", br.id, "joint id:", br.joints);

      var next_nodes = [];
      for (var j = 0; j < br.joints.length; j++) {
        var node = new JointNode(br.joints[j].other_id, br.joints[j].center);
        // console.log("br id", joint_node.id, " got joint id:", node.id);
        next_nodes.push(node);
      }
      return next_nodes;
    } else
      return false;
  }
}

class JointNode {
  constructor(_id, _from) {
    this.id = _id;
    this.children = [];
    this.from = _from;
  }
  addChild(_id) {
    this.children.push(_id);
  }
  hasChildren() {
    return this.children.length > 0;
  }
}
