// game character position
let gameChar_x;
let gameChar_y;

// field dimensions
let fieldX;
let fieldY;
let fieldW;
let fieldH;

// floor position
let floorPos_y;

// scrolling position
let scrollPos_x;

// game character position in the world
let gameChar_world_x;

// variables for user input
let isLeft;
let isRight;
let isShoot;

// game-related variables
let lives;
let boss;
let bossHitCount;
let shootingInterval;

// arrays for game elements
let enemies;
let enemyCoords;
let trees;
let flowers;
let mountains;
let bullets;

// shield variables
let shieldActive = false;
let shieldDuration = 3000; // shield duration in milliseconds
let shieldStartTime; 
let shieldX, shieldY; // shield position
let shieldCount = 3; // number of shields available

// game state variables
let gameStarted = false;  
let gameWon;  

// function to preload background image
function preload() {
  // Attempt to load the image
  backgroundImage = loadImage("Space Background.png") 
}

// function to set up the initial state of the game
function setup() {
  // to create a canvas with the size of the window
  createCanvas(windowWidth, windowHeight);
  
  // initialising game variables
  lives = 3; // player lives
  shieldCount = 3; // number of shields available
  bossHitCount = 50; // number of hits required to defeat boss

  // setting field dimensions
  fieldX = 0;
  fieldY = 50; 
  fieldW = windowWidth;
  fieldH = windowHeight - 100;

  // to start the game
  startGame();
}

function draw() {
  // background color
  background("black");

  // fill and stroke color for the elements
  fill('white');
  stroke('white');


  // update scroll position
  scrollPos_x += 5;

  // check if the game has started
  if (!gameStarted) {
    // to display the start screen before starting the game
    drawStartScreen();
  } else {
    // move the game character towards the right side of the canvas
    // until a fix point, at which the character can only move up and down
    if (gameChar_x < windowWidth * 0.15) {
      gameChar_x += 5;
    }
    
    // translate canvas to create parallax effect
    push();
    translate(-scrollPos_x, 0);
    // draw background images with parallax effect
    for (let i = 0; i < 50; i++) {
      image(backgroundImage, fieldX + i * fieldW, fieldY, fieldW, fieldH);
    }
    pop();

    // set speed for character movement
    let spd = 5;

    // move the character up if the left arrow key is pressed
    if (isLeft && gameChar_y > windowHeight * 0.15) {
      gameChar_y -= spd;
    }

    // move the character down if the right arrow key is pressed
    if (isRight && gameChar_y < windowHeight * 0.8) {
      gameChar_y += spd;
    }

    // draw the game character
    drawPlayableCharacter(gameChar_x, gameChar_y, 7);

    // draw player lives 
    for (let i = 0; i < lives; i++) {
      drawLives(20 + 45 * i, fieldY + 20, 5);
    }

    // check if the player has run out of lives 
    // if so, then game is over
    if (lives < 1) {
      gameOver();
      startGame();
      return;
    }

    // calculate and maintain game character's position in the world
    gameChar_world_x = gameChar_x - scrollPos_x;

    // iterate over bullets array and handle collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (bullets[i]) {
        if (bullets[i].x < windowWidth - 200) {
          bullets[i].move();
          bullets[i].display();
        }
    
        // check for collision with enemies and remove bullets and enemies accordingly
        for (let j = 0; j < enemies.length; j++) {
          if (enemies[j] && bullets[i].checkCollision(enemies[j])) {
            bullets.splice(i, 1);
            enemies.splice(j, 1);
            break;
          }
        }
    
        // check for collision with boss and reduce boss hit count
        if (boss && scrollPos_x >= 4200) {
          if (bullets[i].checkCollision(boss)) {
            bullets.splice(i, 1);
            bossHitCount--;
          }
        }
      }
    }

    // check if the boss hit count is zero and display the game won screen
    if (bossHitCount < 1) {
      gamewon = true;
      drawGameWonScreen();
      return;
    }

    // iterate over enemies array, move enemies, display them, and handle collisions
    for (let m = 0; m < enemies.length; m++) {
      if (enemies[m]) {
        enemies[m].move(gameChar_world_x, gameChar_y);
        enemies[m].display();
        enemies[m].shoot();

        // check for contact with player character and reduce lives if not shielded
        if (enemies[m].checkContact(gameChar_x + 117, gameChar_y + 25) && !shieldActive && lives != 0) {
          lives -= 1;
          startGame();
          break;
        }
      }
    }

    // create and display shield if active
    let shield = new drawShield(gameChar_x, gameChar_y, 7);
    shield.count();
    if (shieldActive && millis() - shieldStartTime < shieldDuration) {
      shield.display();
    } else {
      shieldActive = false; // deactivate the shield if the duration has elapsed
    }

    // draw platform background
    platformX = 0 - scrollPos_x;
    let bg = new drawPlatform();
    bg.platform(-scrollPos_x, fieldH + 10, windowWidth + scrollPos_x, 40);

    // draw trees, flowers, and mountains
    for (let i = 0; i < 40; i++) {
      stroke('white');
      bg.drawTree(trees[i]);
      bg.drawFlower(flowers[i]);
      bg.drawMountain(mountains[i]);
    }

    // display boss if scroll position reaches a certain point
    if (scrollPos_x >= 3500) {
      boss.display();
      boss.enter();
    }
    if (scrollPos_x >= 4200) {
      boss.shoot(); 
    }
  }
}

// function to draw the game start screen with the game play instructions 
function drawStartScreen() {
  push();
  translate(-scrollPos_x, 0);
  for (let i = 0; i < 100; i++) {
    image(backgroundImage, fieldX + i * fieldW, fieldY, fieldW, fieldH);
  }
  pop();

  textAlign(CENTER);
  textSize(100);
  fill('white');
  // the game title
  text("Space Impact Remake", width / 2, height / 2 - 150);
  textSize(20);
  // the instruction to start the game
  text("Press ENTER to Start", width / 2, height / 2 - 80);
  // the game play instructions 
  textSize(30);
  rect(width/2 - 150, height/2 + 35, 42, 35) // left key
  rect(width/2 - 150, height/2 + 100, 42, 35) // right key
  rect(width/2 - 210, height/2 + 165, 125, 35) // space key 
  fill('darkgrey')
  noStroke()
  // left square key shadow
  rect(width/2 - 110, height/2 + 35, 10, 45)
  rect(width/2 - 150, height/2 + 70, 42, 10)
  // right square key shadow
  rect(width/2 - 110, height/2 + 100, 10, 45)
  rect(width/2 - 150, height/2 + 135, 46, 10)
  // space key shadow
  rect(width/2 - 85, height/2 + 165, 10, 45)
  rect(width/2 - 210, height/2 + 200, 125, 10)
  fill('black')
  stroke('black')
  text("Space", width / 2 - 145, height / 2 + 190);
  text("←" , width / 2 - 130, height / 2 + 60);
  text("→", width / 2 - 130, height / 2 + 125);
  fill('white')
  stroke('white')
  text(" :    to shoot", width / 2 + 30, height / 2 + 195);
  text(" :    to move up" , width / 2 + 50, height / 2 + 60);
  text(" :    to move down", width / 2 + 70, height / 2 + 125);
}

let isShieldKeyPressed = false;

// function to handle key press events
function keyPressed() {
  // check if the left arrow key or 'A' key is pressed
  if (keyCode == 37 || keyCode == 65) {
    isLeft = true;
  }

  // check if the right arrow key or 'D' key is pressed
  if (keyCode == 39 || keyCode == 68) {
    isRight = true;
  }

  // check if the 'Space' key is pressed for shooting
  if (keyCode == 32) {
    isShoot = true;
    if (!shootingInterval) {
      shootBullet();
      // interval for continuous shooting
      shootingInterval = setInterval(shootBullet, 200);
    }
  }


  // check if the 'S' key is pressed to activate shield
  if (keyCode == 83 && !shieldActive && shieldCount > 0) {
    shieldActive = true;
    shieldStartTime = millis(); // record the time when the shield was activated
    // set the position of the shield relative to the character
    shieldX = gameChar_x; 
    shieldY = gameChar_y;
    // decrement shield count
    shieldCount--;
  }

  // check if the 'Enter' key is pressed to start or restart the game
  if (keyCode == 13) {
    // ff the game hasn't started yet, start the game
    if (!gameStarted) {
      gameStarted = true;
    }
    // if the game has ended or the player wants to restart, reset game state
    else if (lives < 1 || gamewon) {
      // reset player lives, shield count, and boss hit count
      lives = 3;
      shieldCount = 3;
      bossHitCount = 50;
      // start the game again
      startGame();
      return; // exit the function
    }
  }
}

// function to handle key release events
function keyReleased() {
  // check if the left arrow key or 'A' key is released
  if (keyCode == 37 || keyCode == 65) {
    isLeft = false;
  }
  // check if the right arrow key or 'D' key is released
  if (keyCode == 39 || keyCode == 68) {
    isRight = false;
  }
  // check if the 'Space' key is released
  if (keyCode == 32) {
    isShoot = false;
    // when spacebar is released, stop continuous shooting
    clearInterval(shootingInterval);
    shootingInterval = null; // reset shootingInterval variable
  }
  // check if the 'S' key is released
  if (keyCode == 83) {
    isShieldKeyPressed = false;
  }
}

// function to draw the game won screen
function drawGameWonScreen() {
  push();
  translate(-scrollPos_x, 0);
  for (let i = 0; i < 100; i++) {
    image(backgroundImage, fieldX + i * fieldW, fieldY, fieldW, fieldH);
  }
  pop();

  textAlign(CENTER, CENTER);
  textSize(100);
  fill('white');
  // the game won message
  text("You Won!", width / 2, height / 2 - 40);
  textSize(25);
  // the instruction to play again
  text("Press Enter to Play Again", width / 2, height / 2 + 40);
}

// function to draw the playable character
function drawPlayableCharacter(x, y, size) {
  // width and height of the sprite
  let w = size;
  let h = size;
  
  // loops to simplify the drawing process
  for (let i = 0; i <= 15; i++) {
    if ((i >= 1 && i <= 7) || (i >= 9 && i <= 15)) {
      rect(x + size * i, y + size * 4, w, h); 
      rect(x + size * i, y + size * 2, w, h);
    }

    if ((i == 1) || (i >= 4 && i <= 5) || (i >= 7 && i <= 10)) {
      rect(x + size * i, y + size * 5, w, h); // Draw arm segments
      rect(x + size * i, y + size, w, h);
    }

    if ((i == 0) || (i >= 3 && i <= 4) || (i >= 6 && i <= 8)) {
      rect(x + size * i, y + size * 6, w, h); // Draw neck and head segments
      rect(x + size * i, y, w, h);
    }

    if (i >= 0 && i <= 5) {
      rect(x + size * i, y - size, w, h); // Draw leg segments
      rect(x + size * i, y + size * 7, w, h);
    }

    if (i >= 2 && i <= 4) {
      rect(x + size * i, y - size * 2, w, h); 
      rect(x + size * i, y + size * 8, w, h);
    }
  }

  // additional details
  rect(x + size * 3, y - size * 3, w, h);
  rect(x + size * 3, y - size * 4, w, h);
  rect(x + size * 3, y + size * 9, w, h);
  rect(x + size * 3, y + size * 10, w, h);
}


// function to create bullets for the enemies to use
function enemyBullet(x, y, speed) {
  this.x = x;
  this.y = y;
  this.speed = speed;

  // update bullet position based on its speed
  this.update = function() {
    this.x -= this.speed;
  }

  // display the bullet on the canvas
  this.display = function() {
    rect(this.x, this.y, 50, 10); 
  }

  // check for collision between the bullet and the player
  this.checkCollision = function(x_pos, y_pos) {
    // calculate distance between bullet and player's position
    let distance = dist(this.x, this.y, x_pos, y_pos);
    // if distance is less than a threshold, collision occurrs, and the player is killed
    if (distance < 60) { 
      return true;
    }
    return false;
  }
}

// function to draw player lives
function drawLives(x, y, size) {
  // width and height of the object
  let w = size;
  let h = size;

  for (let i = 0; i < 13; i++) {
    if ((i >= 1 && i <= 2) || (i >= 4 && i <= 5)) {
      rect(x + size * i, y, w, h);
    }
    if (i >= 0 && i <= 6) {
      rect(x + size * i, y + size, w, h);
    }
    if (i >= 1 && i <= 5) {
      rect(x + size * i, y + size * 2, w, h);
    }
    if (i >= 2 && i <= 4) {
      rect(x + size * i, y + size * 3, w, h);
    }
  }
  // additional details
  rect(x + size * 3, y + size * 4, w, h);
}


// function to create bullets for the player
function shootBullet() {
  // new bullet objects at the position of the character
  let bullet = new Bullet(gameChar_x + 120, gameChar_y + 18);
  if (scrollPos_x <= 3500 || scrollPos_x >= 4000){
    bullets.push(bullet);
  }
}

// constructor for bullet objects
function Bullet(x, y) {
  this.x = x;
  this.y = y;
  let speed = 10; 

  // method to move the bullet
  this.move = function () {
    // move the bullet horizontally in the direction it was shot
    if (this.x < windowWidth - 50 && !gamewon) {
      this.x += speed;
    }
  };

  // method to display the bullet
  this.display = function () {
    rect(this.x, this.y, 55, 10);
  };

  // method to check collision with enemies or boss
  this.checkCollision = function (sprite) {
    // calculate distance between bullet and center of the enemy or boss
    let dx = this.x - (sprite.x + sprite.size / 2);
    let dy = this.y - (sprite.y + sprite.size / 2);
    let distance = sqrt(dx * dx + dy * dy);

    // if distance is less than a threshold, collision occurrs
    if (distance < 50 && sprite.x < windowWidth - 100) { 
      return true; // collision detected
    }

    // if the sprite is the boss, check if the bullet collides with the monster's body
    if (sprite == boss) {
      let bossTop = sprite.y - 80; 
      let bossBottom = sprite.y + 250; 
      let bossLeft = sprite.x;
      let bossRight = sprite.x + 10;

      if (this.y >= bossTop && this.y <= bossBottom && this.x >= bossLeft && this.x <= bossRight) {
        return true; // collision detected with boss
      }
    }

    return false; // no collision detected
  };
}

// function to draw an enemy ship
function drawEnemy(x, y, size) {
  // enemy object properties
  this.x = x;
  this.y = y;
  this.size = size;
  this.speed = 7;

  // function to move the enemy towards the game character
  this.move = function (gc_x, gc_y) {
    let dx = gc_x - (this.x + (this.size / 2));
    let dy = gc_y - (this.y + (this.size / 2));
    let distance = sqrt(dx * dx + dy * dy);

    // move the enemy towards the game character's position
    if (distance > 0) {
      let angle = atan2(dy, dx);
      let speedMultiplier = 1.5;

      // calculate velocity components based on angle and speed
      let vx = cos(angle) * this.speed * speedMultiplier;
      let vy = sin(angle) * this.speed * speedMultiplier * 2;

      // update enemy position
      this.x += vx;
      this.y += vy;
    }
  };

  // function to check for contact with the game character
  this.checkContact = function (gc_x, gc_y) {
    let d = dist(gc_x, gc_y, this.x + (this.size * 13), this.y);
    // check if the game character is within range for contact
    if (d < 70) {
      return true; // contact detected, the player dies
    } else {
      return false; // no contact
    }
  }

  // array to store enemy bullets
  let bul = [];

  // function to make the enemy shoot bullets
  this.shoot = function () {
    // shoot bullets periodically
    if (frameCount % 70 === 0) {
      // add a new enemy bullet to the bullets array
      bul.push(new enemyBullet(this.x - 60, this.y + 5, 13));
    }

    for (let i = bul.length - 1; i >= 0; i--) {
      // update and display bullets
      bul[i].update();  
      bul[i].display();  

      // check collision with player character
      if (bul[i].checkCollision(gameChar_x + 115, gameChar_y + 25) && !shieldActive) {
        lives -= 1; // decrease player lives
        startGame(); // reset game
        break; // exit loop 
      }

      // remove bullets if they go out of bounds
      if (bul[i].y > windowHeight || bul[i].x < 0) {
        bul.splice(i, 1); // remove bullet from array
      }
    }
  }

  // Function to display the enemy ship
  this.display = function () {
    for (let i = 0; i <= 26; i++) {
      if ((i >= 0 && i <= 10) || (i >= 15 && i <= 19)) {
        rect(this.x + (this.size * i), this.y, this.size, this.size);
      }

      if ((i >= 4 && i <= 6) || (i >= 16 && i <= 18) || (i >= 20 && i <= 23)) {
        rect(this.x + (this.size * i), this.y + this.size, this.size, this.size);
        rect(this.x + (this.size * i), this.y - this.size, this.size, this.size);
      }

      if ((i >= 5 && i <= 8) || (i >= 15 && i <= 17) || (i >= 20 && i <= 21)) {
        rect(this.x + (this.size * i), this.y + (this.size * 2), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 2), this.size, this.size);
      }

      if ((i >= 6 && i <= 11) || (i >= 14 && i <= 15) || (i >= 17 && i <= 19) || i == 21) {
        rect(this.x + (this.size * i), this.y + (this.size * 3), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 3), this.size, this.size);
      }

      if ((i == 7) || (i == 10) || (i >= 13 && i <= 14) || (i >= 18 && i <= 20)) {
        rect(this.x + (this.size * i), this.y + (this.size * 4), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 4), this.size, this.size);
      }

      if ((i >= 4 && i <= 9) || (i >= 11 && i <= 13) || (i >= 19 && i <= 24)) {
        rect(this.x + (this.size * i), this.y + (this.size * 5), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 5), this.size, this.size);
      }

      if ((i >= 6 && i <= 12) || (i >= 19 && i <= 23)) {
        rect(this.x + (this.size * i), this.y + (this.size * 6), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 6), this.size, this.size);
      }

      if ((i >= 9 && i <= 11) || (i >= 20 && i <= 21)) {
        rect(this.x + (this.size * i), this.y + (this.size * 7), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 7), this.size, this.size);
      }

      if ((i >= 10 && i <= 11) || i == 21) {
        rect(this.x + (this.size * i), this.y + (this.size * 8), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 8), this.size, this.size);
      }

      if (i == 11 || i == 21) {
        rect(this.x + (this.size * i), this.y + (this.size * 9), this.size, this.size);
        rect(this.x + (this.size * i), this.y - (this.size * 9), this.size, this.size);
      }
    }

    rect(this.x + (this.size * 11), this.y - (this.size * 10), this.size, this.size);
    rect(this.x + (this.size * 11), this.y + (this.size * 10), this.size, this.size);
  };
}

// constructor function for drawing a shield around the player
function drawShield(x, y, size) {
  this.x = x;
  this.y = y;
  this.size = size;

  // width and height of each shield element
  let w = size + size / 4;
  let h = size + size / 4;

  // function to display the shield
  this.display = function () {
    rect(this.x - this.size * 3, this.y - this.size * 1.2, w, h);
    rect(this.x - this.size * 0.2, this.y - this.size * 4, w, h);
    rect(this.x + this.size * 3, this.y - this.size * 6.6, w, h);
    rect(this.x + this.size * 5.8, this.y - this.size * 4, w, h);
    rect(this.x + this.size * 8, this.y - this.size * 2.5, w, h);
    rect(this.x + this.size * 11.5, this.y - this.size * 1.5, w, h);
    rect(this.x + this.size * 15, this.y - this.size * 0.2, w, h);
    rect(this.x + this.size * 17.3, this.y + this.size * 1.8, w, h);
    rect(this.x - this.size*2, this.y + this.size * 1.5, w, h);
    rect(this.x + this.size * 17.3, this.y + this.size * 4.2, w, h);
    rect(this.x - this.size*2, this.y + this.size * 4.5, w, h);
    rect(this.x - this.size * 3, this.y + this.size * 7, w, h);
    rect(this.x + this.size * 5.8, this.y + this.size * 10, w, h);
    rect(this.x + this.size * 8, this.y + this.size * 8, w, h);
    rect(this.x + this.size * 11.5, this.y + this.size * 7.5, w, h);
    rect(this.x + this.size * 15, this.y + this.size * 6, w, h);
    rect(this.x - this.size * 0.2, this.y + this.size * 9.5, w, h);
    rect(this.x + this.size * 3, this.y + this.size * 12.6, w, h);
  }

  // function to display the remaining shield count
  this.count = function () {
    textSize(30);
    text("SHIELDS: " + shieldCount, fieldX + 500, fieldY + 45);
  }
}

// constructor function for drawing various platform elements
function drawPlatform() {
  // function to draw a tree
  this.drawTree = function (x) {
    x -= scrollPos_x;
    let size = 6;
    let y = fieldH - (size * 15.5);
    let w = 6;
    let h = 6;

    for (let i = 0; i < 18; i++) {
      if (i >= 1 && i <= 16) {
        rect(x, y + (i * size), w, h);
      }

      if ((i >= 0 && i <= 1) || (i >= 5 && i <= 6) || (i >= 10 && i <= 11)) {
        rect(x + (size * 4), y + (size * i), w, h);
        rect(x - (size * 4), y + (size * i), w, h);
      }

      if ((i >= 1 && i <= 2) || (i >= 6 && i <= 7) || (i >= 11 && i <= 12)) {
        rect(x + (size * 3), y + (size * i), w, h);
        rect(x - (size * 3), y + (size * i), w, h);
      }

      if ((i >= 2 && i <= 3) || (i >= 7 && i <= 8) || (i >= 12 && i <= 13)) {
        rect(x + (size * 2), y + (size * i), w, h);
        rect(x - (size * 2), y + (size * i), w, h);
      }

      if ((i >= 3 && i <= 4) || (i >= 8 && i <= 9) || (i >= 13 && i <= 14)) {
        rect(x + (size * 1), y + (size * i), w, h);
        rect(x - (size * 1), y + (size * i), w, h);
      }
    }
  }

  // function to draw a flower
  this.drawFlower = function (x) {
    x -= scrollPos_x;
    let w = 4;
    let h = 4;
    let size = 4;
    let y = fieldH - (size * 6.7);

    for (let i = 0; i < 11; i++) {
      if (i >= 2 && i <= 8) {
        rect(x, y + (i * size), w, h);
      }

      if (i >= 2 && i <= 4) {
        rect(x + (size * 3), y + (i * size), w, h);
        rect(x - (size * 3), y + (i * size), w, h);
      }

      if (i >= 3 && i <= 5) {
        rect(x + (size * 2), y + (i * size), w, h);
        rect(x - (size * 2), y + (i * size), w, h);
      }

      if (i >= 4 && i <= 5) {
        rect(x + (size), y + (i * size), w, h);
        rect(x - (size), y + (i * size), w, h);
      }
    }

    rect(x + (size), y + (size * 7), w, h);
    rect(x - (size), y + (size * 7), w, h);
  }

  // function to draw mountains
  this.drawMountain = function(x){
    x-=scrollPos_x
    let size = 8;
    let w = 8;
    let h = 8;
    let y = fieldH+1;

    rect(x, y, w, h);
    rect(x, y-size, w, h);
    rect(x+size, y-size, w, h);
    rect(x+size, y-(size*2), w, h);
    rect(x+(size*2), y-(size*2), w, h);
    rect(x+(size*2), y-(size*3), w, h);
    rect(x+(size*3), y-(size*3), w, h);
    rect(x+(size*3), y-(size*4), w, h);
    rect(x+(size*4), y-(size*4), w, h);
    rect(x+(size*4), y-(size*5), w, h);
    rect(x+(size*4), y-(size*6), w, h);
    rect(x+(size*5), y-(size*6), w, h);
    rect(x+(size*5), y-(size*7), w, h);
    rect(x+(size*6), y-(size*7), w, h);
    rect(x+(size*7), y-(size*7), w, h);
    rect(x+(size*7), y-(size*6), w, h);
    rect(x+(size*7), y-(size*5), w, h);
    rect(x+(size*8), y-(size*5), w, h);
    rect(x+(size*9), y-(size*6), w, h);
    rect(x+(size*10), y-(size*6), w, h);
    rect(x+(size*10), y-(size*7), w, h);
    rect(x+(size*9), y-(size*7), w, h);
    rect(x+(size*8), y-(size*4), w, h);
    rect(x+(size*9), y-(size*4), w, h);
    rect(x+(size*9), y-(size*3), w, h);
    rect(x+(size*9), y-(size*5), w, h);
    rect(x+(size*10), y-(size*4), w, h);
    rect(x+(size*10), y-(size*3), w, h);
    rect(x+(size*10), y-(size*2), w, h);
    rect(x+(size*10), y-(size), w, h);
    rect(x+(size*11), y, w, h);
    rect(x+(size*12), y, w, h);
    rect(x+(size*12), y-(size), w, h);
    rect(x+(size*11), y-(size), w, h);
    rect(x+(size*11), y-(size*2), w, h);
    rect(x+(size*11), y-(size), w, h);
    rect(x+(size*10), y-(size*8), w, h);
    rect(x+(size*11), y-(size*8), w, h);
    rect(x+(size*11), y-(size*9), w, h);
    rect(x+(size*11), y-(size*10), w, h);
    rect(x+(size*12), y-(size*9), w, h);
    rect(x+(size*12), y-(size*10), w, h);
    rect(x+(size*13), y-(size*10), w, h);
    rect(x+(size*14), y-(size*10), w, h);
    rect(x+(size*12), y-(size*11), w, h);
    rect(x+(size*13), y-(size*11), w, h);
    rect(x+(size*14), y-(size*9), w, h);
    rect(x+(size*14), y-(size*8), w, h);
    rect(x+(size*15), y-(size*8), w, h);
    rect(x+(size*15), y-(size*7), w, h);
    rect(x+(size*15), y-(size*6), w, h);
    rect(x+(size*16), y-(size*6), w, h);
    rect(x+(size*16), y-(size*5), w, h);
    rect(x+(size*17), y-(size*5), w, h);
    rect(x+(size*17), y-(size*4), w, h);
    rect(x+(size*18), y-(size*4), w, h);
    rect(x+(size*18), y-(size*3), w, h);
    rect(x+(size*19), y-(size*3), w, h);
    rect(x+(size*19), y-(size*2), w, h);
    rect(x+(size*20), y-(size*2), w, h);
    rect(x+(size*20), y-(size), w, h);
    rect(x+(size*21), y-(size), w, h);
    rect(x+(size*20), y, w, h);
    rect(x+(size*22), y, w, h);
    rect(x+(size*21), y, w, h);
  }

   // function to draw a platform
   this.platform = function (x, y, w, h) {
    noStroke();
    rect(x, y, w, h);
  }
}

// function to write pixelated game over phrase
function gameOver() {
  let x = windowWidth / 2;
  let y = windowHeight / 3.5;
  let size = 20;

  // letter G
  rect(x, y, size * 4, size);
  rect(x - size, y + size, size, size * 4);
  rect(x, y + size * 5, size * 4, size);
  rect(x + size * 3, y + size * 3, size, size * 3);
  rect(x + size, y + size * 3, size * 2, size);

  // letter A
  rect(x + 110, y + size, size, size * 5);
  rect(x + 110 + size, y, size * 4, size);
  rect(x + 110 + size * 4, y + size, size, size * 5);
  rect(x + 110 + size, y + size * 3, size * 4, size);

  // letter M
  rect(x + 240, y, size, size * 6);
  rect(x + 240 + size * 2, y + size * 2, size, size);
  rect(x + 240 + size, y + size, size, size);
  rect(x + 240 + size * 3, y + size * 3, size, size);
  rect(x + 240 + size * 4, y + size * 2, size, size);
  rect(x + 240 + size * 5, y + size, size, size);
  rect(x + 240 + size * 6, y, size, size * 6);

  // letter E
  rect(x + 410, y, size + size * 4, size);
  rect(x + 410, y + size * 5, size + size * 4, size);
  rect(x + 410, y + size * 3, size + size * 4, size);
  rect(x + 410, y, size, size + size * 4);

  y = y + size * 8;

  // letter O
  rect(x - size, y, size + size * 3, size);
  rect(x - size, y, size, size + size * 4);
  rect(x, y + size * 5, size + size * 3, size);
  rect(x + size * 3, y + size, size, size + size * 4);

  // letter V
  rect(x + 110, y, size, size + size * 2);
  rect(x + 110 + size, y + size * 2, size, size);
  rect(x + 110 + size, y + size * 4, size + size * 2, size);
  rect(x + 110 + size, y + size * 3, size, size);
  rect(x + 110 + size * 3, y + size * 3, size, size);
  rect(x + 110 + size * 3, y + size * 2, size + size, size);
  rect(x + 110 + size * 4, y, size, size + size * 2);
  rect(x + 110 + size * 2, y + size * 5, size, size);

  // letter E
  rect(x + 255, y, size + size * 4, size);
  rect(x + 255, y + size * 5, size + size * 4, size);
  rect(x + 255, y + size * 3, size + size * 4, size);
  rect(x + 255, y, size, size + size * 4);

  // letter R
  rect(x + 410, y, size, size + size * 5);
  rect(x + 410, y, size + size * 3, size);
  rect(x + 410, y + size * 3, size + size * 4, size);
  rect(x + 410 + size * 4, y + size, size, size + size * 2);
  rect(x + 410 + size * 3, y + size * 4, size, size);
  rect(x + 410 + size * 4, y + size * 5, size, size);

  // instruction for restarting the game
  fill('white');
  textSize(25);
  text('Press ENTER to restart', x + 130, y + 180);
}

function finalBoss(x, y) {
  this.x = x;
  this.y = y;
  let w = 9;
  let h = 9;
  let size = 9;

  noStroke();

  // display function to draw the final boss
  this.display = function(){
    rect(this.x, this.y,w,h)
    rect(this.x, this.y-size,w+size*3,h)
    rect(this.x+size, this.y,w,h)
    rect(this.x+size, this.y-size*2,w,h)
    rect(this.x+size*2, this.y-size*3,w+size,h)
    rect(this.x+size*4, this.y-size*2,w+size,h)
    rect(this.x+size*6, this.y-size,w+size*4,h)
    rect(this.x+size*11, this.y-size*2,w+size,h)
    rect(this.x+size*12, this.y-size*3,w+size,h)
    rect(this.x+size*13, this.y-size*4,w+size*2,h)
    rect(this.x+size*15, this.y-size*5,w+size*4,h)
    rect(this.x+size*17, this.y-size*6,w+size,h)

    for (let i = 20; i < 35; i++){
      if (i>=21 && i<= 23){
        rect(this.x+size*i, this.y+size*(i-29), w, h);
      }

      if (i>=24 && i<= 29){
        rect(this.x+size*i, this.y+size*(i-30), w, h);
      }

      if (i>=27 && i<= 29){
        rect(this.x+size*i, this.y+size*(i-31), w, h);
      }

      if(i <= 27){
        rect(this.x+size*i, this.y+size*(i-24), w, h);
      }

      if (i <= 30){
        rect(this.x+size*i, this.y+size*(i-26), w, h);
      }
      
      if(i >= 26 && i <= 30){
        rect(this.x+size*(i), this.y+size*(i-28), w, h);
      }
    }
    
    rect(this.x+size*4, this.y-size*4,w+size*4,h)
    rect(this.x+size*7, this.y-size*5,w,h)
    rect(this.x+size*6, this.y-size*6,w,h)
    rect(this.x+size*5, this.y-size*7,w+size*4,h)
    rect(this.x+size*4, this.y-size*8,w+size,h)
    rect(this.x+size*9, this.y-size*5,w+size*2,h)
    rect(this.x+size*10, this.y-size*6,w+size*2,h)
    rect(this.x+size*13, this.y-size*7,w,h)
    rect(this.x+size*14, this.y-size*8,w+size,h)
    rect(this.x+size*16, this.y-size*9,w+size*4,h)
    rect(this.x+size*22, this.y-size*9,w,h)
    rect(this.x+size*23, this.y-size*10,w+size,h)
    rect(this.x+size*25, this.y-size*11,w+size,h)
    rect(this.x+size*27, this.y-size*12,w+size*4,h)
    rect(this.x+size*24, this.y-size*7,w+size*3,h)
    rect(this.x+size*26, this.y-size*8,w+size*5,h)
    rect(this.x+size*31, this.y-size*7,w+size,h)
    rect(this.x+size*32, this.y-size*6,w+size*2,h)
    rect(this.x+size*32, this.y-size*5,w+size,h)
    rect(this.x+size*35, this.y-size*5,w,h)
    rect(this.x+size*37, this.y-size*5,w,h)
    rect(this.x+size*36, this.y-size*4,w,h)
    rect(this.x+size*35, this.y-size*3,w,h)
    rect(this.x+size*37, this.y-size*3,w,h)
    rect(this.x+size*34, this.y-size*4,w,h+size*4)
    rect(this.x+size*33, this.y-size,w,h+size*2)
    rect(this.x+size*32, this.y-size*4,w,h+size)
    rect(this.x+size*31, this.y-size*4,w,h+size*2)
    rect(this.x+size*32, this.y,w,h+size*2)
    rect(this.x+size*31, this.y+size,w,h+size*4)
    rect(this.x+size*35, this.y+size*2,w+size,h)
    rect(this.x+size*33, this.y+size*3,w+size*3,h)
    rect(this.x+size*32, this.y+size*4,w+size*3,h)
    rect(this.x+size*36, this.y-size*2,w,h+size*3)
    rect(this.x+size*37, this.y,w,h+size)
    ///////
    rect(this.x+size*28, this.y-size*9,w+size*2,h)
    rect(this.x+size*30, this.y-size*8,w,h+size*2)
    rect(this.x+size*28, this.y-size*5,w+size,h)
    rect(this.x+size*30, this.y-size*3,w,h+size)
    rect(this.x+size*23, this.y,w,h+size*3)
    rect(this.x+size*24, this.y,w,h+size*2)
    rect(this.x+size*25, this.y+size,w,h+size*2)
    rect(this.x+size*30, this.y,w,h+size*2)
    rect(this.x+size*26, this.y+size*3,w,h)
    rect(this.x+size*28, this.y+size*4,w,h+size*6)
    rect(this.x+size*29, this.y+size*6,w,h+size*3)
    rect(this.x+size*27, this.y+size*10,w,h)
    rect(this.x+size*27, this.y+size*11,w,h+size)
    rect(this.x+size*25, this.y+size*11,w+size,h)
    rect(this.x+size*25, this.y+size*12,w,h)
    rect(this.x+size*26, this.y+size*13,w,h)
    rect(this.x+size*24, this.y+size*12,w,h+size*2)
    rect(this.x+size*23, this.y+size*14,w+size*2,h)
    rect(this.x+size*21, this.y+size*13,w+size,h)
    ////////
    rect(this.x+size*12, this.y+size*3,w,h+size*4)
    rect(this.x+size*9, this.y+size*3,w+size*2,h)
    rect(this.x+size*6, this.y+size*12,w+size*11,h)
    rect(this.x+size*10, this.y+size*5,w+size*3,h)
    rect(this.x+size*7, this.y+size*5,w+size,h)
    rect(this.x+size*8, this.y+size*4,w+size,h)
    rect(this.x+size*7, this.y+size*3,w,h)
    rect(this.x+size*7, this.y+size*7,w,h)
    rect(this.x+size*8, this.y+size*6,w+size*7,h)
    rect(this.x+size*10, this.y+size*7,w+size,h)
    rect(this.x+size*13, this.y+size*4,w+size,h)
    ////////
    rect(this.x+size*20, this.y+size*12,w,h)
    rect(this.x+size*19, this.y+size*11,w,h)
    rect(this.x+size*12, this.y+size*10,w+size*6,h)
    rect(this.x+size*11, this.y+size*9,w,h+size*3)
    rect(this.x+size*7, this.y+size*9,w+size*4,h)
    rect(this.x+size*6, this.y+size*12,w+size*11,h)
    rect(this.x+size*8, this.y+size*11,w+size*2,h)
    rect(this.x+size*9, this.y+size*10,w,h)
    rect(this.x+size*5, this.y+size*11,w+size,h)
    rect(this.x+size*6, this.y+size*10,w+size,h)
    rect(this.x+size*5, this.y+size*9,w,h)
    rect(this.x+size*5, this.y+size*13,w,h)
    rect(this.x+size*7, this.y+size*13,w+size*3,h)
    rect(this.x+size*18, this.y+size*13,w,h)
    rect(this.x+size*19, this.y+size*14,w,h)
    rect(this.x+size*20, this.y+size*15,w+size,h)
    rect(this.x+size*22, this.y+size*16,w,h+size)
    rect(this.x+size*23, this.y+size*17,w+size*5,h)
    rect(this.x+size*29, this.y+size*18,w,h)
    rect(this.x+size*29, this.y+size*16,w+size,h)
    rect(this.x+size*30, this.y+size*17,w,h)
    rect(this.x+size*16, this.y+size*5,w+size,h)
    rect(this.x+size*15, this.y+size*3,w+size*2,h)
    rect(this.x+size*18, this.y+size*4,w,h)
    rect(this.x+size*18, this.y+size*2,w,h)
    rect(this.x+size*19, this.y+size,w+size*3,h)
    rect(this.x+size*19, this.y+size*3,w+size*3,h)
    rect(this.x+size*22, this.y+size*4,w,h)
    rect(this.x+size*21, this.y+size*5,w,h+size*4)
    rect(this.x+size*22, this.y+size*10,w,h)
    rect(this.x+size*23, this.y+size*11,w,h)
    rect(this.x+size*23, this.y+size*8,w+size*3,h)
    rect(this.x+size*23, this.y+size*7,w,h)
    rect(this.x+size*25, this.y+size*7,w+size,h)
    rect(this.x+size*24, this.y+size*6,w+size,h)
    rect(this.x+size*24, this.y+size*9,w+size,h)
    ///////
    rect(this.x+size*32, this.y-size*11,w+size,h)
    rect(this.x+size*34, this.y-size*10,w+size,h)
    rect(this.x+size*36, this.y-size*9,w,h)
    rect(this.x+size*37, this.y-size*8,w,h)
    ///////
    rect(this.x+size*32, this.y+size*5,w,h+size*2)
    rect(this.x+size*33, this.y+size*6,w,h+size)
    rect(this.x+size*34, this.y+size*7,w,h)
    rect(this.x+size*35, this.y+size*7,w,h+size*2)
    rect(this.x+size*36, this.y+size*6,w,h+size)
    rect(this.x+size*37, this.y+size*5,w,h+size*2)
    ///////
    rect(this.x+size*37, this.y+size*10,w,h+size*2)
    rect(this.x+size*36, this.y+size*10,w,h+size)
    rect(this.x+size*34, this.y+size*10,w,h+size*3)
    rect(this.x+size*33, this.y+size*13,w,h+size)
    rect(this.x+size*32, this.y+size*14,w,h+size)
    rect(this.x+size*31, this.y+size*15,w,h+size)
    rect(this.x+size*36, this.y+size*14,w,h+size)
    rect(this.x+size*37, this.y+size*15,w,h+size)

    for (let i = 0; i < 40; i++){
      if (i>=26 && i<= 29){
        rect(this.x+size*(i+5), this.y-size*(i-44), w, h);
      }

      if (i>=23 && i<= 25){
        rect(this.x+size*(i+5), this.y-size*(i-47), w, h);
      }

      if (i>=21 && i<= 23){
        rect(this.x+size*(i+5), this.y-size*(i-45), w, h);
      }
      
      if (i>=19 && i<= 21){
        rect(this.x+size*(i+5), this.y-size*(i-43), w, h);
      }

      if (i>=17 && i<= 18){
        rect(this.x+size*(i+5), this.y-size*(i-41), w, h);
      }

      if (i>=15 && i<= 16){
        rect(this.x+size*(i+5), this.y-size*(i-39), w, h);
      }

      if (i>=12 && i<=14){
        rect(this.x+size*(i+5), this.y-size*(i-37), w, h);
      }

      if (i>=25 && i<= 28){
        rect(this.x+size*(i+5), this.y-size*(i-49), w, h);
      }

      if (i>=28 && i<= 32){
        rect(this.x+size*(i+5), this.y-size*(i-51), w, h);
      }

      if (i>=30 && i<= 32){
        rect(this.x+size*(i+5), this.y-size*(i-53), w, h);
      }

      if (i>=11 && i<= 13){
        rect(this.x+size*(i+5), this.y+size*(i+9), w, h);
      }

      if (i>=9 && i<= 12){
        rect(this.x+size*(i+5), this.y+size*(i+11), w, h);
      }

    }

    rect(this.x+size*10, this.y+size*23,w+size*6,h)
    rect(this.x+size*6, this.y+size*25,w+size*3,h)
    rect(this.x+size*6, this.y+size*23,w+size,h)
    rect(this.x+size*8, this.y+size*22,w,h)
    rect(this.x+size*9, this.y+size*21,w,h)
    rect(this.x+size*10, this.y+size*20,w,h)
    rect(this.x+size*11, this.y+size*19,w+size,h)
    rect(this.x+size*13, this.y+size*18,w+size*4,h)
    rect(this.x+size*18, this.y+size*19,w+size,h)
    rect(this.x+size*20, this.y+size*20,w+size,h)
    rect(this.x+size*22, this.y+size*19,w,h)
    rect(this.x+size*23, this.y+size*18,w,h)
    rect(this.x+size*25, this.y+size*18,w,h)
    rect(this.x+size*27, this.y+size*18,w,h)
    rect(this.x+size*24, this.y+size*19,w,h)
    rect(this.x+size*26, this.y+size*19,w,h)
    rect(this.x+size*28, this.y+size*19,w,h)
    rect(this.x+size*23, this.y+size*20,w,h)
    rect(this.x+size*35, this.y+size*19,w,h)
    rect(this.x+size*9, this.y+size*24,w+size*2,h)
    rect(this.x+size*13, this.y+size*21,w,h)
    rect(this.x+size*11, this.y+size*22,w+size*5,h)
    rect(this.x+size*16, this.y+size*24,w+size,h)
    rect(this.x+size*18, this.y+size*25,w+size*14,h)
    rect(this.x+size*31, this.y+size*24,w+size*6,h)
    // fill('red')
    rect(this.x+size*34, this.y+size*23,w,h)
    rect(this.x+size*37, this.y+size*23,w,h+size*2)
    rect(this.x+size*36, this.y+size*25,w,h)
  }

  // function to make the boss move
  this.enter = function () {
    // move diagonally towards the bottom-right
    if (this.y <= windowHeight / 3 && this.x > windowWidth - (windowWidth / 3)) {
      this.x -= 8;
      this.y += 3;
    }

    // move vertically up and down
    if (this.y < windowHeight - 300 && !this.movingUp) {
      this.y += 2;
    } else {
      this.movingUp = true;
      this.y -= 2;
      
      // if at the top of the bounds, switch direction
      if (this.y <= 180) {
        this.movingUp = false;
      }
    }
  };

  // array to store bullets
  let b = [];

  // function to make the boss shoot
  this.shoot = function () {
    if (frameCount % 60 === 0) {
      // add a new enemy bullet to the bullets array
      b.push(new enemyBullet(this.x - 60, this.y + 5, 15));
    }
    if (frameCount % 90 === 0) {
      b.push(new enemyBullet(this.x - 60, this.y + 150, 15));
    }

    for (let i = b.length - 1; i >= 0; i--) {
      // update and display bullets
      b[i].update();
      b[i].display();

      // check collision with player character
      if (b[i].checkCollision(gameChar_x + 115, gameChar_y + 25) && shieldActive == false) {
        lives -= 1; // decrease player lives
        startGame(); // reset game
        break; // exit loop
      }

      // remove bullets if they go out of bounds
      if (b[i].y > windowHeight || b[i].x < 0) {
        b.splice(i, 1); // remove bullet from array
      }
    }
  };
}


function startGame() {
  enemies = []; // array to store enemy objects
  enemyCoords = []; // array to store enemy coordinates
  bullets = []; // array to store bullets

  trees = []; // array to store tree positions
  flowers = []; // array to store flower positions
  mountains = []; // array to store mountain positions

  // reset game character position
  gameChar_x = -200;
  gameChar_y = ((windowHeight / 7) + (windowHeight - (windowHeight / 7) * 2)) / 2;

  // reset background scroll position
  scrollPos_x = 0;

  // reset game character movement variables
  isLeft = false;
  isRight = false;
  gamewon = false;

  // number of additional enemies to add
  let numAdditionalEnemies = 10; 
  
  // loop to add additional enemies
  for (let i = 0; i < numAdditionalEnemies; i++) {
    let newXPos = windowWidth + (i + 1) * 500; 
    
    // generate a random y_pos value within a range
    let newYPos = random(fieldY, fieldY + fieldH - 400) * 2;
    
    // push a new object with the calculated x_pos and y_pos values into enemyCoords
    enemyCoords.push({
      x_pos: newXPos,
      y_pos: newYPos
    });
  }

  // create new enemy objects based on the generated coordinates
  for (let i = 0; i < numAdditionalEnemies; i++) {
    enemies.push(new drawEnemy(enemyCoords[i].x_pos, enemyCoords[i].y_pos, 5));
  }

  // generate tree, flower, and mountain positions
  for (let i = 0; i < 40; i++) {
    trees.push(320 + i * 650); // tree positions
    flowers.push(270 + i * 650); // flower positions
    flowers.push(30 + i * 650);  
    mountains.push(60 + i * 650); // mountain positions
  }

  // the final boss object
  boss = new finalBoss(windowWidth + 50, 90);
}


