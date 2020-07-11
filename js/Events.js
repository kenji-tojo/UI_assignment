function keyPressed() {

    if (keyCode === ENTER) {
        // deactivate all branches
        for (var i = 0; i < brc.length; i++)  brc[i].setSleep();
        if (active_brc_index == brc.length - 1) active_brc_index = 0; // go back to the first index of branches
        else active_brc_index += 1; // add the index
        brc[active_brc_index].setMoveActive(); // select the branch by activating it
    }

    var position = brc[active_brc_index].pos.copy();
    var angle = brc[active_brc_index].rot;

    if (keyCode === LEFT_ARROW) {
        if (keyIsDown(SHIFT)) angle -= 0.1 * PI; // change angle if Ctrl is pressed
        else position.add(-10, 0); // change position
    } else if (keyCode === RIGHT_ARROW) {
        if (keyIsDown(SHIFT)) angle += 0.1 * PI;
        else position.add(10, 0); // change position
    }
    else if (keyCode === UP_ARROW) {
        position.add(0, -10); // go up. Note that the value is mirrored due to the origin is top left corner.
    }
    else if (keyCode === DOWN_ARROW) {
        position.add(0, 10); // go down
    }

    brc[active_brc_index].setPosition(position.x, position.y);
    console.log(angle)
    brc[active_brc_index].setAngle(angle); // in radians
    score.updateScore();
}

// selection of branches
function mousePressed(event) {
    /* first get clicked position by 
    console.log(event.layerX + ' , ' + event.layerY); 
    or 
    console.log(mouseX + ' , ' + mouseY);
    */
    var closeBranch = checkCloseBranch(20);
    if (closeBranch[0]) {
        for (var i = 0; i < brc.length; i++)  brc[i].setSleep();
        active_brc_index = closeBranch[1]; // add the index
        brc[active_brc_index].setMoveActive(); // select the branch by activating it
    }
}

function getMouseRot(origin) {
    var prevDirX = pmouseX - origin.x;
    var prevDirY = pmouseY - origin.y;
    var currDirX = mouseX - origin.x;
    var currDirY = mouseY - origin.y;
    var prevNorm = Math.sqrt(prevDirX * prevDirX + prevDirY * prevDirY);
    var currNorm = Math.sqrt(currDirX * currDirX + currDirY * currDirY);
    if (prevNorm < 3 || currNorm < 3)
        return 0;
    var cosTheta = (prevDirX * currDirX + prevDirY * currDirY) / (prevNorm * currNorm)
    cosTheta = (cosTheta <= 1) ? cosTheta : 1;
    
    var theta = Math.atan(Math.sqrt(1 - cosTheta * cosTheta) / cosTheta);
    if (prevDirX * currDirY - prevDirY * currDirX > 0)
        return theta;
    else 
        return -theta; 
}

function getRelativeRot(from, to, origin) {
    var prevDirX = from.x - origin.x;
    var prevDirY = from.y - origin.y;
    var currDirX = to.x - origin.x;
    var currDirY = to.y - origin.y;
    var prevNorm = Math.sqrt(prevDirX * prevDirX + prevDirY * prevDirY);
    var currNorm = Math.sqrt(currDirX * currDirX + currDirY * currDirY);
    if (prevNorm < 3 || currNorm < 3)
        return 0;
    var cosTheta = (prevDirX * currDirX + prevDirY * currDirY) / (prevNorm * currNorm)
    cosTheta = (cosTheta <= 1) ? cosTheta : 1;
    
    var theta = Math.atan(Math.sqrt(1 - cosTheta * cosTheta) / cosTheta);
    if (prevDirX * currDirY - prevDirY * currDirX > 0)
        return theta;
    else 
        return -theta; 
}

function rotateByTheta(origX, origY, currX, currY, theta) {
    var newPos = [0, 0];
    var dirX = currX - origX;
    var dirY = currY - origY;
    newPos[0] = Math.cos(theta) * dirX - Math.sin(theta) * dirY + origX;
    newPos[1] = Math.sin(theta) * dirX + Math.cos(theta) * dirY + origY;
    
    return newPos;
}

function getDist(p, q) {
    return Math.sqrt((p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y))
}

// move and rotate 
function mouseDragged(event) {
    var position = brc[active_brc_index].pos.copy();
    var angle = brc[active_brc_index].rot;
    var bs = brc[active_brc_index].bounds;
    var js = brc[active_brc_index].joints; 
    var scale = 30;
    if (keyIsDown(SHIFT)) {
        if (bs.length >= 1 && typeof bs[0] !== 'undefined') {
            var bJoint = bs[0];
            var theta = getMouseRot(bJoint);
            var dist = getDist(bJoint.center, bJoint.bound_point);
            var relRot = getRelativeRot(bJoint.bound_point, bJoint.center, position);
            var newPos = [0, 0];
            if (theta * relRot < 0) {
            // if (true) {
                // angle += (1 + dist / scale) * theta;     
                angle += theta - relRot / 15;
                newPos = rotateByTheta(bJoint.x, bJoint.y, position.x, position.y, theta);
                // newPos = rotateByTheta(bJoint.bound_point.x, bJoint.bound_point.y, position.x, position.y, theta);
                position.x = newPos[0];
                position.y = newPos[1];
            }
            else {
                position.add((mouseX - pmouseX) / 3, (mouseY - pmouseY) / 3); 
                // angle += getMouseRot(position) / 3
            }
        }
        // else if (js.length == 1 && typeof js[0] !== 'undefined') {
        //     var theta = getMouseRot(js[0].center);
        //     angle += theta;     
        //     var newPos = rotateByTheta(js[0].center.x, js[0].center.y, position.x, position.y, theta);
        //     position.x = newPos[0];
        //     position.y = newPos[1];
        // }
        else
            angle += getMouseRot(position)
    }
    else {
        position.add(mouseX - pmouseX, mouseY - pmouseY); 
    }
    // console.log(pmouseX, pmouseY)
    // brc[active_brc_index].setPosition(mouseX, mouseY);
    brc[active_brc_index].setPosition(position.x, position.y);
    brc[active_brc_index].setAngle(angle); // in radians
    score.updateScore();
}

// deactivate the selected branch
function mouseReleased() {
    /*
    you might need to deselect the selected branch 
    */
}

function checkCloseBranch(minDist) {
    var closeBranch = false;
    var closeIndex = null;
    var mouseVec = new createVector(mouseX, mouseY);
    for (var i = 0; i < brc.length; i++) {
        var vertices = brc[i].transformed_contour;
        for (var j = 0; j < vertices.length; j++) {
            var distance = mouseVec.dist(vertices[j]);
            if (distance < minDist) {
                closeBranch = true;
                minDist = distance;
                closeIndex = i;
            }
        }
    }
    return [closeBranch, closeIndex];
}