// @ui {"widget":"group_start", "label":"Camera Toggle Objects"}
// @input SceneObject[] frontCameraObjects {"label":"Front Cam Objects"}
// @input SceneObject[] backCameraObjects  {"label":"Back Cam Objects"}
// @ui {"widget":"group_end"}

// @ui {"widget":"separator"}

// @ui {"widget":"group_start", "label":"Face Segmentation Mask"}
// @input Component.Camera segmentedCamera  {"label":"Segmented Camera"}
// @input Asset.Texture    segmentedTexture {"label":"Mask Texture"}
// @input SceneObject      alternativeLogo
// @ui {"widget":"group_end"}

// @ui {"widget":"separator"}

// @ui {"widget":"group_start", "label":"Fireworks Settings"}
// @input SceneObject               delayTweenObject {"label":"Delay Tween Object"}
// @input Component.Image          fireWorksImage   {"label":"Fireworks Image"}
// @input Component.AudioComponent fireWorksAudio   {"label":"Fireworks Audio"}
// @input float fireworksInterval {"label":"Repeat Interval (seconds)", "hint":"After the first burst, fireworks repeat every N seconds on front camera"}
// @ui {"widget":"group_end"}



var isFrontCamera = true;
var isFaceFound = false;
var firstBurstDone = false;   // true once the tween-delayed first burst has fired
var elapsedTime = 0;
var updateEvent = null;

// ── init ───────────────────────────────────────────────────────────────────

function init() {
    isFrontCamera = global.scene.getCameraType() !== "back";
    updateCameraObjects(isFrontCamera);
    updateSegmentationMask();

    if (isFrontCamera) {
        startFirstBurst();
    }
}

// ── camera objects & segmentation ─────────────────────────────────────────

function updateCameraObjects(isFront) {
    for (var i = 0; i < script.frontCameraObjects.length; i++) {
        script.frontCameraObjects[i].enabled = isFront;
    }
    for (var j = 0; j < script.backCameraObjects.length; j++) {
        script.backCameraObjects[j].enabled = !isFront;
    }
}

function updateSegmentationMask() {
    var hasMask = isFrontCamera && isFaceFound;
    script.segmentedCamera.maskTexture = hasMask ? script.segmentedTexture : null;
    script.alternativeLogo.enabled = !hasMask;
}

// ── fireworks — first burst via tween ─────────────────────────────────────

function startFirstBurst() {
    // Only play the intro tween once per lens session
    if (firstBurstDone) {
        // Already had the first burst; just resume the repeating timer
        startRepeatingTimer();
        return;
    }
    global.tweenManager.startTween(
        script.delayTweenObject,
        "fireWork Delay",
        onFirstBurstComplete
    );
}

function onFirstBurstComplete() {
    if (!isFrontCamera) { return; }   // switched away before tween finished
    firstBurstDone = true;
    playFireworks();
    startRepeatingTimer();
}

// ── fireworks — repeating interval timer ──────────────────────────────────

function startRepeatingTimer() {
    elapsedTime = 0;               // always reset so we wait a full interval
    if (updateEvent) { return; }   // already running
    updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

function stopRepeatingTimer() {
    if (updateEvent) {
        updateEvent.enabled = false;
        updateEvent = null;
    }
}

function onUpdate() {
    if (!isFrontCamera) { return; }

    var interval = (script.fireworksInterval > 0) ? script.fireworksInterval : 5;
    elapsedTime += getDeltaTime();

    if (elapsedTime >= interval) {
        elapsedTime = 0;
        playFireworks();
    }
}

function playFireworks() {
    script.fireWorksAudio.play(1);
    script.fireWorksImage.mainPass.baseTex.control.play(1, 0);
}

// ── camera events ──────────────────────────────────────────────────────────

function onCameraFront() {
    isFrontCamera = true;
    updateCameraObjects(true);
    updateSegmentationMask();
    startFirstBurst();   // respects firstBurstDone flag
}

function onCameraBack() {
    isFrontCamera = false;
    updateCameraObjects(false);
    updateSegmentationMask();
    // Stop the tween (in case user switches before first burst completes)
    global.tweenManager.stopTween(script.delayTweenObject, "fireWork Delay");
    stopRepeatingTimer();
    script.fireWorksAudio.stop(false);
}

// ── face events ────────────────────────────────────────────────────────────

function onFaceFound() {
    isFaceFound = true;
    updateSegmentationMask();
}

function onFaceLost() {
    isFaceFound = false;
    updateSegmentationMask();
}

// ── bind events ────────────────────────────────────────────────────────────

script.createEvent("OnStartEvent").bind(init);
script.createEvent("CameraFrontEvent").bind(onCameraFront);
script.createEvent("CameraBackEvent").bind(onCameraBack);
script.createEvent("FaceFoundEvent").bind(onFaceFound);
script.createEvent("FaceLostEvent").bind(onFaceLost);
