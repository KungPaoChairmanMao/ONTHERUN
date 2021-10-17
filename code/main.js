import kaboom from "kaboom";
kaboom()

loadSprite("roadWork", "sprites/roadWork.png")
loadSprite("trafficLight", "sprites/trafficLight.png")
loadSprite("straightrunning", "sprites/straightrunning.png");
loadSprite("runningleft", "sprites/runningleft.png");
loadSprite('bluebirdflap1', "sprites/bluebirdflap1.png")
loadSprite('brownbirdflap1', "sprites/brownbirdflap1.png")
loadSprite('pistol', "sprites/pistol.png")
loadSprite("rpg", "sprites/rpg.png")
loadSprite("sky", "sprites/sky.png")


let highScore = 0;

scene("start", () => {
  add([
    text("On The Run"),
    pos(width() / 4, height() / 4),
  ]);

  layers([
    "bg",
    "obj",
    "ui",
  ], "obj");

  add([
    sprite("sky"),
    layer("bg")
  ]);



  mouseClick(() => {
    go("game")
  })
});

scene("game", () => {

  const GROUND_HEIGHT = 48;
	const JUMP_FORCE = 800;

  let speed = 320;

  layers([
    "bg",
    "obj",
    "ui",
  ], "obj");

  add([
    sprite("sky"),
    layer("bg")
  ]);

  add([
    rect(width(), GROUND_HEIGHT),
    pos(0, height() - 48),
    outline(4),
    area(),
    solid(),
    color(127, 200, 255),
    "ground"
])

	// define gravity

  gravity(1600)


	// a game object consists of a list of components and tags
	const bean = add([
		// sprite() means it's drawn with a sprite of name "bean" (defined above in 'loadSprite')
		sprite("straightrunning"),
		// give it a position
		pos(width() / 4, 0),
    scale(4),
		// give it a collider
		area(),
		// body component enables it to fall and jump in a gravity world
		body(),
    "man"
	]);
  
  const pistol = add([
		// sprite() means it's drawn with a sprite of name "bean" (defined above in 'loadSprite')
		sprite("pistol"),
		// give it a position
    pos(100,0),
    scale(3),
		follow(bean),
		// give it a collider
		area(),
  ])

	// jump
  
	keyPress("up", () => {
		if (bean.grounded()) {
      bean.jump(JUMP_FORCE)
    }
	});
  function spawnBlueBird() {
    add([
      sprite("bluebirdflap1"),
      pos(width(), height()*1/4),
      scale(4),
      rotate(10),
      area(),
      move(LEFT, speed),
      cleanup(),
      "bluebird",
    ])
  }

  function spawnBrownBird() {
    add([
      sprite("brownbirdflap1"),
      pos(width(), height()*1/4),
      scale(4),
      rotate(10),
      area(),
      move(LEFT, speed + 100),
      cleanup(),
      "brownbird",
    ])
  }
  


	function spawnSign() {
		add([
      sprite("roadWork"),
			pos(width(), height() - GROUND_HEIGHT*2.5),
			scale(4),
      area(),
			move(LEFT, speed),
			cleanup(),
			"pipe",
			// raw obj just assigns every field to the game obj
			{ passed: false, },
		]);
	}

	// callback when bean collides with objects with tag "pipe"
	bean.collides("pipe", () => {
		go("lose", score);
		addKaboom(bean.pos);
	});

	// per frame event for all objects with tag 'pipe'
	action(("pipe"), (p) => {
		// check if bean passed the pipe
		if (p.pos.x + p.width <= bean.pos.x && p.passed === false) {
			addScore(2);
			p.passed = true;
		}
	});

	// spawn a pipe every 1 sec
	loop((Math.random()* 100 + 100)/100, () => {
    spawnSign()
	});

  loop((Math.random()* 50 + 100)/100, () => {
    Math.round(Math.random()) == 1 ? spawnBlueBird() : spawnBrownBird()
	});
  
  mouseClick((post) => { 
    const projectile = add([
      sprite("rpg"),
      pos(pistol.pos),
      area(),
      move((post).angle(pistol.pos), 1200),
      "bullet",
    ]);
    addScore(-1)
  })

  collides("bluebird", "bullet", (bluebird, bullet) => {
    destroy(bullet);
    bluebird.move(DOWN, 20)
    addScore(10)
  })

  collides("brownbird", "bullet", (bluebird, bullet) => {
    destroy(bullet);
    bluebird.move(DOWN, 20)
    addScore(15)
  })

	let score = 0;
	// display score
	const scoreLabel = add([
		text(score),
		layer("ui"),
		origin("center"),
		pos(width() / 2, 80),
	]);

	function addScore(increment) {
		score += increment;
    speed += (speed * (0.0001 * score))
		scoreLabel.text = score;
	}

});

scene("lose", (score) => {

  layers([
    "bg",
    "obj",
    "ui",
  ], "obj");

  add([
    sprite("sky"),
    layer("bg")
  ]);

  if (score > highScore) {
    highScore = score;
  }
	add([
		pos(width() / 2, height() / 2 - 108),
		scale(1),
		origin("center"),
    text("High score: " + highScore)
	]);
  add([
    pos(width() / 2, height() / 2 ),
		origin("center"),
    text("Score: " + score)
  ])
	// go back to game with space is pressed
	keyPress("space", () => go("game"));
	mouseClick(() => go("game"));

});

go("start");

