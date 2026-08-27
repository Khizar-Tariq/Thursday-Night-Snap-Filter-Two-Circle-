// @input Component.Image wheelLights
// @input Asset.Texture[] lightsTexture
// @input float textureChangeSpeed = 0.1 {"label":"Change Speed (sec)"}
// @input bool loop = true {"label":"Loop Animation"}

var currentIndex = 0;
var timer = 0.0;

function init() {
    // Auto-detect Component.Image if not assigned in Inspector
    if (!script.wheelLights) {
        script.wheelLights = script.getSceneObject().getComponent("Component.Image");
    }

    if (script.wheelLights && script.lightsTexture && script.lightsTexture.length > 0) {
        setTexture(0);
    }
}

function setTexture(index) {
    if (!script.wheelLights || !script.lightsTexture || script.lightsTexture.length === 0) {
        return;
    }

    var tex = script.lightsTexture[index];
    if (tex && script.wheelLights.mainPass) {
        script.wheelLights.mainPass.baseTex = tex;
    }
}

function onUpdate() {
    if (!script.lightsTexture || script.lightsTexture.length <= 1) {
        return;
    }

    var speed = (script.textureChangeSpeed && script.textureChangeSpeed > 0) ? script.textureChangeSpeed : 0.1;
    timer += getDeltaTime();

    if (timer >= speed) {
        timer = 0.0;
        currentIndex++;

        if (currentIndex >= script.lightsTexture.length) {
            if (script.loop) {
                currentIndex = 0;
            } else {
                currentIndex = script.lightsTexture.length - 1;
                return;
            }
        }

        setTexture(currentIndex);
    }
}

var startEvent = script.createEvent("OnStartEvent");
startEvent.bind(init);

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);