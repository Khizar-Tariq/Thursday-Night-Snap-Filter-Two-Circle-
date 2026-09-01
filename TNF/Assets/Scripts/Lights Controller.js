// @input Component.Image wheelLights
// @input Asset.Texture[] lightsTexture
// @input float textureChangeSpeed = 0.1 {"label":"Change Speed (sec)"}
// @input bool loop = true {"label":"Loop Animation"}
// @input bool preloadTextures = true {"label":"Preload Textures"}

var currentIndex = 0;
var timer = 0.0;

// Preload state variables
var isPreloading = false;
var preloadIndex = 0;
var preloadTimer = 0.0;
var PRELOAD_STEP_TIME = 0.01; // 0.01s step per frame to upload textures to GPU VRAM
var originalColor = new vec4(1.0, 1.0, 1.0, 1.0);

function setAlpha(alpha) {
    if (script.wheelLights && script.wheelLights.mainPass && script.wheelLights.mainPass.baseColor) {
        script.wheelLights.mainPass.baseColor = new vec4(
            originalColor.x,
            originalColor.y,
            originalColor.z,
            alpha
        );
    }
}

function init() {
    // Auto-detect Component.Image if not assigned in Inspector
    if (!script.wheelLights) {
        script.wheelLights = script.getSceneObject().getComponent("Component.Image");
    }

    if (!script.wheelLights || !script.lightsTexture || script.lightsTexture.length === 0) {
        return;
    }

    // Cache original material baseColor
    if (script.wheelLights.mainPass && script.wheelLights.mainPass.baseColor) {
        var c = script.wheelLights.mainPass.baseColor;
        originalColor = new vec4(c.x, c.y, c.z, c.w);
    }

    // Start preloading if enabled and we have multiple textures
    if (script.preloadTextures && script.lightsTexture.length > 1) {
        isPreloading = true;
        preloadIndex = 0;
        preloadTimer = 0.0;

        // Make invisible while pre-warming GPU texture cache
        setAlpha(0.0);
        setTexture(0);
    } else {
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
    if (!script.lightsTexture || script.lightsTexture.length === 0) {
        return;
    }

    // --- Preload Phase (Uploads each texture to GPU with alpha 0) ---
    if (isPreloading) {
        preloadTimer += getDeltaTime();
        if (preloadTimer >= PRELOAD_STEP_TIME) {
            preloadTimer = 0.0;
            preloadIndex++;

            if (preloadIndex < script.lightsTexture.length) {
                setTexture(preloadIndex);
            } else {
                // Preload complete! All textures are now resident in GPU memory
                isPreloading = false;
                currentIndex = 0;
                timer = 0.0;
                setAlpha(originalColor.w);
                setTexture(0);
            }
        }
        return;
    }

    // --- Normal Animation Phase ---
    if (script.lightsTexture.length <= 1) {
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