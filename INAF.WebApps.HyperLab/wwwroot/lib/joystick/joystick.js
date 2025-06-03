var alpha = 0.75;
var xCenter = 50;
var yCenter = 50;

var isJoystickControllerInitialized = false;

function initJoystickController() {
    if (isJoystickControllerInitialized)
        return; // prevent multiple initializations

    $('#body').removeClass('overflow-y-auto').addClass('overflow-y-hidden');

    var stage = new createjs.Stage('joystick');

    var psp = new createjs.Shape();
    psp.graphics.beginFill('#FFFFFF').drawCircle(xCenter, yCenter, 25);
    psp.alpha = alpha;

    stage.addChild(psp);
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener('tick', stage);
    stage.update();

    var myElement = $('#joystick')[0];

    // create a simple instance
    // by default, it only adds horizontal recognizers
    var mc = new Hammer(myElement);

    mc.on("panstart", function (ev) {
        var pos = $('#joystick').position();
        xCenter = psp.x;
        yCenter = psp.y;
        psp.alpha = 0.75;

        stage.update();
    });

    // listen to events...
    mc.on("panmove", function (ev) {
        var pos = $('#joystick').position();

        var x = (ev.center.x - pos.left - 50);
        var y = (ev.center.y - pos.top - 50);

        var coords = calculateCoords(ev.angle, ev.distance);

        psp.x = coords.x;
        psp.y = coords.y;
        //console.log(`Joystick position: x: ${psp.x}, y: ${psp.y}`);
        if (targetPointer && targetPointer.length) { //targetPointer is defined in joystickManager.js object
            currentX += psp.x * speedFactor;
            currentY += psp.y * speedFactor;
            targetPointer.css('transform', `translate(${currentX}px, ${currentY}px)`);
            executeAfter(function () { checkForAlignedSeriesPointsInNearby(); }, 10);
        }

        psp.alpha = alpha;

        stage.update();
    });

    mc.on("panend", function (ev) {
        psp.alpha = alpha;
        createjs.Tween.get(psp).to({ x: xCenter, y: yCenter }, 750, createjs.Ease.elasticOut);
    });

    isJoystickControllerInitialized = true;
}

function calculateCoords(angle, distance) {
    var coords = {};
    distance = Math.min(distance, 100);
    var rads = (angle * Math.PI) / 180.0;

    coords.x = distance * Math.cos(rads);
    coords.y = distance * Math.sin(rads);

    return coords;
}