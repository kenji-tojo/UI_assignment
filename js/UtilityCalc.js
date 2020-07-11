function getBoundingBox (_points) {
    var _points_x = [_points.length];
    var _points_y = [_points.length];
    for (var i = 0; i < _points.length; i++) {
        _points_x[i] = _points[i].x;
        _points_y[i] = _points[i].y;
    }
    var _width = max(_points_x) - min(_points_x);
    var _height = max(_points_y) - min(_points_y);
    var bounding_box = [_width, _height];
    // console.log("bounding box"+ bounding_box);

    return bounding_box;
}

function divideSkeletonAtBoundary(vertices) {
    var newVerticies = new Array(2);
    newVerticies[0] = new Array(vertices.length);
    newVerticies[1] = new Array(vertices.length);
    for (var i = 0; i < vertices.length; i++) {
        var tempIndexesInside = [];
        var tempIndexesOutside = [];
        for (var j = 0; j < vertices[i].length; j++) {
            if(isInsidePolygon(vertices[i][j],boundary.corner_points))tempIndexesInside.push(j);
            else tempIndexesOutside.push(j);
        }
        newVerticies[0][i] = new Array(tempIndexesInside.length);
        newVerticies[1][i] = new Array(tempIndexesOutside.length);
        for (var j = 0; j < tempIndexesInside.length; j++) newVerticies[0][i][j] = vertices[i][tempIndexesInside[j]];
        for (var j = 0; j < tempIndexesOutside.length; j++) newVerticies[1][i][j] = vertices[i][tempIndexesOutside[j]];
    }
    return newVerticies;
}


function divideContourAtBoundary(vertices, tol) {
    var tempIndexesInside = [];
    var tempIndexesOutside = [];

    for (var i = 0; i < vertices.length; i++) {
        if(isInsidePolygon(vertices[i],boundary.corner_points))tempIndexesInside.push(i);
        else tempIndexesOutside.push(i);
    }

    var newVerticies = new Array(2);
    newVerticies[0] = new Array(tempIndexesInside.length);
    newVerticies[1] = new Array(tempIndexesOutside.length);

    // adjust the contour for graphics purpose,
    for (var i = 0; i < tempIndexesInside.length; i++) {
        var X = vertices[tempIndexesInside[i]].x;
        var Y = vertices[tempIndexesInside[i]].y;
        if (X < tol) X = boundary.left_X;
        if (X > boundary.right_X - tol) X = boundary.right_X;
        if (Y < tol) Y = boundary.top_y;
        if (Y > boundary.bottom_Y - tol) Y = boundary.bottom_Y;
        newVerticies[0][i] = new createVector(X, Y);
    }

    for (var i = 0; i < tempIndexesOutside.length; i++) {
        var X = vertices[tempIndexesOutside[i]].x;
        var Y = vertices[tempIndexesOutside[i]].y;
        if (X < 0 && X > -tol) X = 0;
        if (X > boundary.right_X && X < boundary.right_X + tol) X = boundary.right_X;
        if (Y < 0 && Y > tol) Y = 0;
        if (Y > boundary.bottom_Y && Y < boundary.bottom_Y + tol) Y = boundary.bottom_Y;
        newVerticies[1][i] = new createVector(X, Y);
    }
    return newVerticies;
}

function simplifyVertices(vertices, num) {
    var new_vertices = new Array(round(vertices.length / num));
    for (var i = 0; i < vertices.length; i++) {
        if (i % num === 0) {
            if (i / num < int(vertices.length / num)) new_vertices[round(i / num)] = vertices[i];
        }
    }
    return new_vertices;
}

function concat_PVector(lists) {
    var count = 0;
    for (var i = 0; i < lists.length; i++) count = count + lists[i].length;
    var new_list = new Array(count);
    var ind = 0;
    for (var i = 0; i < lists.length; i++) {
        for (var j = 0; j < lists[i].length; j++) {
            new_list[ind] = lists[i][j];
            ind = ind + 1;
        }
    }
    return new_list;
}

function check_closest_point_index(pnts, pnt) {
    var index = -1;
    var min_dist = Infinity;
    for (var i = 0; i < pnts.length; i++) {
        var distance = pnts[i].dist(pnt);
        if (distance < min_dist) {
            min_dist = distance;
            index = i;
        }
    }
    return index;
}

function isInsidePolygon(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point.x, y = point.y;
    // console.log(x, y );

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;
        // console.log(xi , ",", yi , xj, yj );

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}

function　getBranchById( _id){
  var _branch;
  for(var i=0; i<brc.length; i++){
    if(brc[i].getId() === _id) _branch = brc[i];
    // break; // this is not neccesary!
  }
  return _branch;
}
