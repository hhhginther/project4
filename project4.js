var GAME_WIDTH = 480;
var GAME_HEIGHT = 480;
var GAME_SCALE = 1.5;

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

// Character movement constants:
var MOVE_LEFT = 1;
var MOVE_RIGHT = 2;
var MOVE_UP = 3;
var MOVE_DOWN = 4;
var MOVE_NONE = 0;

// The move function starts or continues movement
function move() {
  if (player.direction == MOVE_NONE) {
    player.moving = false;
    wolfMan.gotoAndStop(0);
    return;
  }
  player.moving = true;
  wolfMan.play();
  if (player.direction == MOVE_LEFT ) {
    wolfMan.textures = wolfFramesLeft;
    createjs.Tween.get(player).to({x: player.x - 32}, 200).call(move);
  }
  if (player.direction == MOVE_RIGHT){
    wolfMan.textures = wolfFramesRight;
    createjs.Tween.get(player).to({x: player.x + 32}, 200).call(move);
  }
  if (player.direction == MOVE_UP)
    createjs.Tween.get(player).to({y: player.y - 32}, 200).call(move);

  if (player.direction == MOVE_DOWN)
    createjs.Tween.get(player).to({y: player.y + 32}, 200).call(move);
}

// Keydown events start movement
window.addEventListener("keydown", function (e) {
  e.preventDefault();
  if (!player) return;
  if (player.moving) return;
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

  var wolf = world.getObject("wolf");
  wallMapArray = world.getObject("obstacles").data;

  wolfFramesRight = [];
  for(var i=1;i<=5;i++){
    wolfFramesRight.push(PIXI.Texture.fromFrame('wolfrev' + i + '.png'));
  }

  wolfFramesLeft = [];
  for(var i=1;i<=5;i++){
    wolfFramesLeft.push(PIXI.Texture.fromFrame('wolf' + i + '.png'));
  }

  wolfMan = new PIXI.extras.MovieClip(wolfFramesRight);
  wolfMan.animationSpeed = 0.2;

  wolfCorners = tu.getPoints(wolfMan);
  console.log(wolfCorners.bottomLeft);
  console.log(wolfCorners.bottomRight);
  console.log(wolfCorners.topLeft);
  console.log(wolfCorners.topRight);

  wolfMan.collisionArea = {x: wolfMan.x,y:wolfMan.y,width:10,height:10};

  var corners2 = tu.getPoints(wolfMan.collisionArea);
  console.log(corners2.topLeft);
  console.log(corners2.bottomLeft);

  player = wolfMan;
  player.x = wolf.x;
  player.y = wolf.y;
  player.anchor.x = 0.0;
  player.anchor.y = 1.0;

  // Find the entity layer
  var entity_layer = world.getObject("entities");
  entity_layer.addChild(player);

  player.direction = MOVE_NONE;
  player.moving = false;

  animate();
}

function testCollisions() {
  var collisiontest = tu.hitTestTile(wolfMan, wallMapArray, 0, world, 'every');
  if (!collisiontest.hit){
      console.log("hit");
  }
}

function animate(timestamp) {
  testCollisions();
  requestAnimationFrame(animate);
  update_camera();
  renderer.render(stage);
}

function update_camera() {
  stage.x = -player.x*GAME_SCALE + GAME_WIDTH/2 - player.width/2*GAME_SCALE;
  stage.y = -player.y*GAME_SCALE + GAME_HEIGHT/2 + player.height/2*GAME_SCALE;
  stage.x = -Math.max(0, Math.min(world.worldWidth*GAME_SCALE - GAME_WIDTH, -stage.x));
  stage.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -stage.y));
}
