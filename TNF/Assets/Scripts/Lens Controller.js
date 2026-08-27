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
var hasPlayedFireworks = false;

function checkCamera() {
    if (global.scene && typeof global.scene.getCameraType === "function") {
        return global.scene.getCameraType() !== "back";
    }
    return true;
}

function init() {
    isFrontCamera = checkCamera();
    updateCameraObjects(isFrontCamera);
    updateSegmentationMask();

    if (isFrontCamera) {
        playFireworksDelayTween();
    }
}

function updateCameraObjects(isFront) {
    if (script.frontCameraObjects) {
        for (var i = 0; i < script.frontCameraObjects.length; i++) {
            if (script.frontCameraObjects[i]) {
                script.frontCameraObjects[i].enabled = isFront;
            }
        }
    }
    if (script.backCameraObjects) {
        for (var j = 0; j < script.backCameraObjects.length; j++) {
            if (script.backCameraObjects[j]) {
                script.backCameraObjects[j].enabled = !isFront;
            }
        }
    }
}

function updateSegmentationMask() {
    if (!script.segmentedCamera) {
        return;
    }
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

    if (!hasPlayedFireworks) {
        playFireworksDelayTween();
    }
}

function onCameraBack() {
    isFrontCamera = false;
    updateCameraObjects(false);
    updateSegmentationMask();

    // If fireworks tween was queued, stop it when switching to back camera
    if (global.tweenManager && script.delayTweenObject) {
        global.tweenManager.stopTween(script.delayTweenObject, "fireWork Delay");
    }
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
    if (hasPlayedFireworks || !isFrontCamera) {
        return;
    }

    if (global.tweenManager && script.delayTweenObject) {
        hasPlayedFireworks = true;
        global.tweenManager.startTween(script.delayTweenObject, "fireWork Delay", onFireworksDelayComplete);
    }
}

function onFireworksDelayComplete() {
    // Double check we are still on front camera before playing animation
    if (!isFrontCamera || !script.fireWorksImage) {
        return;
    }

    var pass = script.fireWorksImage.mainPass;
    if (!pass) return;

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
