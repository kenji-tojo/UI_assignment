function  drawDashedPolyline( pnts,  strokeW,  col) {
  strokeWeight(strokeW);
  stroke(col);
  for (var i=0; i<pnts.length-1; i=i+2) {
    line(pnts[i].x, pnts[i].y, pnts[i+1].x, pnts[i+1].y);
  }
}

function drawPoint(_pnt, strokeW, col) {
    strokeWeight(strokeW);
    stroke(col);
    noFill();
    point(_pnt.x, _pnt.y);
}

function drawVertices(_pnts) {
    strokeWeight(2);
    stroke(0, 0, 255);
    noFill();
    for (var i = 0; i < _pnts.length; i++) {
        for (var j = 0; j < _pnts[i].length; j++) {
          // point(_pnts[i][j].x, _pnts[i][j].y);
            ellipse(_pnts[i][j].x, _pnts[i][j].y, 20, 20);
        }
    }
}

function drawPolyline (_pnts, strokeW, col) {
    strokeWeight(strokeW);
    if (arguments.length > 2) stroke(30);
    fill(col);
    beginShape();
    for (var i = 0; i < _pnts.length; i += 5) { // sometimes problem to read _pnts
        vertex(_pnts[i].x, _pnts[i].y);
    }
    endShape(CLOSE);
}
