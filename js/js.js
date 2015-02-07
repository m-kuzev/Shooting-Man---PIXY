// Enable the stage to be interactive (false because of optimisation)
var interactive = true;
// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x252729, interactive);

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(960, 760);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

// create an array of assets to load
var assetsToLoader = [
    "imgs/sniper-frames/Sniper.png", "imgs/sniper-frames/Sniper.json",
    "imgs/rocket-frames/Rocket.png", "imgs/rocket-frames/Rocket.json",
    "imgs/explosion-frames/Explosion.png", "imgs/explosion-frames/Explosion.json"
];

// create a new loader
loader = new PIXI.AssetLoader(assetsToLoader);

// use callback
loader.onComplete = onAssetsLoaded;

//begin load
loader.load();




function onAssetsLoaded() {
    var rocketSpeedModification = 600;
    var circleRadius = 10;
    var sniperMovementSpeedModification = 150;

    // Sniper texture definition
    var sniperTextures = addTextures("imgs/sniper-frames/sniper", 7);
    var sniperSprite = new PIXI.MovieClip(sniperTextures);
    manageClipSettings(sniperSprite, 0.3, 0.1, renderer.width / 2, renderer.height / 2, 3.14, 0.3);
    stage.addChild(sniperSprite);

    // Rocket texture definition
    var rocketTextures = addTextures("imgs/rocket-frames/rocket_0", 4);

    // Explosion texture definition
    var explosionTextures = addTextures("imgs/explosion-frames/explosion_", 40);

    // set up the main sprite interactions
    stage.mousemove = function (mouseData) {
        // get the click coordinates
        var globalClick = mouseData.global;

        var mouseClickX = globalClick.x;
        var mouseClickY = globalClick.y;

        var deltaX = mouseClickX - sniperSprite.position.x;
        var deltaY = mouseClickY - sniperSprite.position.y;

        var rad = Math.atan2(deltaX, deltaY);

        sniperSprite.rotation = 3.14 - rad;

        stage.click = function (mouseData) {
            var rocketSprite = new PIXI.MovieClip(rocketTextures);

            var animationDistance = getDistance(mouseClickX, mouseClickY, sniperSprite.x, sniperSprite.y);
            var animationTime = animationDistance / rocketSpeedModification;

            manageClipSettings(rocketSprite, 0.5, 0.5, sniperSprite.x, sniperSprite.y, 3.14 - rad, 0.1);
            rocketSprite.play();

            stage.addChild(rocketSprite);

            TweenMax.to(rocketSprite, animationTime, {x: mouseClickX, y: mouseClickY, ease: Power0.easeNone, onComplete: removeRocketAndExplode});

            function removeRocketAndExplode() {
                stage.removeChild(rocketSprite);
                var explosionSprite = new PIXI.MovieClip(explosionTextures);
                manageClipSettings(explosionSprite, 0.5, 0.5, mouseClickX, mouseClickY, 0, 1);

                explosionSprite.play();
                stage.addChild(explosionSprite);

                setTimeout(function () {
                    stage.removeChild(explosionSprite);
                }, 500);
            }
        };
    };

    // set up right button movement
    $('canvas').bind('contextmenu', function (e) {
        // create and add the direction circle
        sniperSprite.play();
        var circle = new PIXI.Graphics();
        circle.interactive = true;

        circle.lineStyle(1, 0xff0000, 1);
        circle.drawCircle(e.clientX, e.clientY, circleRadius);

        stage.addChild(circle);

        var animationDistance = getDistance(e.pageX, e.pageY, sniperSprite.x, sniperSprite.y);
        var animationTime = animationDistance / sniperMovementSpeedModification;

        // setting up Greensock tweens
        TweenMax.to(circle, 0.3, {x: 0, y: 0, onComplete: removeCircle});
        function removeCircle() {
            stage.removeChild(circle);
        }

        TweenMax.to(sniperSprite.position, animationTime, {x: e.pageX, y: e.pageY, ease: Power0.easeNone, onComplete: stopSniper});
        function stopSniper() {
            sniperSprite.stop();
        }

        e.preventDefault();
    });

    // setting up the landing screen
    var startScreenContainer = new PIXI.DisplayObjectContainer();

    var startButton = new PIXI.Graphics();
    startButton.lineStyle(3, 0x8BC558, 1);
    startButton.beginFill(0x8BC558);
    startButton.drawRoundedRect(renderer.width / 2 - 170, renderer.height / 2, 330, 60, 5);
    startButton.endFill();
    startButton.interactive = true;

    var startBox = new PIXI.Graphics();
    startBox.lineStyle(10, 0x333638, 1);
    startBox.beginFill(0x3E4144);
    startBox.drawRoundedRect(60, 180, 830, 480, 10);
    startBox.endFill();

    var textSample = new PIXI.Text("Start Game", {font: "35px Snippet", fill: "white", align: "left"});
    textSample.position.x = renderer.width / 2 - 90;
    textSample.position.y = renderer.height / 2 + 10;

    startScreenContainer.addChild(startBox);
    startScreenContainer.addChild(startButton);
    startScreenContainer.addChild(textSample);

    stage.addChild(startScreenContainer);

    startButton.click = function () {
        TweenMax.to(startScreenContainer, 1, {y: -1000, ease: Power0.easeNone, onComplete: removeStartScreen});
        function removeStartScreen() {
            stage.removeChild(startScreenContainer);
        }
    };

    // PIXI action
    requestAnimFrame(animate);

    function animate() {
        requestAnimFrame(animate);
        renderer.render(stage);
    }
}

// My functions
// find the distance from obj to mouse-click
function getDistance(x2, y2, x1, y1) {
    var distance;
    var deltaX = x2 - x1;
    var deltaY = y2 - y1;

    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
}

// add textures for the movie-clip
function addTextures(imsSource, frameCount) {
    var textureArray = [];
    for (var i = 0; i < frameCount; i += 1) {
        var texture = PIXI.Texture.fromImage(imsSource + (i + 1) + ".png");
        textureArray.push(texture);
    }

    return textureArray;
}

// set MovieClip settings
function manageClipSettings(clip, anchorX, anchorY, positionX, positionY, rotation, animationSpeed) {
    clip.anchor.x = anchorX || undefined;
    clip.anchor.y = anchorY || undefined;
    clip.position.x = positionX || undefined;
    clip.position.y = positionY || undefined;
    clip.rotation = rotation;
    clip.animationSpeed = animationSpeed;
}






















