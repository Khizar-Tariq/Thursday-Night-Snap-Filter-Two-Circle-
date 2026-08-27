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
// @ui {"widget":"group_end"}

var isFrontCamera = true;
var isFaceFound = false;

function init() {
    updateCameraObjects(isFrontCamera);
    updateSegmentationMask();
    playFireworksDelayTween();
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
    if (isFrontCamera && isFaceFound) {
        script.segmentedCamera.maskTexture = script.segmentedTexture;
    } else {
        script.segmentedCamera.maskTexture = null;
    }
}

function onCameraFront() {
    isFrontCamera = true;
    updateCameraObjects(true);
    updateSegmentationMask();
}

function onCameraBack() {
    isFrontCamera = false;
    updateCameraObjects(false);
    updateSegmentationMask();
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
    if (global.tweenManager && script.delayTweenObject) {
        global.tweenManager.startTween(script.delayTweenObject, "fireWork Delay", onFireworksDelayComplete);
    }
}

function onFireworksDelayComplete() {
    var pass = script.fireWorksImage.mainPass;
    var tex = pass.baseTex || pass.mainTex;
    if (tex && tex.play) {
        tex.play(1, 0);
    } else if (pass.baseTex && pass.baseTex.control) {
        pass.baseTex.control.play(1, 0);
    }
}

// Bind Events
script.createEvent("OnStartEvent").bind(init);
script.createEvent("CameraFrontEvent").bind(onCameraFront);
script.createEvent("CameraBackEvent").bind(onCameraBack);
script.createEvent("FaceFoundEvent").bind(onFaceFound);
script.createEvent("FaceLostEvent").bind(onFaceLost);
