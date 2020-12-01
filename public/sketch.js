let socket = io();
let myColor = "white";
let myHue= Math.floor(Math.random()*360);
let myBright = 100;
let strokeColor = "black";
let strokeHue = 0;
let strokeBright = 0;
let rubClicked=false;
let cnv;
let backColor = "white";
let strokeW = 0.5;
let backColorPalette = [ "WhiteSmoke", "Seashell","Honeydew", "LavenderBlush","AntiqueWhite", "Azure", "MistyRose" ]
let edge = 50; //size of the circle area each particle is allowed to move
let drawing = false; // I want to raw only when I click

socket.on("connect", newConnection);
socket.on("mouseBroad", drawOtherMouses);

//drawing what clients draw
function drawOtherMouses(mouseData){
  if(mouseData.rub==false){
    push();
      colorMode(HSB);
        let otherColor = color(mouseData.h, 100, mouseData.b);
        let otherStrokeColor = color(mouseData.sh, 100, mouseData.sb);
        branchOut(mouseData.x, mouseData.y,otherColor,otherStrokeColor, mouseData.sw, mouseData.e);
    pop();
  } else{
    push();
    stroke(backColor);
    strokeWeight(mouseData.r);
    line(mouseData.px, mouseData.py, mouseData.x, mouseData.y);
    pop();
  }
}

//not necessary
function newConnection(){
  console.log("my connection: " + socket.id);
}

//set up the board
function setup() {
  createCanvas(windowWidth,windowHeight);
  colorMode(HSB);
  backColor=random(backColorPalette);
  background(backColor);
  //main color
  myColor=color(myHue,100,myBright)
  // checkboxes
  checkbox1 = createCheckbox('main color', true);
  checkbox1.position(windowWidth - 125, 5);
  checkbox1.style('font-family:Ubuntu');
  checkbox2 = createCheckbox('stroke color', false);
  checkbox2.position(windowWidth - 125, 25);
  checkbox2.style('font-family:Ubuntu');
  //stroke slider
  sliderStroke = createSlider(0,20, 10);
  sliderStroke.position(windowWidth - 120, 420);
  sliderStroke.size(90);
  textSize(17);
  textFont("Ubuntu")
  //dimension slider
  sliderEdge = createSlider (10, 120, 50);
  sliderEdge.position(windowWidth - 120, 460);
  sliderEdge.size(90);
  //rubber
  sliderRub = createSlider(10,100,40);
  sliderRub.position(windowWidth - 90, 370);
  sliderRub.size(60);
  rub=createImg("rubber.png")
  rub.style("width:20px; position:absolute;  filter: grayscale(80%); opacity:0.6")
  rub.position(windowWidth-115,370)
  rub.mouseClicked(myFunction);
  //downloading image
  save = createButton("save");
  save.position(windowWidth-100, 500);
  save.mousePressed(download);
  //building the toolbar
  setUp();
}

function download(){
  let to_save = get( 0, 0, windowWidth-131, windowHeight );
  to_save.save("saved_name", "png");
}

//rubber click
function myFunction(){
  if (rubClicked == false){
    rubClicked = true;
    rub.style("filter: grayscale(0%); opacity: 1")
  } else {
    rubClicked = false;
    rub.style("filter: grayscale(80%);opacity:0.6")
  }
}

function draw() {
  strokeW = sliderStroke.value()/20;
  edge = sliderEdge.value();
  //overriding text at every frame in order to have the right font
  push();
    fill('FloralWhite');
    noStroke();
    rect(windowWidth - 105, 405, 70, 20);
    fill(0)
    textAlign(CENTER);
    textFont("Ubuntu");
    text("stroke", windowWidth - 75, 420);
    fill('FloralWhite');
    rect(windowWidth - 120, 445, 90, 20);
    fill(0);
    text("dimension", windowWidth - 75, 460);
  pop();
 }

//selecting the color
function mousePressed(){
  if((mouseX > windowWidth-115) && (mouseX < windowWidth-30) && (mouseY > 60) && (mouseY < 360)){
    if (checkbox1.checked()){
      myHue = map(mouseY, 60, 360, 0, 360);
      myBright = map(mouseX,windowWidth-115,windowWidth-30,100,0);
      myColor = color(myHue, 100, myBright);
    }
    if (checkbox2.checked()){
      strokeHue = map(mouseY, 60, 360, 0, 360);
      strokeBright = map(mouseX,windowWidth-115,windowWidth-30,100,0);
      strokeColor = color(strokeHue, 100, strokeBright);
    }
  }
}

//drawing
function mouseDragged(){
  if (rubClicked==false){
    if (mouseX<windowWidth - 130 - edge){
    branchOut(mouseX,mouseY,myColor,strokeColor,strokeW,edge);
    let message = {
      x: mouseX,
      y: mouseY,
      px: pmouseX,
      py: pmouseY,
      r: sliderRub.value(),
      rub: rubClicked,
      h: myHue,
      b: myBright,
      sh: strokeHue,
      sb: strokeBright,
      sw: strokeW,
      e: edge,
    };
    socket.emit("mousee", message)
  }
  } else
    if(mouseX<windowWidth-130-sliderRub.value() ){
    push();
        stroke(backColor);
        strokeWeight(sliderRub.value());
          line(mouseX, mouseY, pmouseX, pmouseY);
    pop();
    let message = {
      x: mouseX,
      y: mouseY,
      px: pmouseX,
      py: pmouseY,
      r: sliderRub.value(),
      rub: rubClicked,
      h: myHue,
      b: myBright,
      sh: strokeHue,
      sb: strokeBright,
      sw: strokeW,
      e: edge,
    };
    socket.emit("mousee", message)
  }
}//mouseDragged end

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

//show the branches from every point
function branchOut(_x, _y, _col, _strokeCol, _strokeW, _edge){
  push();
    for (let i = 0; i < 3; i++){
      const root = new Root(_x, _y, _col, _strokeCol, _strokeW, _x, _y, _edge);
      root.draw();
    }
  pop();
}

//setting up toolbar and color palette
function setUp(){
  push();
    //toolbar
    fill('FloralWhite');
    rect(windowWidth-130,0,115,windowHeight);
    //color palette
    for(let i = 0; i < 300; i++){
      let hue = map(i,0,300,0,360);
      for (let j = 0; j < 85; j++){
        let brightness = map(j,0,85,100,0);
        fill(hue, 100, brightness);
        noStroke();
        rect(windowWidth-115+j,60+i,85-j,1)
      }
    }
  pop();
}
