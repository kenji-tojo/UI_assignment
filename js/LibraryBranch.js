function getBranches(_plate) {

  plate_id = _plate.plate_id;

  var branches = _plate.branches;
  var icons = _plate.icons;

  for (var i = 0; i < branches.length; i++) {
    var br = branches[i];
    createBranch(i, br);
  }
  // console.log('imported all branches!');
}

function createBranch(index, br) {

  var ct = br.contour;
  var contour = [];
  for (var j = 0; j < ct.length; j += 2) {
    const con_x = Number(ct[j].x);
    const con_y = Number(ct[j].y);
    var point = new createVector(con_x, con_y);
    contour.push(point);
  }


  var sk = br.skeleton;
  var skeleton = new Array(sk.length);
  for (var j = 0; j < sk.length; j++) {
    skeleton[j] = new Array(sk[j].length);
    for (var k = 0; k < sk[j].length; k++) {
      const sk_x = Number(sk[j][k].x);
      const sk_y = Number(sk[j][k].y);
      skeleton[j][k] = new createVector(sk_x, sk_y);
    }
  }

  var id = br.id;
  var boundingWidth = br.boundingWidth;
  var boundingHeight = br.boundingHeight;

  var branch = new Branch(index, 100, 100, contour);
  branch.setId(id);
  branch.addSkeleton(skeleton);
  branch.addBoundingBox(boundingWidth, boundingHeight);
  // branch.setInvalids(invalid_points);
  // random2D()
  branch.initiateBranch(random(500), random(500), random(-PI, PI), random([true, false]));
}
