// @input Component.Image wheelLights
// @input Asset.Texture[] lightsTexture
// @input float textureChangeSpeed = 0.1 {"label":"Change Speed (sec)"}
// @input bool loop = true {"label":"Loop Animation"}
// @input bool prewarm = true {"label":"Pre-warm Textures"}

var currentIndex = 0;
var timer = 0.0;
var prewarmContainer = null;

function init() {
    // Auto-detect Component.Image if not assigned in Inspector
    if (!script.wheelLights) {
        script.wheelLights = script.getSceneObject().getComponent("Component.Image");
    }

    if (script.prewarm) {
        prewarmTextures();
    }

    if (script.wheelLights && script.lightsTexture && script.lightsTexture.length > 0) {
        setTexture(0);
    }
}

/**
 * Pre-warms all textures into GPU VRAM on startup by binding each texture
 * to a zero-opacity Image component in the scene hierarchy.
 * This prevents the 1-frame lazy-load blink on the first loop cycle.
 */
function prewarmTextures() {
    if (!script.lightsTexture || script.lightsTexture.length <= 1) {
        return;
    }

    var parentObj = script.getSceneObject();
    var hasScreenTransform = parentObj.getComponent("Component.ScreenTransform") !== null;

    prewarmContainer = global.scene.createSceneObject("Prewarm_Lights_Textures");
    prewarmContainer.setParent(parentObj);

    if (hasScreenTransform) {
        prewarmContainer.createComponent("Component.ScreenTransform");
    }

    for (var i = 0; i < script.lightsTexture.length; i++) {
        var tex = script.lightsTexture[i];
        if (!tex) {
            continue;
        }

        var dummyObj = global.scene.createSceneObject("Prewarm_Tex_" + i);
        dummyObj.setParent(prewarmContainer);

        if (hasScreenTransform) {
            dummyObj.createComponent("Component.ScreenTransform");
        }

        var dummyImg = dummyObj.createComponent("Component.Image");

        if (script.wheelLights && script.wheelLights.mainMaterial && script.wheelLights.mainMaterial.clone) {
            dummyImg.mainMaterial = script.wheelLights.mainMaterial.clone();
        }

        if (dummyImg.mainPass) {
            dummyImg.mainPass.baseTex = tex;
            if (dummyImg.mainPass.baseColor !== undefined) {
                dummyImg.mainPass.baseColor = new vec4(0, 0, 0, 0);
            }
            if (dummyImg.mainPass.color !== undefined) {
                dummyImg.mainPass.color = new vec4(0, 0, 0, 0);
            }
        }
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