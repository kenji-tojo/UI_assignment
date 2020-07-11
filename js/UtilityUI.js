function doubleClicked(e) {
  window.blockMenuHeaderScroll = true;
  var test = checkCloseBranch();
  if (test[0]) {
    // console.log( test[0] + " ," + test[1]) ;
    active_brc_index = test[1];
    brc[active_brc_index].setMirror();
    brc[active_brc_index].transform()
    score.updateScore();
  }
}

function imageClicked() {
  // var branch = this.elt.value; // somehow not working
  var branch_exist = false;
  for (var i = 0; i < brc.length; i++) {
    var id = brc[i].id;
    // console.log(this.elt.value.id );
    if (this.elt.value.id === id) {
      console.log(this.elt.value.id + " is already there!");
      branch_exist = true;
      break;
    }
  }
  if (!branch_exist) {
    this.elt.value.initiateBranch(width / 2, height / 2);
    this.elt.remove();
    // this.elt.style.display = 'none';
  }
}

function drag(ev) {
  // console.log("dragStart:" + ev.target.id);
  // ev.preventDefault();
  ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  // ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  console.log(data);
  var branch = document.getElementById(data).value;
  var branch_exist = false;
  for (var i = 0; i < brc.length; i++) {
    var id = brc[i].id;
    // console.log(this.elt.value.id );
    if (branch.id === id) {
      console.log(branch.id + " is already there!");
      branch_exist = true;
      break;
    }
  }
  if (!branch_exist) {
    branch.initiateBranch();
    document.getElementById(data).remove();
    // document.getElementById(data).style.display = 'none';
  }
}

function createImageDiv(_branch) {
  var image = _branch.icon;
  // console.log(_branch.id);
  image.id("image" + _branch.id);
  image.parent('branches');
  image.value(_branch);
  image.mouseClicked(imageClicked);
  image.attribute("draggable", "true");
  image.attribute("ondragstart", "drag(event)");
  // brc.splice(_branch.index, 1);
}

function isTouchDevice() {
  try {
    document.createEvent("TouchEvent");
    // alert('touch event created!')
    return true;
  } catch (e) {
    return false;
  }
}

function animateObject(_document_query, _class, _value) {
  var addition = document.createElement("div");
  addition.classList.add(_class);
  addition.textContent = _value;
  _document_query.appendChild(addition);
}


function continueGame() {
  console.log("continue game");
  this.elt.remove();
}
