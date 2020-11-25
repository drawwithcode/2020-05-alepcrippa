let socket = io();
let myColor = "white";
let myHue= Math.floor(Math.random()*360);
let myBright = 100;
let strokeColor = "black";
let strokeHue = 0;
let strokeBright = 0;
let backHue = 180;
let backBright = 100;
let backColor = "white";
let strokeW = 0.5;

socket.on("connect", newConnection);
socket.on("mouseBroad", drawOtherMouses);

let edge = 50; //size of the circle area each particle is allowed to move
let drawing = false; // I want to raw only when I click

function drawOtherMouses(mouseData){
  push();
    colorMode(HSB);
      let otherColor = color(mouseData.h, 100, mouseData.b);
      let otherStrokeColor = color(mouseData.sh, 100, mouseData.sb);
      branchOut(mouseData.x, mouseData.y,otherColor,otherStrokeColor, mouseData.sw, mouseData.e);
  pop();
}

function newConnection(){
  console.log("my connection: " + socket.id);
}

function setup() {
  createCanvas(windowWidth,windowHeight);
  colorMode(HSB);
  colorBack = color(backHue, 50, backBright);
  background(colorBack);//(80,100,240);

  myColor=color(myHue,100,myBright)

  setUp();
}

function draw() {
  strokeW = sliderStroke.value()/20;
  edge = sliderEdge.value();

  push();
    fill('FloralWhite');
    noStroke();
    rect(windowWidth - 98, 390+60, 70,20);
  pop();
  textFont("Ubuntu");
  text("stroke", windowWidth - 95, 390+75);
  push()
    fill('FloralWhite');
    noStroke();
    rect(windowWidth - 98, 390+105, 80,40);
  pop();
  text("branches \n dimension", windowWidth - 95, 435+75);
 }

function mousePressed(){
  if((mouseX > windowWidth-90) && (mouseX < windowWidth-25) && (mouseY > 55+75) && (mouseY < 355+75)){
    if (checkbox1.checked()){
      myHue = map(mouseY, 55+75, 355+75, 0, 360);
      myBright = map(mouseX,windowWidth-90,windowWidth-25,100,0);
      myColor = color(myHue, 100, myBright);
      checkbox1.checked(false)
      checkbox2.checked(false)
      checkbox3.checked(false)
    }
    if (checkbox2.checked()){
      strokeHue = map(mouseY, 55+75, 355+75, 0, 360);
      strokeBright = map(mouseX,windowWidth-90,windowWidth-25,100,0);
      strokeColor = color(strokeHue, 100, strokeBright);
      checkbox1.checked(false)
      checkbox2.checked(false)
      checkbox3.checked(false)
    }
    if (checkbox3.checked()){
      backHue = map(mouseY, 55+75, 355+75, 0, 360);
      backBright = map(mouseX,windowWidth-90,windowWidth-25,100,0);
      backColor = color(backHue, 50, backBright);
      background(backColor);
      checkbox1.checked(false)
      checkbox2.checked(false)
      checkbox3.checked(false)

    setUp();
    }
  }

}//end mousePressed

function mouseDragged(){
  if (mouseX<windowWidth - 100 - edge){
    let message = {
      x: mouseX,
      y: mouseY,
      h: myHue,
      b: myBright,
      sh: strokeHue,
      sb: strokeBright,
      sw: strokeW,
      e: edge,
    };
    branchOut(mouseX,mouseY,myColor,strokeColor,strokeW,edge);
    socket.emit("mousee", message)
  }
}


class Root {
  constructor(x, y, color, strokeCol, strokeWe, centerX, centerY, edg){
    this.x = x;
    this.y = y;
    this.color = color;
    this.strokeCol = strokeCol;
    this.strokeW = strokeWe;
    this.speedX = 0;
    this.speedY = 0;
    this.centerX = centerX;
    this.centerY = centerY;
    this.edge = edg;
  }

  draw(){
    this.speedX += random(-0.25, +0.25);
    this.speedY += random(-0.25, +0.25);
    this.x += this.speedX;
    this.y += this.speedY;

    const distanceX = this.x - this.centerX;
    const distanceY = this.y - this.centerY;
    const distance = sqrt(distanceX * distanceX + distanceY *distanceY);
    //current size of the particle
    const radius = (-distance / this.edge + 1) * this.edge / 7;

    if (radius > 0){ //the particle hasn't reached the edge
    requestAnimationFrame(this.draw.bind(this));
      fill(this.color);
      ellipse(this.x, this.y, radius);
      strokeWeight(this.strokeW);
      stroke(this.strokeCol);
    }
  }
}

function branchOut(_x, _y, _col, _strokeCol, _strokeW, _edge){
  push();
    for (let i = 0; i < 3; i++){
      const root = new Root(_x, _y, _col, _strokeCol, _strokeW, _x, _y, _edge);
      root.draw();
    }
  pop();
}


function setUp(){
  push();
    //toolbar
    fill('FloralWhite');
    rect(windowWidth-100,0,85,windowHeight);

    //color palette
    for(let i = 0; i < 300; i++){
      let hue = map(i,0,300,0,360);
      for (let j = 0; j < 65; j++){
        let brightness = map(j,0,65,100,0);
        fill(hue, 100, brightness);
        noStroke();
        rect(windowWidth-90+j,140+i,65-j,1)
      }
    }
  pop();
  // checkboxes
  checkbox1 = createCheckbox('main color', true);
  checkbox1.position(windowWidth - 95, 0);
  checkbox1.style('font-family:Ubuntu');
  checkbox2 = createCheckbox('stroke color', false);
  checkbox2.position(windowWidth - 95, 40);
  checkbox2.style('font-family:Ubuntu');
  checkbox3 = createCheckbox('background & refresh', false);
  checkbox3.position(windowWidth - 95, 80);
  checkbox3.style('font-family:Ubuntu');
  //slider stroke
  sliderStroke = createSlider(0,20, 10);
  sliderStroke.position(windowWidth - 100, 395+75);
  sliderStroke.size(80);
  textSize(15);
  textFont("Ubuntu")
  // text("stroke", windowWidth - 95, 390+75);
  //slider edge
  sliderEdge = createSlider (10, 120, 50);
  sliderEdge.position(windowWidth - 100, 460+75);
  sliderEdge.size(80);
  //text("branches \n dimension", windowWidth - 95, 435+75);
}
