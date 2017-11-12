var INIT_CAPACITY = 50;
var INIT_SOLDIERS = 25;
var END_TIME = 8200;
var REINFORCEMENT_NUMBER = 20;

var stage;
var bases;
var earthGrid;
var naturalSoldiers;
var industrialSoldiers;
var arrowStartX;
var arrowStartY;
var arrowEndX;
var arrowEndY;
var selectedBase;
var soldierN;
var baseSize;
var soldierSize;
var moveSpeed;
var textIndex;
var startTime;
var countdown;

var treeImg;
var factoryImg;
var naturalSoldierImg;
var factorySoldierImg;
var backgroundImg;
var pollutedImg;

var stage1Sound;
var battleSound;
var earthquakeSound;

var earthquake;

function preload(){
  backgroundImg = loadImage("assets/background.png");

  treeImg = loadImage("assets/tree.png");
  factoryImg = loadImage("assets/factory.png");

  naturalSoldierImg = loadImage("assets/Goblin1.png");
  factorySoldierImg = loadImage("assets/gas1.png");
  pollutedImg = loadImage("assets/polluted earth.jpg");

  stage1Sound = loadSound("assets/gun.mp3");
  battleSound = loadSound("assets/battle.wav");
  earthquakeSound = loadSound("assets/earthquake.wav")
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    // any additional setup code goes here
    colorMode("HSB");
    stage = 0;
    earthquake = false;
    baseSize = windowWidth/18;
    soldierSize = windowWidth/30;

    IntroductionText = ["Hello commander!\nWelcome!\nIt's glad to see you.", "I would like to talk more with you, but we don't have time.",
                        "As you see\nthe emissions of the factory are polluting the soil.", "We need you help us to defend the trees and destroy the factories",
                        "You can click the tree and drag to the target.", "You can send reinforcement to other trees or attack the factory",
                        "The future is on your hand. Good luck!"];

    textIndex = 0;

    bases = [{x: windowWidth/8, y: windowHeight/2-baseSize*2.5, capacity: INIT_CAPACITY, soldiers: INIT_SOLDIERS, onsaulght:"false", camp: "tree", target: null},
              {x: windowWidth/8, y: windowHeight/2 , capacity: INIT_CAPACITY, soldiers: INIT_SOLDIERS, onsaulght:"false", camp: "tree", target: null},
              {x: windowWidth/8, y: windowHeight/2+baseSize*2.5, capacity: INIT_CAPACITY, soldiers: INIT_SOLDIERS, onsaulght:"false", camp: "tree", target: null},
              {x: windowWidth-windowWidth/4, y: windowHeight/2-baseSize*2.5, capacity: INIT_CAPACITY, soldiers: INIT_SOLDIERS, onsaulght:"false", camp: "factory", target: null},
              {x: windowWidth-windowWidth/4, y: windowHeight/2, capacity: INIT_CAPACITY, soldiers: INIT_SOLDIERS, onsaulght:"true", camp: "factory", target: 5},
              {x: windowWidth-windowWidth/4, y: windowHeight/2+baseSize*2.5, capacity: INIT_CAPACITY, soldiers: INIT_SOLDIERS, onsaulght:"false", camp: "factory", target: null}];

    earthGrid = [{x: windowWidth/8, y: windowHeight/2-baseSize*2.5, base: "tree"},
                  {x: windowWidth/8, y: windowHeight/2, base: "tree"},
                  {x: windowWidth/8, y: windowHeight+baseSize*2.5, base: "tree"},
                  {x: windowWidth-windowWidth/4, y: windowHeight/2-baseSize*2.5, base: "factory"},
                  {x: windowWidth-windowWidth/4, y: windowHeight/2, base: "factory"},
                  {x: windowWidth-windowWidth/4, y: windowHeight/2+baseSize*2.5, base: "factory"}];

    naturalSoldiers = [[], [], [], [], [], []];
    industrialSoldiers = [[], [], [], [], [], []];

    moveSpeed = 240;
}

function draw() {
    switch (stage) {
      case 0: StartingScreen(); break;
      case 1: fake();break;
      case 2: Introduction(); break;
      case 3: newGame(); break;
      default: StartingScreen(); break;
    }
}

function StartingScreen(){
  background(0);

  push();
  stroke("#BF7530");
  fill("#BF7530");
  textSize(windowWidth/11);
  textStyle(BOLD);
  text("Nature Revenge", windowWidth/2-windowWidth/3, windowHeight/2.2);
  pop();

  stroke(255);
  fill(255);
  if (frameCount % 150 < 80){
    textSize(windowWidth/40);
    text("Click to Start", windowWidth/2.6, windowHeight/1.3);
  }
}

function fake(){
  background(0, 10);
  countdown = countdown - 1;
  if (countdown == 0){
    stage = stage + 1;
  }
}

function Introduction(){
  image(backgroundImg, 0, 0 ,windowWidth, windowWidth, 10);

  image(naturalSoldierImg, windowWidth/20, windowHeight-windowHeight/3, windowHeight/2, windowHeight/2);
  fill(255);
  triangle(windowWidth/5+20, windowHeight-windowHeight/3, windowWidth/4, windowHeight-windowHeight/3, windowWidth/5, windowHeight-windowHeight/3.5);
  rect(windowWidth/5, windowHeight-windowHeight/2.2, windowWidth/5, windowWidth/15);
  textSize(20);
  fill(0);
  text(IntroductionText[textIndex], windowWidth/5+20, windowHeight-windowHeight/2.3, windowWidth/6.5, windowHeight/5);

  if(frameCount%80>40){
    noStroke();
    textSize(windowWidth/150);
    text("Click", windowWidth/5+windowWidth/5-windowWidth/150*3, windowHeight-windowHeight/2.2+windowWidth/15-windowWidth/150);
  }

  if (textIndex == 2){
    showPollutedEarth(earthGrid[4]);
    makeBase(bases[4]);
  }else if(textIndex >= 3){
    earthGrid.map(showPollutedEarth);
    makeBase(bases[3]);
    makeBase(bases[4]);
    makeBase(bases[5]);
  }
}

function newGame(){
  background(255);
  image(backgroundImg, 0, 0, windowWidth, windowHeight);
  earthGrid.map(showPollutedEarth);
  bases.map(makeBase);
  bases.map(makeSoldiers);
  bases.map(createSoldiers);

  for (var i=0;i<naturalSoldiers.length;i++){
    naturalSoldiers[i].map(showSoldiers);
    naturalSoldiers[i].map(soldiersMove);
    soldierN = i;
    naturalSoldiers[i].map(attack);
  }
  for (var i=0; i<industrialSoldiers.length;i++){
    industrialSoldiers[i].map(showSoldiers);
    industrialSoldiers[i].map(soldiersMove);
    soldierN = i;
    industrialSoldiers[i].map(attack);
  }

  makingStrategy();
  soildershitsoilders();

  if(mouseIsPressed && arrowStartX!=null){
    arrowEndX = mouseX;
    arrowEndY = mouseY;
    drawArrow();
  }

  reinforcementArrived();
  gameCompleted();
}

function makeBase(base){
  strokeWeight(0);
  textSize(20);
  if(base.camp == "tree"){
    fill(100, 0, 100);
    //rect(base.x, base.y, windowWidth/10+10*sin(frameCount/50), windowWidth/10+10*cos(frameCount/50));
    text(base.soldiers+"/"+base.capacity, base.x+baseSize/3, base.y-20);
    image(treeImg, base.x, base.y, baseSize, baseSize);
  }else{
    fill(0);
    //ellipse(base.x, base.y, windowWidth/10+10*sin(frameCount/50), windowWidth/10+10*sin(frameCount/50));
    //rect(base.x, base.y, windowWidth/10+10*sin(frameCount/50), windowWidth/10+10*cos(frameCount/50));
    //image(pollutedImg, base.x-baseSize/2, base.y-baseSize/2, baseSize*2, baseSize*2);
    text(base.soldiers+"/"+base.capacity, base.x+baseSize/3, base.y-20);
    image(factoryImg, base.x, base.y, baseSize, baseSize);
  }
}

function showPollutedEarth(grid){
  if(grid.base=="factory"){
    image(pollutedImg, grid.x-baseSize/2, grid.y-baseSize/2, baseSize*2, baseSize*2);
  }
}

function makeSoldiers(base){
  if(frameCount % 100 == 0 && base.soldiers < base.capacity)
    base.soldiers = base.soldiers+1;
}

function createSoldiers(base, i){
  if(frameCount % 35 == 0 && base.onsaulght==true){
    if(base.camp == 'tree'){
      if(base.target-i==1){
        naturalSoldiers[i].push({x: base.x+baseSize/2, y: base.y+baseSize, length: soldierSize, camp: "tree", target: base.target, baseNo: i});
      }else if(base.target-i==-1){
        naturalSoldiers[i].push({x: base.x+baseSize/2, y: base.y-baseSize+20, length: soldierSize, camp: "tree", target: base.target, baseNo: i});
      }else if(base.target>i){
        naturalSoldiers[i].push({x: base.x+baseSize, y: base.y+baseSize/2, length: soldierSize, camp: "tree", target: base.target, baseNo: i});
      }else{
        naturalSoldiers[i].push({x: base.x, y: base.y+baseSize/2, length: soldierSize, camp: "tree", target: base.target, baseNo: i});
      }
    }else{
      if (base.target-i==1){
        industrialSoldiers[i].push({x: base.x+baseSize/2, y: base.y+baseSize, length:soldierSize, camp: "factory", target: base.target, baseNo: i});
      }else if (base.target-i==-1){
        industrialSoldiers[i].push({x: base.x+baseSize/2, y: base.y-baseSize, length:soldierSize, camp: "factory", target: base.target, baseNo: i});
      }else if(base.target>i){
        industrialSoldiers[i].push({x: base.x+baseSize, y: base.y+baseSize/2, length:soldierSize, camp: "factory", target: base.target, baseNo: i});
      }else{
        industrialSoldiers[i].push({x: base.x, y: base.y+baseSize/2, length:soldierSize, camp: "factory", target: base.target, baseNo: i});
      }
    }

    base.soldiers = base.soldiers - 1;

    if (base.soldiers <= 0) {
      base.onsaulght = false;
    }
  }
}

function showSoldiers(soldier){
  if (soldier.camp == 'tree'){
    image(naturalSoldierImg, soldier.x, soldier.y, soldierSize, soldierSize);

  }else{
    image(factorySoldierImg, soldier.x, soldier.y, soldierSize, soldierSize);
  }
}

function soldiersMove(soldier){
  targetBase = bases[soldier.target];
  moveX = (targetBase.x - bases[soldier.baseNo].x)/moveSpeed;
  moveY = (targetBase.y - bases[soldier.baseNo].y)/moveSpeed;
  soldier.x = soldier.x + moveX;
  soldier.y = soldier.y + moveY;
}

function reinforcementArrived(){
  if((frameCount-startTime) % 3600 == 0){
    for(var i=0; i<bases.length;i++){
      if(bases[i].camp == "tree"){
        bases[i].soldiers = bases[i].soldiers + REINFORCEMENT_NUMBER;
      }
    }
  }
}

function attack(soldier){

  targetBase = bases[soldier.target];

  if(soldier.x >= targetBase.x && soldier.x <= targetBase.x+baseSize && soldier.y>=targetBase.y && soldier.y<=targetBase.y+baseSize){
    if(soldier.camp != targetBase.camp){
      bases[soldier.target].soldiers = bases[soldier.target].soldiers - 1;
      if(bases[soldier.target].solders < 0){
        bases[soldier.target] = 0;
      }

      if (soldier.camp == "tree")
        naturalSoldiers[soldierN].shift();
      else {
        industrialSoldiers[soldierN].shift();
      }
      if(bases[soldier.target].soldiers <= 0){
        if (bases[soldier.target].camp == 'factory'){
          bases[soldier.target].camp = "tree";
          earthGrid[soldier.target].base = "tree";
        }else{
          bases[soldier.target].camp = "factory";
          earthGrid[soldier.target].base = "factory";
        }
      }
    }else{
      if (soldier.camp=="tree"){
        naturalSoldiers[soldierN].shift();
      }else{
        industrialSoldiers[soldierN].shift();
      }
      if(bases[soldier.target].soldiers <= 50){
        bases[soldier.target].soldiers = bases[soldier.target].soldiers + 1;
      }
    }
  }
}

function soildershitsoilders(){
  for (var i=0; i < 6; i++){
    if (naturalSoldiers[i].length > 0){
      var target = naturalSoldiers[i][0].target;
      if (target != null){
        if (naturalSoldiers[i].length > 0 && industrialSoldiers[target].length > 0){
          if (naturalSoldiers[i][0].x>=industrialSoldiers[target][0].x && naturalSoldiers[i][0].x<=industrialSoldiers[target][0].x+100 && naturalSoldiers[i][0].y>=industrialSoldiers[target][0].y-50 && naturalSoldiers[i][0].y<=industrialSoldiers[target][0].y+100){
            naturalSoldiers[i].shift();
            industrialSoldiers[target].shift();
          }
        }
      }
    }
  }
}

function makingStrategy(){
  if (frameCount % 100 == 0){
    for (var i=0;i<bases.length;i++){
      if(bases[i].camp == "factory"){
        var reachableEnemies = [];
        var reachableAlley = [];
        for (var j=0; j<bases.length;j++){
          if ((i==2 && j==3)||(i==3 && j==2)){
            continue;
          }
          if( (abs(i-j)==1 || abs(i-j)==3) && bases[i].camp!=bases[j].camp){
            reachableEnemies.push(j);
          }else if ((abs(i-j)==1 || abs(i-j)==3) && bases[i].camp==bases[j].camp){
            reachableAlley.push(j);
          }

        }
        // when the number of soldiers is more than 15, the factory is ready to attack
        if (random(10) > 9 && bases[i].soldiers >= 15){
          if(reachableEnemies.length>0){
            bases[i].target = random(reachableEnemies);
          }else{
            bases[i].target = random(reachableAlley);
          }
          bases[i].onsaulght = true;
        }
      }
    }
  }
}

function drawArrow(){
  stroke(230, 50, 0, 150);
  strokeWeight(20);
  line(arrowStartX, arrowStartY, arrowEndX, arrowEndY);
  translate(windowWidth/2-mouseX, windowHeight/2-mouseY);
}

function gameCompleted(){
  var factoryNum = 0;

  for (var i=0; i < bases.length;i++){
    if(bases[i].camp == "factory"){
      factoryNum = factoryNum + 1;
    }
  }
  if(factoryNum == 0){
    battleSound.stop();
    image(backgroundImg, 0, 0, windowWidth, windowHeight);
    bases.map(makeBase);
    image(naturalSoldierImg, windowWidth/20, windowHeight-windowHeight/3, windowHeight/2, windowHeight/2);
    fill(255);
    triangle(windowWidth/5+20, windowHeight-windowHeight/3, windowWidth/4, windowHeight-windowHeight/3, windowWidth/5, windowHeight-windowHeight/4);
    rect(windowWidth/5, windowHeight-windowHeight/2, windowWidth/5, windowWidth/10);
    textSize(20);
    fill(0);
    text("Well done!\nYou save the forest.", windowWidth/5+20, windowHeight-windowHeight/2.1, 300, 200);
    noLoop();
    return true;
  }else if (factoryNum == 6){
    earthquake = true;
  }

  if (frameCount-startTime>END_TIME || earthquake==true){
    battleSound.stop();
    if (!earthquakeSound.isPlaying()){
      earthquakeSound.jump(2);
    }
    for(var i=0; i<bases.length;i++){
      bases[i].x = bases[i].x + random(-5, 5);
      bases[i].y = bases[i].y + random(-5, 5);
    }
    countdown = countdown - 1;
    if(countdown<=0){
      earthquakeSound.stop();
      image(backgroundImg, 0, 0, windowWidth, windowHeight);
      fill(255);
      triangle(windowWidth/5+20, windowHeight-windowHeight/3, windowWidth/4, windowHeight-windowHeight/3, windowWidth/5, windowHeight-windowHeight/4);
      rect(windowWidth/5, windowHeight-windowHeight/2, windowWidth/5, windowWidth/10);
      textSize(20);
      fill(0);
      image(naturalSoldierImg, windowWidth/20, windowHeight-windowHeight/3, windowHeight/2, windowHeight/2);
      text("Bad news\n The earthquake destoried everything", windowWidth/5+20, windowHeight-windowHeight/2.1, 300, 200);
      noLoop();
    }

  }
}

function mousePressed(){
  for(var i=0; i<bases.length;i++){
    if (mouseX>=bases[i].x && mouseX<=bases[i].x+100 && mouseY>=bases[i].y && mouseY<=bases[i].y+100 && bases[i].camp=="tree"){
      arrowStartX = mouseX;
      arrowStartY = mouseY;
      selectedBase = i;
      break;
    }else{
      arrowStartX = null;
      arrowStartY = null;
    }
  }
}

function mouseReleased(){
  for(var i=0; i<bases.length;i++){
    if(mouseX>=bases[i].x && mouseX<=bases[i].x+baseSize && mouseY>=bases[i].y-20 && mouseY<=bases[i].y+baseSize && arrowStartX!=null && (abs(i-selectedBase)<=1 || abs(i-selectedBase) == 3) ){
      bases[selectedBase].target = i;
      if (i == selectedBase){
        bases[selectedBase].onsaulght = false;
      }else{
        bases[selectedBase].onsaulght = true;
      }
    }
  }
}

function mouseClicked(){
  if (stage==0){
    stage = stage + 1;
    stage1Sound.play();
    stage1Sound.rate(0.8);
    stage1Sound.setVolume(0.5);
    countdown = 60;
  }else if (stage==2){
    textIndex = textIndex + 1;
    if (textIndex == IntroductionText.length){
      countdown = 180;
      stage1Sound.stop();
      stage = 3;
      startTime = frameCount;
      battleSound.loop();
    }
  }
}
