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
sheepCollision = false;
scarecrowCollisions = 0;
scarecrowBroken = false;

itemsFound = 0

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
var startText =  new PIXI.Text("Click to start",{font: '20px Calibri',
        fill: 0xe4f1e8, align: 'center',strokeThickness: 2});
startScreen.addChild(startText);
//info screen text
var infoText =  new PIXI.Text("Controls:",{font: '20px Calibri',
        fill: 0xe4f1e8, align: 'center',strokeThickness: 2});
infoText.visible=false;
infoText.position.set(150,100);
startScreen.addChild(infoText);

//in game text (dialogue..)
var bugText = "This is my garden.\n Bring me a flower and\nyou can enter";
var bugText2 = "Oh, nice flower you\n got there. Come on in";
var farmerText ="GIT AWAY FROM MY SHEEP";
var scarecrowText = "This scarecrow is old.\nIf you bumped into it too much\nit may just fall over";
var scarecrowText2 = "You broke it!";
var houseText = "You've got no clothes you beast";
var houseText2 = "Welcome home\nYou have regained your lost possesions\n..."


PIXI.loader
  .add('map_json', 'map.json')
  .add('tileset', 'tileset.png')
  .add('wolf', 'wolfrev1.png')
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
  var scarecrow = world.getObject("scarecrow");
  var farmer = world.getObject("farmer");
  var flower = world.getObject("flower");
  var coins = world.getObject("coins");
  var bug = world.getObject("bug");
  var sandX = world.getObject("sandX");
  var shirt = world.getObject("shirt");

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
  secretSand = new PIXI.Sprite(PIXI.Texture.fromImage("x.png"));
  secretSand.x = sandX.x;
  secretSand.y = sandX.y;
  entity_layer.addChild(secretSand);

  //clothes
  clothes = new PIXI.Sprite(PIXI.Texture.fromImage("shirt.png"));
  clothes.x = shirt.x;
  clothes.y = shirt.y;
  entity_layer. addChild(clothes);

  //PLAYER SETUP - ANIMATION, COLLISION AREA, POSITION
  wolfFramesRight = [];//frames for right-facing player run animation
  for(var i=1;i<=5;i++){
    wolfFramesRight.push(PIXI.Texture.fromFrame('wolfrev' + i + '.png'));
  }
  wolfFramesLeft = [];//frames for left-facing player run animation
  for(var i=1;i<=5;i++){
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

  birdSprites = [];  //bird setup

  birdTex = PIXI.Texture.fromImage('magpie1.png');
  for(var i =0;i<3;i++){
    birdSprites[i]= new PIXI.Sprite(birdTex);
    birdSprites[i].x = birdObjArray[i].x;
    birdSprites[i].y = birdObjArray[i].y;
    entity_layer.addChild(birdSprites[i]);
  }

  //sheep setup
  sheepSprites = [];

  sheepTex = PIXI.Texture.fromImage('sheep1.png');
  for(var i=0;i<17;i++){
    sheepSprites[i] = new PIXI.Sprite(sheepTex);
    sheepSprites[i].x = sheepObjArray[i].x;
    sheepSprites[i].y = sheepObjArray[i].y;
    entity_layer.addChild(sheepSprites[i]);
  }

  //corn setup
  cornSprites = [];

  cornTex = PIXI.Texture.fromImage('corn1.png');
  for(var i=0;i<10;i++){
    cornSprites[i] = new PIXI.Sprite(cornTex);
    cornSprites[i].x = cornObjArray[i].x;
    cornSprites[i].y = cornObjArray[i].y;
    entity_layer.addChild(cornSprites[i]);
  }

  //scarecrow setup
  scarecrowMan = new PIXI.Sprite(PIXI.Texture.fromImage("scarecrow.png"));
  scarecrowMan.x = scarecrow.x;
  scarecrowMan.y = scarecrow.y;
  entity_layer.addChild(scarecrowMan);

  //bear setup
  bearMan = new PIXI.Sprite(PIXI.Texture.fromImage("bear1.png"));
  bearMan.x = bear.x;
  bearMan.y = bear.y;
  entity_layer.addChild(bearMan);



  //house setup
  myHouse = new PIXI.Sprite(PIXI.Texture.fromImage("house.png"));
  myHouse.x = house.x;
  myHouse.y = house.y;
  entity_layer.addChild(myHouse);

  //bug setup
  aBug = new PIXI.Sprite(PIXI.Texture.fromImage("beetle1.png"));
  aBug.x = bug.x;
  aBug.y = bug.y;
  entity_layer.addChild(aBug);

  //flower setup
  aflower = new PIXI.Sprite(PIXI.Texture.fromImage("flower1.png"));
  aflower.x = flower.x;
  aflower.y = flower.y;
  entity_layer.addChild(aflower);

  //coins setup
  someCoins = new PIXI.Sprite(PIXI.Texture.fromImage("coins1.png"));
  someCoins.x = coins.x;
  someCoins.y = coins.y;
  entity_layer.addChild(someCoins);

  aFarmer = new PIXI.Sprite(PIXI.Texture.fromImage("farmer1.png"));
  aFarmer.x = farmer.x;
  aFarmer.y = farmer.y;
  entity_layer.addChild(aFarmer);


  //bugText.visible = false;

  world.visible=false;

  animate();
}

//advances screens between title, instruction, and game screens
function onStartScreenClick(){
  if(infoText.visible == false){
    infoText.visible=true;
  }
  else{
    startScreen.visible = false;
    //startImage.visible=false;
    world.visible=true;
    playerStopped=false;
  }
}

function addTextToScreen(textToAdd) {
    playerStopped=true;
    textToAdd = new PIXI.Text(textToAdd,{font: '20px Calibri',
            fill: 0xe4f1e8,strokeThickness: 2});
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
  // if(testSpriteCollision(wolfMan, bearMan)) {
  //   addTextToScreen();
  //   return true;
  // }
  // for(var i =0;i<birdSprites.length;i++){
  //    if(testSpriteCollision(wolfMan,birdSprites[i])) return true;
  // }
  if(testSpriteCollision(wolfMan, myHouse)){
    if(itemsFound <3) addTextToScreen(houseText);
    else addTextToScreen(houseText2);
    return true;
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
    hasFlower=true;
    aflower.visible=false;
    }
  if(testSpriteCollision(wolfMan, someCoins)) {
    someCoins.visible=false;
  }
  for(var i =0;i<sheepSprites.length;i++){
     if(testSpriteCollision(wolfMan,sheepSprites[i])) return true;
  }
  if(testSpriteCollision(wolfMan, aFarmer)){
    if(scarecrowBroken){
      createjs.Tween.get(aFarmer).to({x: scarecrowMan.x,y:scarecrowMan.y},1000);
    }
     return true;
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

fps = 15;
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
