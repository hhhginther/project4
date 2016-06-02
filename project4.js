var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;
var GAME_SCALE = 1;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(GAME_WIDTH,
                                           GAME_HEIGHT,
                                           {backgroundColor: 0x99D5FF});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();
stage.scale.x = GAME_SCALE;
stage.scale.y = GAME_SCALE;

// Scene objects get loaded in the ready function
var player;
var world;

var wolfFramesLeft,wolfFramesRight;

var playerStopped = true;//boolean to control when player can move

//booleans to check for game items and events
bearTalked=false;
hasFlower=false;
hasCoins = false;
birdsMoved = false;
sheepCollision = false;
scarecrowCollisions = 0;
scarecrowBroken = false;
farmerGone = false;

itemsFound = 0
clothesFound = false;
keyFound = false;

// Character movement constants:
var MOVE_LEFT = 1;
var MOVE_RIGHT = 2;
var MOVE_UP = 3;
var MOVE_DOWN = 4;
var MOVE_NONE = 0;

var lastx,lasty;

// The move function starts or continues movement
function move() {
  if(testObsCollisions()) {
    player.position.set(lastx,lasty);
  }

  if (player.direction == MOVE_NONE) {
    player.moving = false;
    wolfMan.gotoAndStop(0);
    return;
  }

  player.moving = true;
  wolfMan.play();

  lastx = player.x;
  lasty = player.y;

  var nextx=player.x;
  var nexty=player.y;

  movSpeed = 0.3;

  if (player.direction == MOVE_LEFT ) {
    wolfMan.textures = wolfFramesLeft;
    nextx -= 32 * movSpeed;
  }
  if (player.direction == MOVE_RIGHT){
    wolfMan.textures = wolfFramesRight;
    nextx+=32 * movSpeed;
  }
  if (player.direction == MOVE_UP) nexty-=32 * movSpeed;
  if (player.direction == MOVE_DOWN) nexty+=32 * movSpeed;

  createjs.Tween.get(player).to({y: nexty, x: nextx}).call(move);
}

// Keydown events start movement
window.addEventListener("keydown", function (e) {
  e.preventDefault();
  if (!player) return;
  if (player.moving) return;
  if(playerStopped) return;
  if (e.repeat == true) return;

  player.direction = MOVE_NONE;

  if (e.keyCode == 87)
    player.direction = MOVE_UP;
  else if (e.keyCode == 83)
    player.direction = MOVE_DOWN;
  else if (e.keyCode == 65)
    player.direction = MOVE_LEFT;
  else if (e.keyCode == 68)
    player.direction = MOVE_RIGHT;

  move();
});

// Keyup events end movement
window.addEventListener("keyup", function onKeyUp(e) {
  e.preventDefault();
  if (!player) return;
  player.direction = MOVE_NONE;
});

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

//startScreen parts:
//start image and text
var startScreen = new PIXI.Container();
stage.addChild(startScreen);
var startImage = new PIXI.Sprite(PIXI.Texture.fromImage("startImage.png"));
startScreen.addChild(startImage);
startImage.interactive = true;
startImage.on('mousedown', onStartScreenClick);
var startText =  new PIXI.Text("Click anywhere to continue",{font: '20px Calibri',
        fill: 0xe4f1e8, align: 'center',strokeThickness: 1});
startScreen.addChild(startText);
//info screen text
var infoText = new PIXI.Text("You've had a rough night.\n\n\
  You've been cursed my dude,\nnow you're a dog\n\n\
  And as a dog you made some poor choices:\nYou lost everything you were carrying!\n\n\
  I'm sure being a dog is cool and all,\nbut you should probably find your stuff\n\
  and go home before that curse lifts\n\nI mean, you've got no clothes my dude",
  {font: '20px Calibri', align: 'center', fill: 0xe4f1e8,strokeThickness: 2});
var infoText2 =  new PIXI.Text("To summarize:\nFind your stuff and get home!\n\
You've lost your wallet,\n house key, and clothes\n\
(as well as your diginity, \nbut good luck finding that)\
\n\nControls:\nUse WASD to move, Click to close dialogue\nTo interact with others, just walk up to them",
  {font: '20px Calibri', align: 'center', fill: 0xe4f1e8,strokeThickness: 2});

infoText.visible=false;
infoText.position.set(10,80);
startScreen.addChild(infoText);
infoText2.visible=false;
infoText2.position.set(10,80);
startScreen.addChild(infoText2);
var currScreen =0;

//endScreen parts:
//end image and text
var winScreen = new PIXI.Container();
var endImage = new PIXI.Sprite(PIXI.Texture.fromImage("winScreen.png"));
winScreen.addChild(endImage);
var endText = new PIXI.Text("YOU WIN",{font: '20px Calibri',
        fill: 0xe4f1e8, align: 'center',strokeThickness: 2});
endText.x +=100;
endText.y +=100;
winScreen.addChild(endText);

//in game text (dialogue..)
var bearText = "Oh hey man.\n You went nuts last night\n\
  All your stuff is gone?\n\
  Well, I think ya buried\nsomething by the lake";
var bearText3 = "Oh, found your wallet?\nGood, you owe me $20\n\nnow get outta here";
var walletText = "You dug up your wallet!\nWhy did you bury it\nin the first place";
var flowerText= "You found\na nice flower";
var birdsText = "You've gotta pay the toll\nto pass us\nNo money left? Leave!!";
var birdsText2 = "Ah, coins, we'll take those.\nYou can pass";
var coinText = "You found a few coins";
var keyText = "You found your house key!";
var bugText = "This is my garden.\nBring me a flower and\nyou can enter";
var bugText2 = "Oh, nice flower you\ngot there. Come on in";
var secondBugText = "That farmer is kinda rude.\nwanna mess with him?\nI hear he loves that scarecrow..\n\
  just sayin"
var farmerText ="GIT AWAY FROM MY SHEEP\n";
var farmerText2 = "My scarecrow!!!"
var sheepText = "haha....\nare we in the way?\nwe won't move as long as the\nfarmer is here";
var sheepText2= "yikes!";
var scarecrowText = "This scarecrow is old.\nIf you bumped into it too\n much it may just fall over";
var scarecrowText2 = "You broke it!\nThe farmer won't like that";
var clothesText = "You regained your clothes!";
var houseTextClothes = "You've got no clothes you beast";
var houseTextKey = "How are you gonna get in\nwithout your key??"
var houseText = "Welcome home\nYou have regained your lost possesions\n..."

PIXI.loader
  .add('map_json', 'map.json')
  .add('tileset', 'tileset.png')
  .add('otherSprites.json')
  .add('wolfSprites.json')
  .load(ready);

function ready() {
  tu = new TileUtilities(PIXI);
  world = tu.makeTiledWorld("map_json", "tileset.png");
  stage.addChild(world);

  //RETRIEVING OBJECTS & DATA FROM MAP
  var entity_layer = world.getObject("entities");  // Find the entity layer
  var wolf = world.getObject("wolf");//player Character object
  var bear = world.getObject("bear");
  var house = world.getObject("house");
  var barn = world.getObject("barn");
  var scarecrow = world.getObject("scarecrow");
  var farmer = world.getObject("farmer");
  var flower = world.getObject("flower");
  var coins = world.getObject("coins");
  var bug = world.getObject("bug");
  var bug2 = world.getObject("bug2");
  var sandX = world.getObject("sandX");
  var shirt = world.getObject("shirt");
  var key = world.getObject("key");

  var sheepObjArray =[];//array of sheep
  //getting sheep objects from map
  for(var i=1;i<=17;i++){
    sheepObjArray.push(world.getObject("sheep" + i));
  }

  var birdObjArray=[]
  for(var i=1;i<=3;i++){
    birdObjArray.push(world.getObject("magpie" + i));
  }

  var cornObjArray=[]
  for(var i=1;i<=10;i++){
    cornObjArray.push(world.getObject("corn" + i));
  }

  //array of impassable land of map
  wallMapArray = world.getObject("obstacles").data;

  //sand X setup
  secretSand = new PIXI.Sprite(PIXI.Texture.fromFrame("x.png"));
  secretSand.x = sandX.x;
  secretSand.y = sandX.y;
  entity_layer.addChild(secretSand);
  secretSand.visible=false;

  //clothes
  clothes = new PIXI.Sprite(PIXI.Texture.fromFrame("shirt.png"));
  clothes.x = shirt.x;
  clothes.y = shirt.y;
  entity_layer. addChild(clothes);

  //key
  myKey = new PIXI.Sprite(PIXI.Texture.fromFrame("key.png"));
  myKey.x = key.x;
  myKey.y = key.y;
  entity_layer.addChild(myKey);

  //PLAYER SETUP - ANIMATION, COLLISION AREA, POSITION
  wolfFramesRight = [];//frames for right-facing player run animation
  wolfFramesLeft = [];//frames for left-facing player run animation
  for(var i=1;i<=5;i++){
    wolfFramesRight.push(PIXI.Texture.fromFrame('wolfrev' + i + '.png'));
    wolfFramesLeft.push(PIXI.Texture.fromFrame('wolf' + i + '.png'));
  }

  wolfMan = new PIXI.extras.MovieClip(wolfFramesRight);//starts player facing right
  wolfMan.animationSpeed = 0.2;

  //Collision area for player's sprite made smaller to avoid unwanted obstacle collision
  wolfMan.collisionArea = {x: wolfMan.x,y:wolfMan.y,width:10,height:10};
  player = wolfMan;//setting player's position relative to map "wolf" object
  player.x = wolf.x;
  player.y = wolf.y;
  player.anchor.x = 0.0;
  player.anchor.y = 1.0;

  entity_layer.addChild(player);//adds player to the game (entity layer)

  //initial player movement variables- player not moving
  player.direction = MOVE_NONE;
  player.moving = false;

  //NPC SETUP- ANIMATION, POSITION, INTERACTION
  birdFrames = [];
  sheepFrames = [];
  cornFrames = [];
  for(var i =1; i<=3;i++){
      birdFrames.push(PIXI.Texture.fromFrame('magpie' + i + '.png'));
      sheepFrames.push(PIXI.Texture.fromFrame('sheep' + i + '.png'));
      cornFrames.push(PIXI.Texture.fromFrame('corn' + i + '.png'));
  }
  cornFrames.push(PIXI.Texture.fromFrame('corn2.png'));
  //bird setup
  birdSprites = [];
  for(var i =0;i<3;i++){
    birdSprites[i]= new PIXI.extras.MovieClip(birdFrames);
    birdSprites[i].x = birdObjArray[i].x;
    birdSprites[i].y = birdObjArray[i].y;
    entity_layer.addChild(birdSprites[i]);
    birdSprites[i].play();
    birdSprites[i].animationSpeed = .1;
  }

  //sheep setup
  sheepSprites = [];

  //sheepTex = PIXI.Texture.fromImage('sheep1.png');
  for(var i=0;i<17;i++){
    sheepSprites[i] =new PIXI.extras.MovieClip(sheepFrames);
    sheepSprites[i].x = sheepObjArray[i].x;
    sheepSprites[i].y = sheepObjArray[i].y;
    entity_layer.addChild(sheepSprites[i]);
    sheepSprites[i].play();
    sheepSprites[i].animationSpeed = .1;
  }

  //corn setup
  cornSprites = [];

  //cornTex = PIXI.Texture.fromImage('corn1.png');
  for(var i=0;i<10;i++){
    cornSprites[i] = new PIXI.extras.MovieClip(cornFrames);
    cornSprites[i].x = cornObjArray[i].x;
    cornSprites[i].y = cornObjArray[i].y;
    entity_layer.addChild(cornSprites[i]);
    cornSprites[i].play();
    cornSprites[i].animationSpeed = .08;
  }

  //scarecrow setup
  scarecrowMan = new PIXI.Sprite(PIXI.Texture.fromImage("scarecrow.png"));
  scarecrowMan.x = scarecrow.x;
  scarecrowMan.y = scarecrow.y;
  entity_layer.addChild(scarecrowMan);

  bearFrames = [];
  bugFrames = [];
  flowerFrames = [];
  coinFrames=[];
  farmerFrames=[];
  for(var i=1;i<=2;i++){
    bearFrames.push(PIXI.Texture.fromFrame('bear' + i + '.png'));
    bugFrames.push(PIXI.Texture.fromFrame('beetle' + i + '.png'));
    flowerFrames.push(PIXI.Texture.fromFrame('flower' + i + '.png'));
    coinFrames.push(PIXI.Texture.fromFrame('coins' + i + '.png'));
    farmerFrames.push(PIXI.Texture.fromFrame('farmer' + i + '.png'));
  }

  //bear setup
  bearMan = new PIXI.extras.MovieClip(bearFrames);
  bearMan.x = bear.x;
  bearMan.y = bear.y;
  entity_layer.addChild(bearMan);
  bearMan.play();
  bearMan.animationSpeed = .08;

  //barn setup
  aBarn = new PIXI.Sprite(PIXI.Texture.fromImage("house2.png"));
  aBarn.x = barn.x;
  aBarn.y = barn.y;
  entity_layer.addChild(aBarn);

  //house setup
  myHouse = new PIXI.Sprite(PIXI.Texture.fromImage("house.png"));
  myHouse.x = house.x;
  myHouse.y = house.y;
  entity_layer.addChild(myHouse);

  //bug setup
  aBug = new PIXI.extras.MovieClip(bugFrames);
  aBug.x = bug.x;
  aBug.y = bug.y;
  entity_layer.addChild(aBug);
  aBug.play();
  aBug.animationSpeed = .08;

  //2nd bug
  secondBug = new PIXI.extras.MovieClip(bugFrames);
  secondBug.x = bug2.x;
  secondBug.y = bug2.y;
  entity_layer.addChild(secondBug);
  secondBug.play();
  secondBug.animationSpeed = .08;

  //flower setup
  aflower = new PIXI.extras.MovieClip(flowerFrames);
  aflower.x = flower.x;
  aflower.y = flower.y;
  entity_layer.addChild(aflower);
  aflower.play();
  aflower.animationSpeed = .08;

  //coins setup
  someCoins = new PIXI.extras.MovieClip(coinFrames);
  someCoins.x = coins.x;
  someCoins.y = coins.y;
  entity_layer.addChild(someCoins);
  someCoins.play();
  someCoins.animationSpeed = .08;

  aFarmer = new PIXI.extras.MovieClip(farmerFrames);
  aFarmer.x = farmer.x;
  aFarmer.y = farmer.y;
  entity_layer.addChild(aFarmer);
  aFarmer.play();
  aFarmer.animationSpeed = .08;

  world.visible=false;

  animate();
}

//advances screens between title, instruction, and game screens
function onStartScreenClick(){
  if(currScreen==0){
    infoText.visible=true;
    currScreen++;
  }
  else if(currScreen==1){
    infoText.visible=false;
    infoText2.visible=true;
    currScreen++;
  }
  else {
    startScreen.visible = false;
    //startImage.visible=false;
    world.visible=true;
    playerStopped=false;
  }
}

function addTextToScreen(textToAdd) {
    playerStopped=true;
    textToAdd = new PIXI.Text(textToAdd,{font: '20px Calibri',
            fill: 0xe4f1e8,strokeThickness: 2,align:'center'});
    stage.addChild(textToAdd);
    textToAdd.position.set(player.x-50,player.y-50);
    textToAdd.interactive = true;
    textToAdd.on('mousedown', onDialogueClick);
}

function onDialogueClick() {
  this.visible = false;
  stage.removeChild(this);
  playerStopped=false;
}

//checks for player collisions with all game barriers like water, walls, other sprites
function testObsCollisions() {
  var collisiontest = tu.hitTestTile(wolfMan, wallMapArray, 0, world, 'every');
  if (!collisiontest.hit){
      console.log("hit");
      return true;
  }
  if(testSpriteCollision(wolfMan, bearMan)) {
    if(itemsFound==0){
      playerStopped=true;
      addTextToScreen(bearText);
      bearTalked=true;
      secretSand.visible=true;
      return true;
    }
    else if(itemsFound>0){
      addTextToScreen(bearText3);
      createjs.Tween.get(bearMan).to({x: 700 ,y: 150},1000)
      return true;
    }
  }
  for(var i =0;i<birdSprites.length;i++){
     if(testSpriteCollision(wolfMan,birdSprites[i])){
       if(!birdsMoved){
         if(hasCoins){
           addTextToScreen(birdsText2);
           moveBirds();
           birdsMoved=true;
         }
         else {
            addTextToScreen(birdsText);
         }
       }

       return true;
     }
  }
  if(testSpriteCollision(wolfMan,secretSand)) {
    if(bearTalked&&secretSand.visible){
      secretSand.visible=false;
      itemsFound++;
      addTextToScreen(walletText);
    }
  }
  if(testSpriteCollision(wolfMan,aBarn)) return true;
  if(testSpriteCollision(wolfMan, myHouse)){
    if(!keyFound) {
      addTextToScreen(houseTextKey);
      return true;
    }
    else if(!clothesFound){
       addTextToScreen(houseTextClothes);
       return true;
     }
    winGame();
  }
  if(testSpriteCollision(wolfMan, scarecrowMan)) {
    if(scarecrowCollisions <5) {
      if (scarecrowCollisions==0 ){
      addTextToScreen(scarecrowText);
      }
      scarecrowCollisions++;
      return true;
    }
    else if(scarecrowMan.visible==true) {
      addTextToScreen(scarecrowText2);
      scarecrowMan.visible=false;
      scarecrowBroken=true;
    }
  }
  if(testSpriteCollision(wolfMan,secondBug)) {
    addTextToScreen(secondBugText);
    return true;
  }
  if(testSpriteCollision(wolfMan, aBug)){
    if(hasFlower==false){
    addTextToScreen(bugText)
    return true;
    }
    else {
      addTextToScreen(bugText2);
      createjs.Tween.get(aBug).to({y: 1080},1000);
      return true;
    }
  }
  if(testSpriteCollision(wolfMan, aflower)){
    if(!hasFlower){
    hasFlower=true;
    aflower.visible=false;
    addTextToScreen(flowerText);
      }
    }
  if(testSpriteCollision(wolfMan, someCoins)) {
    if(!hasCoins){
      hasCoins=true;
      someCoins.visible=false;
      addTextToScreen(coinText);
    }
  }
  for(var i =0;i<sheepSprites.length;i++)
     if(testSpriteCollision(wolfMan,sheepSprites[i])){
       if(!farmerGone){
            addTextToScreen(sheepText);
         return true;
       }
       else if(!sheepCollision){
          addTextToScreen(sheepText2)
          sheepCollision=true;
         }
       else sheepSprites[i].x-=32;
     }
  if(testSpriteCollision(wolfMan, clothes)) {
    if(clothes.visible){
    clothes.visible = false;
    itemsFound++;
    clothesFound=true;
    addTextToScreen(clothesText);
    }
  }
  if(testSpriteCollision(wolfMan,myKey)) {
    if(myKey.visible){
      myKey.visible = false;
      itemsFound++;
      keyFound=true;
      addTextToScreen(keyText);
    }
  }
  if(testSpriteCollision(wolfMan, aFarmer)){
    if(scarecrowBroken){
      addTextToScreen(farmerText2);
      createjs.Tween.get(aFarmer).to({x: scarecrowMan.x,y:scarecrowMan.y},1000);
      farmerGone = true;
    }
    else addTextToScreen(farmerText);
    return true;
   }

}

function moveBirds() {
  for(var i=0;i<birdSprites.length;i++){
  createjs.Tween.get(birdSprites[i]).to({x: birdSprites[i].x+96,y:birdSprites[i].y-96},1000);
  }
}

//checks for player collision with other in-game, non-obstacle sprites
function testSpriteCollision(sprite1, sprite2) {
  if(sprite1.x< sprite2.x +sprite2.width &&
    sprite1.x + sprite1.width > sprite2.x &&
    sprite1.y < (sprite2.y+15) + sprite2.height &&
    sprite1.height + sprite1.y > (sprite2.y+15)){
      console.log("COLLISION!!");
      return true;//collision detected
    }
  else return false;//no collision
}

function winGame() {
  stage.addChild(winScreen);
  playerStopped = true;
}

fps = 30;
function animate(timestamp) {
    setTimeout(function() {
      requestAnimationFrame(animate);
    }, 1000/fps);

  update_camera();
  renderer.render(stage);
}

function update_camera() {
  stage.x = -player.x*GAME_SCALE + GAME_WIDTH/2 - player.width/2*GAME_SCALE;
  stage.y = -player.y*GAME_SCALE + GAME_HEIGHT/2 + player.height/2*GAME_SCALE;
  stage.x = -Math.max(0, Math.min(world.worldWidth*GAME_SCALE - GAME_WIDTH, -stage.x));
  stage.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -stage.y));
}
