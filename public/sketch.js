let socket = io();
let myColor = "white";
let myHue= Math.floor(Math.random()*360);

socket.on("connect", newConnection);
socket.on("mouseBroad", drawOtherMouses);

//my variables
const edge = 50; //size of the circle area each particle is allowed to move
let drawing = false; // I want to raw only when I click

function drawOtherMouses(mouseData){
  push();
    colorMode(HSB);
    console.log("mouse data: ")
    console.log(mouseData);
      let otherColor = color(mouseData.h, 100, 100)
      branchOut(mouseData.x, mouseData.y,otherColor);
  pop();
}

function newConnection(){
  console.log("my connection: " + socket.id);
}

function setup() {
  createCanvas(windowWidth,windowHeight);
  background(255);//(80,100,240);
  colorMode(HSB);
  myColor=color(myHue,100,100)
}

function draw() {
  push();
    //barra strumenti laterale
    fill('FloralWhite');
    rect(windowWidth-100,0,85,windowHeight);

    //tavolozza dei colori
    for(let i = 0; i < 300; i++){
      let hue = map(i,0,300,0,360);
      fill(hue, 100, 100);
      noStroke();
      rect(windowWidth-90,30+i,65,1)
    }
  pop();
 }

function mousePressed(){
  if((mouseX > windowWidth-90) && (mouseX < windowWidth-25) && (mouseY > 30) && (mouseY < 330)){
    let hue = map(mouseY, 30, 330, 0, 360)
    myHue = hue;
    myColor = color(hue, 100, 100);
    print(myColor);
  }
}

function mouseDragged(){
  print("myHue: " + myHue)
  if (mouseX<windowWidth - 90){
    let message = {
      x: mouseX,
      y: mouseY,
      h: myHue,
    };
    branchOut(mouseX,mouseY,myColor);
    console.log('GGG')
    socket.emit("mousee", message)
  }
}


class Root {
  constructor(x, y, color, centerX, centerY){
    this.x = x;
    this.y = y;
    this.color = color;
    this.speedX = 0;
    this.speedY = 0;
    this.centerX = centerX;
    this.centerY = centerY;
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
    const radius = (-distance / edge + 1) * edge / 7; //try to put 1 instead of edge/10 later

    if (radius > 0){ //the particle hasn't reached the edge
    requestAnimationFrame(this.draw.bind(this)); //we give it its own request animation frame loop
    print(this.color);
      fill(this.color);
      ellipse(this.x, this.y, radius);
      strokeWeight(0.6);
      stroke(0);
    }
  }
}

function branchOut(_x, _y, _col){

    for (let i = 0; i < 3; i++){
      const root = new Root(_x, _y, _col, _x, _y);
      root.draw();
    }
}
