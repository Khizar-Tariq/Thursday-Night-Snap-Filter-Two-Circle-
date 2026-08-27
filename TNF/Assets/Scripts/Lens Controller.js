// @ui {"widget":"group_start", "label":"Camera Toggle Objects"}
// @input SceneObject[] frontCameraObjects {"label":"Front Cam Objects"}
// @input SceneObject[] backCameraObjects {"label":"Back Cam Objects"}
// @ui {"widget":"group_end"}

// @ui {"widget":"separator"}

// @ui {"widget":"group_start", "label":"Face Segmentation Mask"}
// @input Component.Camera segmentedCamera {"label":"Segmented Camera"}
// @input Asset.Texture segmentedTexture {"label":"Mask Texture"}
// @ui {"widget":"group_end"}

// @ui {"widget":"separator"}

// @ui {"widget":"group_start", "label":"Fireworks Animation & Delay"}
// @input SceneObject delayTweenObject {"label":"Delay Tween Object"}
// @input Component.Image fireWorksImage {"label":"Fireworks Image"}
// @input Component.AudioComponent fireWorksAudio {"label":"Fireworks Audio"}
// @ui {"widget":"group_end"}

var isFrontCamera = true;
var isFaceFound = false;
var hasPlayedFireworks = false;

function init() {
    isFrontCamera = global.scene.getCameraType() !== "back";
    updateCameraObjects(isFrontCamera);
    updateSegmentationMask();

    if (isFrontCamera) {
        playFireworksDelayTween();
    }
}

function updateCameraObjects(isFront) {
    for (var i = 0; i < script.frontCameraObjects.length; i++) {
        script.frontCameraObjects[i].enabled = isFront;
    }
    for (var j = 0; j < script.backCameraObjects.length; j++) {
        script.backCameraObjects[j].enabled = !isFront;
    }
}

function updateSegmentationMask() {
    script.segmentedCamera.maskTexture = (isFrontCamera && isFaceFound) ? script.segmentedTexture : null;
}

function onCameraFront() {
    isFrontCamera = true;
    updateCameraObjects(true);
    updateSegmentationMask();

    if (!hasPlayedFireworks) {
        playFireworksDelayTween();
    }
}

function onCameraBack() {
    isFrontCamera = false;
    updateCameraObjects(false);
    updateSegmentationMask();
    global.tweenManager.stopTween(script.delayTweenObject, "fireWork Delay");
    script.fireWorksAudio.stop(false);
}

function onFaceFound() {
    isFaceFound = true;
    updateSegmentationMask();
}

function onFaceLost() {
    isFaceFound = false;
    updateSegmentationMask();
}

function playFireworksDelayTween() {
    if (!hasPlayedFireworks && isFrontCamera) {
        hasPlayedFireworks = true;
        global.tweenManager.startTween(script.delayTweenObject, "fireWork Delay", onFireworksDelayComplete);
    }
}

function onFireworksDelayComplete() {
    if (isFrontCamera) {
        script.fireWorksAudio.play(1);
        script.fireWorksImage.mainPass.baseTex.control.play(1, 0);
    }
}

// Bind Events
script.createEvent("OnStartEvent").bind(init);
script.createEvent("CameraFrontEvent").bind(onCameraFront);
script.createEvent("CameraBackEvent").bind(onCameraBack);
script.createEvent("FaceFoundEvent").bind(onFaceFound);
script.createEvent("FaceLostEvent").bind(onFaceLost);


