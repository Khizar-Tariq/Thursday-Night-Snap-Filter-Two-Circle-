// @input Component.AudioComponent audioComponent
// @input Component.Text lyricsText
// @input Component.Text lyricsText2
// @input Component.ScreenTransform lyricsScreenTransform
// @input float totalLoopDuration = 29.4
// @input float timeOffset = 0.0 {"label":"Time Offset (sec) +early / -late"}
// @input float fadeInDuration = 0.20
// @input float fadeOutDuration = 0.20

// @ui {"widget":"group_start", "label":"Zoom / Pop Animation"}
// @input bool enablePopAnimation = true {"label":"Enable Pop Animation"}
// @input float popStartScale = 0.80 {"label":"Start Zoom Scale", "widget":"slider", "min":0.3, "max":1.0, "step":0.05}
// @input float popPeakScale = 1.15 {"label":"Peak Zoom (Overshoot)", "widget":"slider", "min":1.0, "max":1.6, "step":0.05}
// @input float popExitScale = 0.90 {"label":"Fade-out Shrink Scale", "widget":"slider", "min":0.5, "max":1.0, "step":0.05}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Audio & Debug"}
// @input bool playAudioOnStart = true
// @input bool debugMode = true {"label":"Debug Logging"}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Colors"}
// @input vec4 baseColor = {1.0, 1.0, 1.0, 1.0} {"widget":"color"}
// @input vec4 outlineColor = {0.0, 0.0, 0.0, 1.0} {"widget":"color"}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Lyrics Visibilty Controller"}
// @input SceneObject lyricsBtn
// @input SceneObject handsHint
// @input Component.InteractionComponent lyricsInteraction
// @input Component.Image lyricsImage
// @input Asset.Texture lyricsOn
// @input Asset.Texture lyricsOff
// @input float buttonLeadTime = 0.0 {"label":"Button Lead Time (sec)"}
// @ui {"widget":"group_end"}

// @input SceneObject spotLight

/**
 * Hard-coded lyrics data for Lens Studio
 * Trimmed :33 - 1:02 loop (:00 to ~29.4s)
 */
var lyricsData = [
    // --- Intro / Build-up ---
    { start: 0.00, end: 1.95, text: "EVERY THURSDAY NIGHT" },
    { start: 2.00, end: 3.85, text: "WE GON' LET 'EM KNOW" },

    // --- Chorus ---
    { start: 3.90, end: 5.40, text: "WHEN WE COME TO TOWN" },
    { start: 5.40, end: 6.90, text: "WE GON' LET 'EM KNOW" },
    { start: 7.03, end: 8.25, text: "WE DON'T PLAY AROUND" },
    { start: 8.25, end: 9.50, text: "WE GON' LET 'EM KNOW" },
    { start: 9.63, end: 11.00, text: "DO EVERYTHING TO WIN" },
    { start: 11.00, end: 12.35, text: "AND SOMETHING'S GOTTA GIVE" },
    { start: 12.47, end: 14.10, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 14.10, end: 15.70, text: "WE GON' LET 'EM KNOW" },
    { start: 15.80, end: 17.25, text: "WHEN WE COME TO TOWN" },
    { start: 17.25, end: 18.70, text: "WE GON' LET 'EM KNOW" },
    { start: 18.80, end: 20.10, text: "EVERY SINGLE DOWN" },
    { start: 20.20, end: 21.35, text: "WE GON' LET 'EM KNOW" },
    { start: 21.47, end: 22.85, text: "DO EVERYTHING TO WIN" },
    { start: 22.85, end: 24.20, text: "AND SOMETHING'S GOTTA GIVE" },
    { start: 24.30, end: 25.85, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 25.85, end: 27.40, text: "WE GON' LET 'EM KNOW" }
    // 27.40s - 29.40s: Whistle & transition beats, then clean loop reset
];

var audioPosition = 0.0;   // tracks elapsed playback time
var targetTransform = null;
var initialScale = new vec3(1.0, 1.0, 1.0);
var currentLyricIndex = -1;
var isRestarting = false;
var lastDebugAlpha = -1;
var areLyricsEnabled = true;
var hasEnabledLyricsBtn = false;
var hasClickedLyricsBtn = false;

// --- Easing functions for smooth pop & fade animations ---
function easeOutBackCustom(x, overshoot) {
    var c1 = overshoot * 1.70158;
    var c3 = c1 + 1.0;
    return 1.0 + c3 * Math.pow(x - 1.0, 3) + c1 * Math.pow(x - 1.0, 2);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function smoothStep(min, max, x) {
    var t = clamp((x - min) / (max - min), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}

function updateLyricsBtnTexture() {
    if (!script.lyricsImage) return;

    var tex = areLyricsEnabled ? script.lyricsOn : script.lyricsOff;
    if (tex) {
        script.lyricsImage.mainPass.baseTex = tex;
    }
}

function setLyricsText(textStr) {
    if (script.lyricsText) {
        script.lyricsText.text = textStr;
    }
    if (script.lyricsText2) {
        script.lyricsText2.text = textStr;
    }
}

function onToggleLyrics() {
    // On first click, dismiss handsHint tween
    if (!hasClickedLyricsBtn) {
        hasClickedLyricsBtn = true;
        if (global.tweenManager && script.handsHint) {
            global.tweenManager.stopTween(script.handsHint, "Fade In");
            global.tweenManager.startTween(script.handsHint, "Fade Out");
        }
    }

    areLyricsEnabled = !areLyricsEnabled;
    updateLyricsBtnTexture();

    if (!areLyricsEnabled) {
        setLyricsText("");
        applyVisuals(0.0, 1.0);
    }
}

// --- Initialization ---
function init() {
    // Auto-detect Text Component if not assigned
    if (!script.lyricsText && !script.lyricsText2) {
        script.lyricsText = script.getSceneObject().getComponent("Component.Text");
    }
    print("[DBG] lyricsText: " + (script.lyricsText ? "FOUND" : "NULL"));
    print("[DBG] lyricsText2: " + (script.lyricsText2 ? "FOUND" : "NULL"));

    // Auto-detect Audio Component if not assigned
    if (!script.audioComponent) {
        script.audioComponent = script.getSceneObject().getComponent("Component.AudioComponent");
    }
    print("[DBG] audioComponent: " + (script.audioComponent ? "FOUND" : "NULL - assign in Inspector!"));
    print("[DBG] playAudioOnStart: " + script.playAudioOnStart);
    print("[DBG] totalLoopDuration: " + script.totalLoopDuration);
    print("[DBG] First lyric at: " + lyricsData[0].start + "s");

    // Target object for pop/scale animations — uses ScreenTransform's SceneObject
    var screenTf = script.lyricsScreenTransform;
    if (!screenTf && script.lyricsText) {
        screenTf = script.lyricsText.getSceneObject().getComponent("Component.ScreenTransform");
    }
    if (!screenTf && script.lyricsText2) {
        screenTf = script.lyricsText2.getSceneObject().getComponent("Component.ScreenTransform");
    }
    print("[DBG] screenTransform: " + (screenTf ? "FOUND" : "NULL (pop animation disabled)"));

    if (screenTf) {
        targetTransform = screenTf.getSceneObject().getTransform();
        if (targetTransform) {
            initialScale = targetTransform.getLocalScale();
            print("[DBG] initialScale: " + initialScale);
        }
    }

    // Ensure lyrics button starts disabled until the first lyric appears
    if (script.lyricsBtn) {
        script.lyricsBtn.enabled = false;
    }

    // Set default initial button texture
    updateLyricsBtnTexture();

    // Hook up InteractionComponent or tap fallback
    if (script.lyricsInteraction) {
        if (script.lyricsInteraction.onTap) {
            script.lyricsInteraction.onTap.add(onToggleLyrics);
        } else if (script.lyricsInteraction.onTouchEnd) {
            script.lyricsInteraction.onTouchEnd.add(onToggleLyrics);
        }
    }

    // Clear initial text & opacity
    setLyricsText("");
    applyVisuals(0.0, 1.0);

    startPlayback();
}

function startPlayback() {
    audioPosition = 0.0;
    currentLyricIndex = -1;
    isRestarting = false;
    print("[DBG] startPlayback() called");

    if (script.audioComponent && script.playAudioOnStart) {
        try {
            if (script.audioComponent.isPlaying()) {
                script.audioComponent.stop(false);
            }
            script.audioComponent.play(1);
            print("[DBG] Audio play() called");
        } catch (e) {
            print("[DBG] Audio play ERROR: " + e);
        }
    } else {
        print("[DBG] No audio or playAudioOnStart=false");
    }
}

function applyTextVisuals(txtComp, alpha) {
    if (!txtComp) return;

    if (txtComp.textFill) {
        var baseA = script.baseColor ? script.baseColor.w : 1.0;
        var r = script.baseColor ? script.baseColor.x : 1.0;
        var g = script.baseColor ? script.baseColor.y : 1.0;
        var b = script.baseColor ? script.baseColor.z : 1.0;
        txtComp.textFill.color = new vec4(r, g, b, baseA * alpha);
    } else {
        txtComp.enabled = (alpha > 0.01);
    }

    if (txtComp.outlineSettings && txtComp.outlineSettings.fill) {
        var outA = script.outlineColor ? script.outlineColor.w : 1.0;
        var or = script.outlineColor ? script.outlineColor.x : 0.0;
        var og = script.outlineColor ? script.outlineColor.y : 0.0;
        var ob = script.outlineColor ? script.outlineColor.z : 0.0;
        txtComp.outlineSettings.fill.color = new vec4(or, og, ob, outA * alpha);
    }
}

// Apply text alpha and pop scale
function applyVisuals(alpha, scaleFactor) {
    alpha = clamp(alpha, 0.0, 1.0);

    // Debug: log alpha changes
    if (script.debugMode && Math.abs(alpha - lastDebugAlpha) > 0.05) {
        lastDebugAlpha = alpha;
        print("[DBG] applyVisuals alpha=" + alpha.toFixed(2) + " scale=" + scaleFactor.toFixed(2));
    }

    applyTextVisuals(script.lyricsText, alpha);
    applyTextVisuals(script.lyricsText2, alpha);

    // Apply pop scale transform
    if (script.enablePopAnimation && targetTransform) {
        targetTransform.setLocalScale(new vec3(
            initialScale.x * scaleFactor,
            initialScale.y * scaleFactor,
            initialScale.z * scaleFactor
        ));
    }
}

// --- Frame Update ---
function onUpdate() {
    audioPosition += getDeltaTime();

    if (script.debugMode) {
        var posRounded = Math.floor(audioPosition);
        if (posRounded > 0 && posRounded % 2 === 0 && audioPosition - posRounded < 0.05) {
            print("[DBG] audioPosition: " + audioPosition.toFixed(2) + "s");
        }
    }

    // Loop reset
    if (script.totalLoopDuration > 0.0 && audioPosition >= script.totalLoopDuration && !isRestarting) {
        isRestarting = true;
        setLyricsText("");
        applyVisuals(0.0, 1.0);
        startPlayback();
        return;
    }

    // Apply timeOffset so lyrics can be nudged early/late from Inspector
    var loopTime = audioPosition + (script.timeOffset || 0.0);
    var activeLyric = null;
    var activeIndex = -1;

    for (var i = 0; i < lyricsData.length; i++) {
        var item = lyricsData[i];
        if (loopTime >= item.start && loopTime < item.end) {
            activeLyric = item;
            activeIndex = i;
            break;
        }
    }

    // Enable lyrics button early by buttonLeadTime (default 1.0s) before the first lyric appears
    var leadTime = (script.buttonLeadTime !== undefined) ? script.buttonLeadTime : 1.0;
    if (!hasEnabledLyricsBtn && loopTime >= (lyricsData[0].start - leadTime)) {
        hasEnabledLyricsBtn = true;
        if (script.lyricsBtn) {
            script.lyricsBtn.enabled = true;
            global.tweenManager.startTween(script.spotLight, "Turn On");
            global.tweenManager.startTween(script.spotLight, "Move Down");
        }
    }

    // If lyrics are toggled OFF by the user, don't show text
    if (!areLyricsEnabled) {
        setLyricsText("");
        applyVisuals(0.0, 1.0);
        return;
    }

    if (activeLyric) {
        // Change text string when moving to a new lyric line
        if (currentLyricIndex !== activeIndex) {
            currentLyricIndex = activeIndex;
            setLyricsText(activeLyric.text);
            if (script.debugMode) {
                print("[DBG] LYRIC #" + activeIndex + " at t=" + audioPosition.toFixed(2) + "s -> \"" + activeLyric.text + "\"");
            }
        }

        var lyricDuration = activeLyric.end - activeLyric.start;
        var lyricElapsed = loopTime - activeLyric.start;
        var fadeIn = Math.min(script.fadeInDuration, lyricDuration * 0.4);
        var fadeOut = Math.min(script.fadeOutDuration, lyricDuration * 0.4);

        var alpha = 1.0;
        var scale = 1.0;

        if (lyricElapsed < fadeIn) {
            // Fade In & Pop Up phase
            var progressIn = lyricElapsed / fadeIn;
            alpha = smoothStep(0.0, 1.0, progressIn);
            if (script.enablePopAnimation) {
                var startS = (script.popStartScale !== undefined) ? script.popStartScale : 0.80;
                var peakS = (script.popPeakScale !== undefined) ? script.popPeakScale : 1.15;
                // Calculate overshoot factor relative to base 1.0
                var overshoot = Math.max(0.0, peakS - 1.0) * 8.0;
                var easeVal = easeOutBackCustom(progressIn, overshoot);
                scale = startS + (1.0 - startS) * easeVal;
            }
        } else if (lyricElapsed > (lyricDuration - fadeOut)) {
            // Fade Out phase
            var progressOut = (lyricDuration - lyricElapsed) / fadeOut;
            alpha = smoothStep(0.0, 1.0, progressOut);
            if (script.enablePopAnimation) {
                var exitS = (script.popExitScale !== undefined) ? script.popExitScale : 0.90;
                scale = exitS + (1.0 - exitS) * progressOut;
            }
        } else {
            // Sustain / full view
            alpha = 1.0;
            scale = 1.0;
        }

        applyVisuals(alpha, scale);
    } else {
        // Between lyrics or after all lyrics before loop restart
        currentLyricIndex = -1;
        setLyricsText("");
        applyVisuals(0.0, 1.0);
    }
}

// Bind Events
var startEvent = script.createEvent("OnStartEvent");
startEvent.bind(init);

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);
