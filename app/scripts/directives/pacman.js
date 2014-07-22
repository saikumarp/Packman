// author: saikumar start: 23-03-2014:
App.directive('pacmanGame', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var $parent          = element.parent()[0],
          $doc              = element[0].ownerDocument,
          ctx              = element[0].getContext('2d'),
          radius           = 25,
          x                = radius,
          y                = radius,
          startAngle       = 315,
          endAngle         = 45,
          anticlockwise    = true,
          selfX            = null,
          selfY            = null,
          parentWidth      = $parent.clientWidth,
          parentHeight     = $parent.clientHeight,
          speed            = 50,
          arrRandom        = [],
          arrRandomX       = [],
          arrRandomY       = [],
          foodRadius       = 8, 
          score            = 0,
          noFoods          = 15,
          pacmangr         = null,
          foodgr           = null,
          enemies          = [],
          enemiesSpeed     = 5,
          handled          = false,
          choices          = 3,
          keydown          = false,
          randomDirection  = ['left', 'right', 'top', 'bottom'];
          currentDirection = 'forward';

      element[0].width = parentWidth;
      element[0].height = parentHeight;

      //  pacman drawed in init function.
      //  arc syntax :-  ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      //  Note:  stratAngle, endAngle taken radians Values.(1 radiant = pi/180 * 1 degree )

      // initializing pacman.
      init();

      window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
      })();

      function init() {
        // random foods 
        arrRandomX = generateRandom(noFoods, parentWidth-100);
        arrRandomY = generateRandom(noFoods, parentHeight-100);

        // create pacmanEnemies Objects.
        enemies[1] = new pacmanEnemy(150, 150, 'right');
        enemies[2] = new pacmanEnemy(parentWidth - 150, 150, 'left');
        enemies[3] = new pacmanEnemy(150, parentHeight, 'top');
        enemies[4] = new pacmanEnemy(parentWidth - 150, parentHeight - 150, 'bottom');
        enemies[5] = new pacmanEnemy(200, parentHeight, 'top');
        enemies[6] = new pacmanEnemy(parentWidth - 200, parentHeight - 200, 'bottom');
        // enemies[7] = new pacmanEnemy(200, 200, 'right');
        // enemies[8] = new pacmanEnemy(parentWidth - 200, 200, 'left');
        
        setFood();

        // update : Enemies position and direction)
        updateEnemies();
        updateDirections();
      }


      $doc.addEventListener('keydown', function(event) {

        if(event.keyCode === 39/*rightArrow*/) {
          if(currentDirection !== 'forward') {
            startAngle = 315;
            endAngle = 45;
          }
          currentDirection = 'forward';
          keydown = true;
          setDirection(currentDirection);
        } else if(event.keyCode === 37 /*leftArrow*/) {
          if(currentDirection !== 'backward') {
            startAngle = 135;
            endAngle = 225;
          }
          currentDirection = 'backward';
          keydown = true;
          setDirection(currentDirection);
        } else if(event.keyCode === 38 /*upArrow*/) {
          if(currentDirection !== 'upward') {
            startAngle = 225;
            endAngle = 315;
          }
          currentDirection = 'upward';
          keydown = true;
          setDirection(currentDirection);
        } else if(event.keyCode === 40 /*downArrow*/) {
          if(currentDirection !== 'downward') {
            startAngle = 45;
            endAngle = 135;
          }
          currentDirection = 'downward';
          keydown = true;
          setDirection(currentDirection);
        }
      });


      function setDirection(direction) {
        if(keydown) {
          window.requestAnimFrame(setDirection);

          if(direction === 'forward') {
            startAngle = startAngle === 315 ? 340 : 315;
            endAngle = endAngle === 45 ? 25 : 45;
            x = x + speed;
            
            // cross boundaries.
            if(x > parentWidth){
              x = x - speed; 
            } 
          } else if(direction === 'backward') {
            startAngle = startAngle === 135 ? 160 : 135;
            endAngle = endAngle === 225 ? 200 : 225;
            x = x - speed;

            // cross boundaries.
            if(x <= 0) {
              x = x + speed;
            } 
          } else if(direction === 'upward') {
            startAngle = startAngle === 225 ? 250 : 225;
            endAngle = endAngle === 315 ? 290 : 315;
            y = y - speed;

            // cross boundaries.
            if(y <= 0) {
              y = y + speed;
            }
          } else if(direction === 'downward') {
            startAngle = startAngle === 45 ? 70 : 45;
            endAngle = endAngle === 135 ? 110 : 135;
            y = y + speed;

            //cross boundaries.
            if(y > parentHeight) {
              y = y - speed;
            } 
          }

          keydown = false;
          setFood();
        }
      }

      function setFood() {
        ctx.clearRect(0, 0, parentWidth, parentHeight);

        for(var i = 0; i < arrRandom.length; i++) {
          foodX = arrRandomX[i];
          foodY = arrRandomY[i];
          ctx.beginPath();

          // gradient object for foods.
          foodgr = ctx.createRadialGradient(foodX, foodY, foodRadius/2, foodX, foodY, foodRadius);
          foodgr.addColorStop(0, 'rgb(255, 255, 255)');
          foodgr.addColorStop(.5, 'rgb(100, 100, 100)');
          foodgr.addColorStop(1, 'rgb(0, 0, 10)'); 

          ctx.fillStyle = foodgr;
          ctx.arc(foodX, foodY, foodRadius, 0, 2*Math.PI);
          ctx.fill();
          ctx.closePath();
          if((( foodX >= x && foodX <= (x + radius)) && (foodY <= y && foodY >= (y - radius) ))
          || (( foodX <= x && foodX >= (x - radius)) && (foodY <= y && foodY >= (y - radius) ))
          || (( foodX <= x && foodX >= (x - radius)) && (foodY >= y && foodY <= (y + radius) ))
          || (( foodX >= x && foodX <= (x + radius)) && (foodY >= y && foodY <= (y + radius) ))
          ) {
            arrRandomX.splice(i, 1);
            arrRandomY.splice(i, 1);
            score ++;
            break;
          }
        }

        for(var e = 1; e <= enemies.length; e++) {
          if(enemies[e])
          enemies[e].draw();
        }

        ctx.beginPath();

        // create gradient object for pacman.
        pacmangr = ctx.createRadialGradient(x, y,radius/2 ,x , y, radius);
        pacmangr.addColorStop(0, 'rgb(0, 0, 0)');
        pacmangr.addColorStop(.5, 'rgb(200, 200, 255)');
        pacmangr.addColorStop(1, 'rgb(0, 0, 0)');

        ctx.fillStyle = pacmangr;
        ctx.arc(x, y, radius, (Math.PI / 180) * startAngle, (Math.PI / 180) * endAngle, anticlockwise);
        ctx.lineTo(x, y);
        if(choices > 0 || score == noFoods) {
          ctx.fill();
        }
        ctx.closePath();
        ctx.fillStyle = "#FF0000";
        ctx.font = "40px sans-serif";
        if(score == noFoods) {
          ctx.fillText ("congrats... You win" , parentWidth / 2, parentHeight / 2);
        } else if(choices > 0){
          ctx.fillText ("your score..." + score, parentWidth / 2, parentHeight / 2);
        } else {
          ctx.fillText ("sorry your choices over...........",parentWidth / 2, parentHeight / 2);
        }
      }

      function updateEnemies() {
        for(var f = 1; f <= enemies.length; f++) {
          if(enemies[f])  {
            if(enemies[f].direction === 'left') {
              enemies[f].eX = enemies[f].eX - enemiesSpeed;

              if(enemies[f].eX < 20) {
                enemies[f].direction = randomDirection[Math.floor(Math.random() * 4)]; 
              }
            } else if(enemies[f].direction === 'right') {
              enemies[f].eX = enemies[f].eX + enemiesSpeed;

              if(enemies[f].eX >= parentWidth - 20) {
                enemies[f].direction = randomDirection[Math.floor(Math.random() * 4)]; 
              }
            } else if(enemies[f].direction === 'top') {
              enemies[f].eY = enemies[f].eY - enemiesSpeed;
              if(enemies[f].eY < 20) {
                enemies[f].direction = randomDirection[Math.floor(Math.random() * 4)]; 
              }
            } else if(enemies[f].direction === 'bottom') {
              enemies[f].eY = enemies[f].eY + enemiesSpeed;
              if(enemies[f].eY >= parentHeight - 20) {
                enemies[f].direction = randomDirection[Math.floor(Math.random() * 4)]; 
              }
            }

            if(!handled || score == noFoods) {
              checkpacmanPosition(enemies[f]);
            }
          }
        }
        setFood();
        if(window.requestAnimFrame) {
          window.requestAnimFrame(updateEnemies);
        } else {
          setTimeout(updateEnemies, 50);
        }
      }

      function updateDirections() {
        for(var e = 1; e <= enemies.length; e++) {
          if(enemies[e]) {
            enemies[e].direction = randomDirection[Math.floor(Math.random() * 4)];
          }
        }
        setTimeout(updateDirections, 3000);
      }


      function checkpacmanPosition(enemy) {
        if((( enemy.eX >= x && enemy.eX   <= (x + radius)) && (enemy.eY <= y && enemy.eY >= (y - radius) ))
          || (( enemy.eX <= x && enemy.eX >= (x - radius)) && (enemy.eY <= y && enemy.eY >= (y - radius) ))
          || (( enemy.eX <= x && enemy.eX >= (x - radius)) && (enemy.eY >= y && enemy.eY <= (y + radius) ))
          || (( enemy.eX >= x && enemy.eX <= (x + radius)) && (enemy.eY >= y && enemy.eY <= (y + radius) ))
        ) {
          choices--; 
          anticlockwise = false;
          handled = true;
          window.setTimeout(function() {
            if(choices > 0) {
              anticlockwise = true;
              handled = false;
            }
          }, 1000);
        }
      }


      function pacmanEnemy(px, py, stratdirection) {
        /* 
        -----according to following commented code i created pacmanEnemy, because i undertood that much only........

        ---- unfortunately i could'nt get bezierCurveTo() concept in canvas, that's why i used quadraticCurveTo()
              luckily it's usefull to my game.
        ---- 29-03-2014 : all the day i worked for creating this object only.
        // ctx.beginPath();
        // ctx.moveTo(20,40);
        // ctx.lineTo(20,30);
        // ctx.quadraticCurveTo(20,20,30,20);
        // ctx.quadraticCurveTo(40,20,40,30);
        // ctx.lineTo(40,40);
        // ctx.lineTo(35,35);
        // ctx.lineTo(30,40);
        // ctx.lineTo(25,35);
        // ctx.fill();*/
        this.eX = px;
        this.eY = py;
        this.direction = stratdirection;
        this.tail = false;
        this.draw = function() {
          /* shape of my pacmanEnemy. this.tail is used for enemy moves.*/
          ctx.beginPath();
          ctx.fillStyle = "green";
          ctx.moveTo(this.eX, this.eY);
          ctx.lineTo(this.eX, this.eY - 10);
          ctx.quadraticCurveTo(this.eX, this.eY - 20, this.eX + 10, this.eY - 20);
          ctx.quadraticCurveTo(this.eX + 20, this.eY - 20, this.eX + 20, this.eY - 10);
          ctx.lineTo(this.eX + 20, this.eY);
          ctx.lineTo(this.eX + 15, this.eY - 5);
          this.tail = !this.tail; /* you can observe bottom is moved. */
          ctx.lineTo(this.eX + 10, this.tail ? this.eY - 5 : this.eY);
          ctx.lineTo(this.eX + 5, this.eY - 5);
          ctx.fill();
          ctx.closePath();

          /* first white circle in my packmanEnemy*/
          ctx.beginPath();
          ctx.fillStyle = 'white';
          ctx.arc(this.eX + 5, this.eY -10, 3, 0, (Math.PI/180) * 360, true)
          ctx.fill();
          ctx.closePath();
          
          /* inner circle of first whiteCircle, (eye) */
          ctx.beginPath();
          ctx.fillStyle = 'black';
          ctx.arc(this.eX + 5, this.eY -10, this.tail ? 2 : 1, 0, (Math.PI/180) * 360, true)
          ctx.fill();
          ctx.closePath();
          
          /* second white circle in my packmanEnemy*/
          ctx.beginPath();
          ctx.fillStyle = 'white';
          ctx.arc(this.eX + 15, this.eY -10, 3, 0, (Math.PI/180) * 360, true)
          ctx.fill();
          ctx.closePath();
          
          /* inner circle of second white circle, (eye)*/
          ctx.beginPath();
          ctx.fillStyle = 'black';
          ctx.arc(this.eX + 15, this.eY -10, this.tail ? 2 : 1, 0, (Math.PI/180) * 360, true)
          ctx.fill();
          ctx.closePath(); 
        }
      }
      

      function generateRandom(no, total) {
        arrRandom = [];
        for(var i = 0; i < no ;) {
          if(i == 0) {
            arrRandom[i] = Math.ceil(Math.random() * total);
            i++;
          } else {
            randomNum = Math.ceil(Math.random() * total);
            if(check(randomNum)) {
              arrRandom[i] = randomNum;
              i++;
            }
          }
        }
        return arrRandom;
      }

      function check(randomNum) {
        var flag = 0;
        for(var i=0; i<arrRandom.length ; i++) {
          if(arrRandom[i] == randomNum) {
            flag = 1;
            break;
          }
        }
        return flag === 0 ? true : false;
      }
    }
  };
});