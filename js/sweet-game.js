/*global BLOCKS, window, document */
/*jshint loopfunc:true */

(function () {
				
    var game, spec;
    
    spec = {
		width: 800,
		height: 600,
		bg: {
			src: "images/sweet-drop-bg.png"
		},
		structures:[{
			name: "tent",
			slices: [{
				name: "inactive",
				src: "images/tent.png"
			}, {
				name: "active",
				src: "images/tent-hit.png"
			}, {
				name: "broken",
				src: "images/tent-broken.png"
			}]
		}],
		popsicles:[{
			name: "creamsicle",
			slices: [{
				name: "falling",
				src: "images/creamsicle.png"
			}, {
				name: "crashed",
				src: "images/creamsicle-broken.png"
			}]
		}, {
			name: "bombpop",
			slices: [{
				name: "falling",
				src: "images/bomb-pop.png"
			}, {
				name: "crashed",
				src: "images/bomb-pop-broken.png"
			}]
		}, {
			name: "popsicle",
			slices: [{
				name: "falling",
				src: "images/popsicle.png"
			}, {
				name: "crashed",
				src: "images/popsicle-broken.png"
			}]
		}, {
			name: "pushUp",
			slices: [{
				name: "falling",
				src: "images/push-up.png"
			}, {
				name: "crashed",
				src: "images/push-up-broken.png"
			}]
		}]
	};
    
	game = BLOCKS.game(spec);
    
    game.prepare = function () {
    
		var bg, 
			index = 0, 
			structure, 
			structures = [], 
			popsicles = [],
			ground = game.height - 20,
			
			gameTapped = function (point) {
			
				var i;
				
				for (i = 0; i < popsicles.length; i += 1) {

					if (popsicles[i].isPointInside(point)) {
					
						popsicles[i].removeMotors();
						game.addMotor("alpha", {
							object: popsicles[i],
							duration: 500,
							amount: -1
						});
						game.addTicker(destroyPopsicle, 500, popsicles[i]);
					}
				}
			},
			
			destroyStructure = function (structure) {
			
				var i;
								
				for (i = 0; i < structures.length; i += 1) {
					if (structure === structures[i]) {
						structures.splice(i, 1);
						break;
					}
				}
				game.stage.removeView(structure);
				structure.destroy();
				structure = null;
			},
			
			spawnStructure = function () {
			
				structure = BLOCKS.block(spec.structures[0]);
				structure.layer = game.layers[1];
				game.stage.addView(structure);
				
				structure.x = Math.random() * (game.width - structure.width * 2) + structure.width / 2;
				structure.y = ground;
				structure.numHits = 0;
				
				game.addMotor("y", {
					object: structure,
					duration: 500,
					amount: -structure.height,
					easing: "easeOut"
				});
				
				structure.cropHeight = 0;
				game.addMotor("cropHeight", {
					object: structure,
					duration: 500,
					amount: structure.height,
					easing: "easeOut"
				});
				
				structures.push(structure);
			},
			
			destroyPopsicle = function (popsicle) {
			
				var i;
								
				for (i = 0; i < popsicles.length; i += 1) {
					if (popsicle === popsicles[i]) {
						popsicles.splice(i, 1);
						break;
					}
				}
				game.stage.removeView(popsicle);
				popsicle.destroy();
				popsicle = null;
			},

			dropPopsicle = function () {

				var popsicle,
				
					melt = function () {
					
						game.addMotor("alpha", {
							object: popsicle,
							duration: 800,
							amount: -1,
							easing: "easeIn",
							callback: function () {
								destroyPopsicle(popsicle);
							}
						});
						
						popsicle.cropHeight = popsicle.height;
						game.addMotor("cropHeight", {
							object: popsicle,
							duration: 1000,
							amount: -popsicle.height,
							easing: "easeIn"
						});

						game.addMotor("y", {
							object: popsicle,
							duration: 1000,
							amount: popsicle.height,
							easing: "easeIn"
						});
					};

				popsicle = BLOCKS.block(spec.popsicles[Math.floor(Math.random() * spec.popsicles.length)]);
				popsicle.layer = game.layers[2];
				game.stage.addView(popsicle);
				popsicles.push(popsicle);

				popsicle.x = Math.random() * (game.width - popsicle.width);
				popsicle.y = -popsicle.height;
				game.addMotor("y", {
					object: popsicle,
					duration: 3000,
					amount: ground,
					easing: "easeIn",
					callback: function () {
					
						var i,
						
							resetStructure = function (structure) {
								if (structure.getSlice().name === "active") {
									structure.setSlice("inactive");
								}
							};
						
						popsicle.setSlice("crashed");
						game.addTicker(melt, 2000);

						for (i = 0; i < structures.length; i += 1) {
							if (popsicle.isRectInside(structures[i])) {
							
								structures[i].numHits += 1;
								
								if (structures[i].numHits === 1) {
									structures[i].setSlice("active");

									game.addTicker(resetStructure, 2500, structures[i]);
								} else if (structures[i].numHits === 2) {
									
									structures[i].setSlice("broken");
									
									game.addTicker(destroyStructure, 3500, structures[i]);
									game.addTicker(spawnStructure, 3500);
								}
							}
						}
					}
				});
				
				game.addTicker(dropPopsicle, 3000);
			};

		bg = BLOCKS.slice(spec.bg);
		bg.layer = game.layers[0];
		game.stage.addView(bg);
		
		game.controller.addEventListener("tap", gameTapped);
		
		spawnStructure();
		
		dropPopsicle();
    };
}());