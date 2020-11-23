let socket = io();
let myColor = "white";

socket.on("connect", newConnection);
socket.on("color", getColor);
socket.on("mouseBroad", drawOtherMouses);

function drawOtherMouses(mouseData){
  push();
    fill(mouseData.col);
    ellipse(mouseData.x, mouseData.y, 20);
  pop();
}

function newConnection(){
  console.log("my connection: " + socket.id);
}

function getColor(dataColor){
  myColor = dataColor;
}

function preload(){
  // put preload code here
}

function setup() {
  createCanvas(windowWidth,windowHeight)
  background(80,100,240);
}

function draw() {
  // put drawing code here
}

function mouseMoved(){
  push();
    fill(myColor);
    ellipse(mouseX, mouseY, 20);
  pop();

  let message = {
    x: mouseX,
    y: mouseY,
    col: myColor,
  };

  socket.emit("mousee", message)
}
