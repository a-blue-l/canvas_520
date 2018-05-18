$(function(){
	var dpr = $('html').attr('data-dpr');
	var THREE_lights;
	var three_box;
	var audio = document.getElementById('audio');
	;(function(){
		$.fn.textGo = function(){
			this.each(function(){
				var $ele = $(this), str = $ele.html(), progress = 0;
            		$ele.html('');
            	var timer = setInterval(function(){
            		 var current = str.substr(progress, 1);
            		 if(current == '<'){
            		 	progress = str.indexOf('>', progress) + 1;
            		 } else {
							progress ++;
            		 }
            		 $ele.html(str.substring(0, progress));
            		 if(progress > str.length){
            		 	clearInterval(timer);
						$('.textcenter').show();
						three_box();
            		 }
            	}, 200)
			})
		};
	})()
	
	/*
	* RequestAnimationFrame 兼容
	*/
	;(function(){var b=0;var c=["ms","moz","webkit","o"];for(var a=0;a<c.length&&!window.requestAnimationFrame;++a){window.requestAnimationFrame=window[c[a]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[c[a]+"CancelAnimationFrame"]||window[c[a]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame){window.requestAnimationFrame=function(h,e){var d=new Date().getTime();var f=Math.max(0,16-(d-b));var g=window.setTimeout(function(){h(d+f)},f);b=d+f;return g}}if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(d){clearTimeout(d)}}}());
	;(function(){
		var initDate = {
			length:    500,
			duration:    2,
			velocity:  200,
			effect:  -0.75,
			size:       30
		}
		// 创建小心心对象
		var Point = function(x, y){
			this.x = (typeof x !== 'undefined')? x : 0;
			this.y = (typeof y !== 'undefined')? y : 0;
		}
		Point.prototype.clone = function(){
			return new Point(this.x, this.y);
		}
		Point.prototype.length = function(length){
			if (typeof length == 'undefined')
				return Math.sqrt(this.x * this.x + this.y * this.y);
			this.normalize();
			this.x *= length;
			this.y *= length;
			return this;
		}
		Point.prototype.normalize = function(){
			var length = this.length();
			this.x /= length;
			this.y /= length;
			return this;
		}
		var Particle = (function() {
			function Particle() {
				//定位
				this.position = new Point();
				//速度
				this.velocity = new Point();
				//加速度
				this.acceleration = new Point();
				// 寿命
				this.age = 0;
			}
			Particle.prototype.initialize = function(x, y, dx, dy) {
				this.position.x = x;
				this.position.y = y;
				this.velocity.x = dx;
				this.velocity.y = dy;
				this.acceleration.x = dx * initDate.effect;
				this.acceleration.y = dy * initDate.effect;
				this.age = 0;
			};
			Particle.prototype.update = function(deltaTime) {
				this.position.x += this.velocity.x * deltaTime;
				this.position.y += this.velocity.y * deltaTime;
				this.velocity.x += this.acceleration.x * deltaTime;
				this.velocity.y += this.acceleration.y * deltaTime;
				this.age += deltaTime;
			};
			Particle.prototype.draw = function(context, image) {
				function ease(t) {
				  return (--t) * t * t + 1;
				}
				var size = image.width * ease(this.age / initDate.duration);
				context.globalAlpha = 1 - this.age / initDate.duration;
				context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
			};
			return Particle;
		})();
		var ParticlePool = (function() {
			var particles,
			firstActive = 0,
			firstFree   = 0,
			duration    = initDate.duration;

			function ParticlePool(length) {
				// create and populate particle pool
				particles = new Array(length);
				for (var i = 0; i < particles.length; i++)
				particles[i] = new Particle();
			}
			ParticlePool.prototype.add = function(x, y, dx, dy) {
				particles[firstFree].initialize(x, y, dx, dy);

				// handle circular queue
				firstFree++;
				if (firstFree   == particles.length) firstFree   = 0;
				if (firstActive == firstFree       ) firstActive++;
				if (firstActive == particles.length) firstActive = 0;
			};
			ParticlePool.prototype.update = function(deltaTime) {
				var i;

				// update active particles
				if (firstActive < firstFree) {
					for (i = firstActive; i < firstFree; i++)
					particles[i].update(deltaTime);
				}
				if (firstFree < firstActive) {
					for (i = firstActive; i < particles.length; i++)
						particles[i].update(deltaTime);
					for (i = 0; i < firstFree; i++)
						particles[i].update(deltaTime);
				}

				// remove inactive particles
				while (particles[firstActive].age >= duration && firstActive != firstFree) {
				firstActive++;
				if (firstActive == particles.length) firstActive = 0;
				}
			};
			ParticlePool.prototype.draw = function(context, image) {
				// draw active particles
				if (firstActive < firstFree) {
					for (i = firstActive; i < firstFree; i++)
						particles[i].draw(context, image);
				}
				if (firstFree < firstActive) {
					for (i = firstActive; i < particles.length; i++)
						particles[i].draw(context, image);
					for (i = 0; i < firstFree; i++)
						particles[i].draw(context, image);
				}
			};
			return ParticlePool;
		})();
		;(function(canvas){
			var context = canvas.getContext('2d'),
			particles = new ParticlePool(initDate.length),
	        particleRate = initDate.length / initDate.duration,
	        time;
			canvas.width = canvas.clientWidth * (2/dpr);
			canvas.height = canvas.clientHeight * (2/dpr);
			
			// 小心心路径
			var pointOnHeart = function(t){
				return new Point(
					160 * Math.pow(Math.sin(t), 3),
	      			130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
				)
			}
			//绘制一颗心图片
			var image = (function() {
				var canvas = document.createElement('canvas'),
					context = canvas.getContext('2d');
				canvas.width = initDate.size;
				canvas.height = initDate.size;

				function to(t){
					var point = pointOnHeart(t);
					point.x = initDate.size / 2 + point.x * initDate.size / 350;
					point.y = initDate.size / 2 + point.y * initDate.size / 350;
					return point;
				}

				context.beginPath;
				var t = -Math.PI;
				var point = to(t);
				context.moveTo(point.x, point.y);
				while (t < Math.PI) {
					t += 0.01;
					point = to(t);
					context.lineTo(point.x, point.y);
				}
				// 从当前点到开始点的路径
				context.closePath();
				context.fillStyle = '#ea80b0';
				context.fill();
				var image = new Image();
				image.src = canvas.toDataURL();
				return image;
			})()
			three_box = function render(){
				requestAnimationFrame(three_box);

				context.clearRect(0, 0, canvas.width, canvas.height);

				var newTime = new Date().getTime() / 1000,
					deltaTime = newTime - (time || newTime);
				time = newTime;
				var amount = particleRate * deltaTime;
				for (var i = 0; i < amount; i++) {
			      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
			      var dir = pos.clone().length(initDate.velocity);
			      particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
			    }
			    // update and draw particles
			    particles.update(deltaTime);
			    particles.draw(context, image);
			}
			window.onload = function(){
				$('.loadings').hide().remove();
			}

				$('.contentBox').css({opacity: 1});
			$('.kaishi').click(function(){
				audio.play();
				$('.start').hide().remove();
				$('.loadBox').show();
				var one_step = setTimeout(function(){
					clearTimeout(one_step);
					one_step = null;
					$('.loadBox').remove();
					THREE_lights();
					$('.code').textGo();
					$('.code').show();
				}, 7000)
			})
		})(document.getElementById('canvas'))
	})()
	// 宇宙部分
	;(function(){
		var renderer;
		var width,height;
		function initThree(){
			width = document.getElementById('canvas-example').clientWidth;
			height = document.getElementById('canvas-example').clientHeight;
			console.log(width)
			renderer = new THREE.WebGLRenderer({
				antialias: true
			})
			renderer.setSize(width, height);
			document.getElementById('canvas-example').appendChild(renderer.domElement);
			renderer.setClearColor(0x000000, 1.0);
		}
		var camera;
		function initCamera(){
			camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
			/* 透视摄像机 和 正投影摄像机 */ 
			/* 参数 照相机打开角度（近大远小）  视野长宽比路  显示的视野远近范围 */
			camera.position.set( 0, 0, 1500 ); /*照相机放置的位置 */
			camera.lookAt( -100, 100, 0 );/* 照相机观看的角度 */
		}
		var scene;
		function initScene(){
			scene = new THREE.Scene();
			/* 场景 */ 
		}
		var light; /* 灯光 */
		function initLight(){
			var ambientLight = new THREE.AmbientLight(0x663388, 2);
    		scene.add(ambientLight);
			light = new THREE.DirectionalLight(0xfffffff, 1.0);/* 方向光 */
			light.position.set(100, 100, 200);
		    light.castShadow = true;
		    light.shadow.camera.left = -400;
		    light.shadow.camera.right = 400;
		    light.shadow.camera.top = 400;
		    light.shadow.camera.bottom = -400;
		    light.shadow.camera.near = 1;
		    light.shadow.camera.far = 1000;
		    light.shadow.mapSize.width = 2048;
		    light.shadow.mapSize.height = 2048;

			scene.add(light)
		}
		THREE_light = function(){
			initThree();  //初始化renderer
			initCamera(); //初始化camera
			initScene(); //初始化scene
			initLight(); //初始化light
			// 创建星球材质模型
			function getMat(color, text){
				return new THREE.MeshStandardMaterial({
					color: color,
					roughness: 0.9,
					transparent: true,
					opacity: 0,
					emissive: 0x270000,
					flatShading: THREE.FlatShading
				});
			}
			// 颜色种类
			var colors = {
				red: 0xf85051,
			    orange: 0xea8962,
			    yellow: 0xdacf75,
			    beige: 0xccc58f,
			    grey: 0xbab7a1,
			    blue: 0x4379a8,
			    ocean: 0x4993a8,
			    green: 0x24a99b
			}
			var parameters = {
			    minRadius: 30,
			    maxRadius: 50,
			    minSpeed: .015,
			    maxSpeed: .025,
			    particles: 500,
			    minSize: .1,
			    maxSize: 2
			};
			var colorsLength = Object.keys(colors).length;
			// 生成一个介于最大值和最小值之间的随机数
			function randomRange(min, max){
				return Math.floor(Math.random()*(max-min + 1) + min);
			}
			// 生成一个颜色随机数
			function getRandomColor(){
				var colorIndex = Math.floor(Math.random() * colorsLength);
				var colorStr = Object.keys(colors)[colorIndex];
				return colors[colorStr];
			}
			function shiftPosition(pos, radius) {
			    if (Math.abs(pos) < radius) {
			        if (pos >= 0) {
			            return pos + radius;
			        } else {
			            return pos - radius;
			        }
			    } else {
			        return pos;
			    }
			}

			var star = [];// 星星对象池
			var planets = []; //星球对象池
			var nbPlanetsMax = 4;
			// 星球构造函数
			var Planet = function(z) {
			    // the geometry of the planet is a tetrahedron
			    this.planetRadius = randomRange(12, 30);
			    var planetDetail = randomRange(2, 3);
			    var geomPlanet = new THREE.TetrahedronGeometry(this.planetRadius, planetDetail);

			    var noise = randomRange(1, 5);
			    for (var i = 0; i < geomPlanet.vertices.length; i++) {
			        var v = geomPlanet.vertices[i];
			        v.x += -noise / 2 + Math.random() * noise;
			        v.y += -noise / 2 + Math.random() * noise;
			        v.z += -noise / 2 + Math.random() * noise;
			    }

			    // create a new material for the planet
			    var color = getRandomColor();
			    var matPlanet = getMat(color);
			    // create the mesh of the planet
			    this.planet = new THREE.Mesh(geomPlanet, matPlanet);

			    this.ring = new THREE.Mesh();
			    this.nParticles = 0;

			    // create the particles to populate the ring
			    this.updateParticlesCount();

			    // Create a global mesh to hold the planet and the ring
			    this.mesh = new THREE.Object3D();
			    this.mesh.add(this.planet);
			    this.mesh.add(this.ring);

			    this.planet.castShadow = true;
			    this.planet.receiveShadow = true;

			    // update the position of the particles => must be moved to the loop
			    this.mesh.rotation.x = (Math.random() * 2 - 1) * 2 * Math.PI;
			    this.mesh.rotation.z = (Math.random() * 2 - 1) * 2 * Math.PI;

			    var posX = randomRange(-1 * Math.floor(width / 4), Math.floor(width / 4));
			    var posY = randomRange(-1 * Math.floor(height / 4), Math.floor(height / 4));
			    posX = shiftPosition(posX, this.planetRadius);
			    posY = shiftPosition(posY, this.planetRadius);

			    this.mesh.position.set(posX, posY, z);
			    scene.add(this.mesh);
			}
			Planet.prototype.destroy = function() {
			    scene.remove(this.mesh);
			}
			Planet.prototype.updateParticlesCount = function() {
			    var parameters = {
			        minRadius: randomRange(this.planetRadius + 10, 60),
			        maxRadius: randomRange(40, 70),
			        minSpeed: randomRange(0, 5) * 0.1 + randomRange(0, 9) * 0.01,
			        maxSpeed: randomRange(0, 5) * 0.1 + randomRange(0, 9) * 0.01,
			        particles: randomRange(0, 1) * randomRange(20, 30),
			        minSize: randomRange(1, 3) + randomRange(0, 9) * 0.1,
			        maxSize: randomRange(1, 3) + randomRange(0, 9) * 0.1
			    };

			    if (this.nParticles < parameters.particles) {
			        // Remove particles
			        for (var i = this.nParticles; i < parameters.particles; i++) {
			            var p = new Particle();
			            p.mesh.rotation.x = Math.random() * Math.PI;
			            p.mesh.rotation.y = Math.random() * Math.PI;
			            p.mesh.position.y = -2 + Math.random() * 4;
			            this.ring.add(p.mesh);
			        }
			    } else {
			        // add particles
			        while (this.nParticles > parameters.particles) {
			            var m = this.ring.children[this.nParticles - 1];
			            this.ring.remove(m);
			            m.userData.po = null;
			            this.nParticles--;
			        }
			    }
			    this.nParticles = parameters.particles;
			    this.angleStep = Math.PI * 2 / this.nParticles;
			    this.updateParticlesDefiniton();
			}

			// Update particles definition
			Planet.prototype.updateParticlesDefiniton = function() {

			    for (var i = 0; i < this.nParticles; i++) {
			        var m = this.ring.children[i];
			        var s = parameters.minSize + Math.random() * (parameters.maxSize - parameters.minSize);
			        m.scale.set(s, s, s);
			        m.userData.distance = parameters.minRadius + Math.random() * (parameters.maxRadius - parameters.minRadius);
			        m.userData.angle = this.angleStep * i;
			        m.userData.angularSpeed = rule3(m.userData.distance, parameters.minRadius, parameters.maxRadius, parameters.minSpeed, parameters.maxSpeed);
			    }
			}

			var Particle = function() {
			    var s = 1;

			    var geom,
			        random = Math.random();

			    if (random < .25) {
			        geom = new THREE.BoxGeometry(s, s, s);

			    } else if (random < .5) {
			        geom = new THREE.CylinderGeometry(0, s, s * 2, 4, 1);

			    } else if (random < .75) {
			        geom = new THREE.TetrahedronGeometry(s, 2);

			    } else {
			        geom = new THREE.BoxGeometry(s / 6, s, s); // thick plane
			    }
			    var color = getRandomColor();
			    var mat = getMat(color);

			    this.mesh = new THREE.Mesh(geom, mat);
			    this.mesh.receiveShadow = true;
			    this.mesh.castShadow = true;
			    this.mesh.userData.po = this;
			}


			Planet.prototype.updateParticlesRotation = function() {

			    for (var i = 0; i < this.nParticles; i++) {
			        var m = this.ring.children[i];
			        m.userData.angle += m.userData.angularSpeed;

			        var posX = Math.cos(m.userData.angle) * m.userData.distance;
			        var posZ = Math.sin(m.userData.angle) * m.userData.distance;
			        m.position.x = posX;
			        m.position.z = posZ;

			        m.rotation.x += Math.random() * .05;
			        m.rotation.y += Math.random() * .05;
			        m.rotation.z += Math.random() * .05;
			    }
			}

			function addPlanet(z) {
			    planets.push(new Planet(z));
			}


			for (var i = 0; i < nbPlanetsMax; i++) {
		        planets.push(new Planet(-2000 / nbPlanetsMax * i - 500));
		    }

			function addStars(){
				// 添加100个星星
				for(var z = -2000; z<0; z+=20){
					var geometry = new THREE.SphereGeometry(0.5, 32, 32);
					var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
					var sphere = new THREE.Mesh(geometry, material);
					sphere.position.x = randomRange(-1 * Math.floor(width / 2), Math.floor(width / 2));
					sphere.position.y = randomRange(-1 * Math.floor(height / 2), Math.floor(height / 2));
					sphere.position.z = z;
					sphere.scale.x = sphere.scale.y = 2;
					scene.add(sphere);
					star.push(sphere);
				}
			}
			addStars();
			THREE_lights = function(){
				loop();
			}
			function animateStars(z){
				for (var i = 0; i < star.length; i ++) {
					var stars = star[i];
					if (stars.position.z > z) {
						stars.position.z -= 2000;
						stars.position.x = randomRange(-1 * Math.floor(width / 2), Math.floor(width / 2));
						stars.position.y = randomRange(-1 * Math.floor(height / 2), Math.floor(height / 2));
					}
				}
			}

			var horizon = -2000 + camera.position.z;
				 for (var i = 0; i < planets.length; i++) {
			        if (planets[i].mesh.position.z > camera.position.z) {
			            planets[i].destroy();
			            planets.splice(i, 1);
			        }

			        // If the planet is arriving
			        if (planets[i].mesh.position.z > horizon && planets[i].planet.material.opacity < 1) {
			            planets[i].planet.material.opacity += 0.005;
			            for (var j = 0; j < planets[i].mesh.children[1].children.length; j++) {
			                planets[i].mesh.children[1].children[j].material.opacity += 0.005;
			            }
			        }
			    }
			     if (planets.length < nbPlanetsMax) {
			        addPlanet(camera.position.z - 2000);
			    }

			    for (var i = 0; i < planets.length; i++) {
			        planets[i].planet.rotation.y -= 0.01;
			        planets[i].updateParticlesRotation();
			    }

				animateStars(camera.position.z);
				camera.position.z -= 3;
				renderer.render(scene, camera);


			function loop() {
				 var horizon = -2000 + camera.position.z;
				 for (var i = 0; i < planets.length; i++) {
			        if (planets[i].mesh.position.z > camera.position.z) {
			            planets[i].destroy();
			            planets.splice(i, 1);
			        }

			        // If the planet is arriving
			        if (planets[i].mesh.position.z > horizon && planets[i].planet.material.opacity < 1) {
			            planets[i].planet.material.opacity += 0.005;
			            for (var j = 0; j < planets[i].mesh.children[1].children.length; j++) {
			                planets[i].mesh.children[1].children[j].material.opacity += 0.005;
			            }
			        }
			    }
			     if (planets.length < nbPlanetsMax) {
			        addPlanet(camera.position.z - 2000);
			    }

			    for (var i = 0; i < planets.length; i++) {
			        planets[i].planet.rotation.y -= 0.01;
			        planets[i].updateParticlesRotation();
			    }

				animateStars(camera.position.z);
				camera.position.z -= 3;
				renderer.render(scene, camera);
				requestAnimationFrame(loop);
			}
			function rule3(v, vmin, vmax, tmin, tmax) {
			    var nv = Math.max(Math.min(v, vmax), vmin);
			    var dv = vmax - vmin;
			    var pc = (nv - vmin) / dv;
			    var dt = tmax - tmin;
			    var tv = tmin + (pc * dt);
			    return tv;
			}
		}
		THREE_light();
	})()

	$('.text_05.two_time').click(function(){
// 		window.location.href = 'canvasthree.html';
	})
})
