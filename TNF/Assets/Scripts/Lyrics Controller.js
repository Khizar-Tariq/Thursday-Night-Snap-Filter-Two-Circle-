// @input Component.AudioComponent audioComponent
// @input Component.Text lyricsText
// @input Component.ScreenTransform lyricsScreenTransform
// @input float totalLoopDuration = 184.0
// @input float timeOffset = 0.0 {"label":"Time Offset (sec) +early / -late"}
// @input float fadeInDuration = 0.20
// @input float fadeOutDuration = 0.20

// @input bool enablePopAnimation = true
// @input bool playAudioOnStart = true
// @input bool debugMode = true {"label":"Debug Logging"}
// @input vec4 baseColor = {1.0, 1.0, 1.0, 1.0} {"widget":"color"}
// @input vec4 outlineColor = {0.0, 0.0, 0.0, 1.0} {"widget":"color"}

/**
 * Hard-coded lyrics data for Lens Studio
 * Exact 30fps timestamps from audio transcription
 */
var lyricsData = [
    // --- Verse 1 ---
    { start: 11.70, end: 14.60, text: "Been a hard day's work, grindin' me to the bone" },
    { start: 14.70, end: 17.65, text: "I'm covered in dirt, gotta fend for my own" },
    { start: 17.77, end: 20.40, text: "Been burnin' these candles at both ends" },
    { start: 20.53, end: 23.30, text: "But a handful of dollars is all I get" },

    // --- Pre-Chorus 1 ---
    { start: 23.40, end: 26.50, text: "I said Monday, Tuesday, I've been dry" },
    { start: 26.60, end: 29.60, text: "I barely made it out alive" },
    { start: 29.70, end: 32.50, text: "Wednesday almost lost my mind" },
    { start: 32.60, end: 36.40, text: "But every Thursday night, we gon' let 'em know" },

    // --- Chorus 1 ---
    { start: 36.50, end: 39.50, text: "When we come to town, we gon' let 'em know" },
    { start: 39.63, end: 42.10, text: "We don't play around, we gon' let 'em know" },
    { start: 42.23, end: 44.95, text: "Do everything to win, and something's gotta give" },
    { start: 45.07, end: 48.30, text: "If you don't know what it is, we gon' let 'em know" },
    { start: 48.40, end: 51.30, text: "When we come to town, we gon' let 'em know" },
    { start: 51.40, end: 52.70, text: "Every single down, we" },
    { start: 52.80, end: 53.95, text: "Gon' let 'em know" },
    { start: 54.07, end: 56.80, text: "Do everything to win, and something's gotta give" },
    { start: 56.90, end: 60.00, text: "If you don't know what it is, we gon' let 'em know" },

    // --- Verse 2 ---
    { start: 62.13, end: 64.75, text: "It's Thursday night, we've been out on the road" },
    { start: 64.83, end: 66.70, text: "Somebody hit those lights" },
    { start: 66.80, end: 67.90, text: "Let's get ready to roll" },
    { start: 67.97, end: 69.40, text: "When the fans go loud" },
    { start: 69.50, end: 73.50, text: "The band goes crazy, when the drumline rolls: All In" },

    // --- Pre-Chorus 2 ---
    { start: 73.67, end: 76.90, text: "I said Monday, Tuesday, I've been dry" },
    { start: 77.00, end: 79.95, text: "I barely made it out alive" },
    { start: 80.03, end: 82.85, text: "Wednesday almost lost my mind" },
    { start: 82.97, end: 86.75, text: "But every Thursday night, we gon' let 'em know" },

    // --- Chorus 2 ---
    { start: 86.87, end: 89.50, text: "When we come to town, we gon' let 'em know" },
    { start: 89.63, end: 92.50, text: "And we don't play around, we gon' let 'em know" },
    { start: 92.63, end: 95.35, text: "Do everything to win, then something's gotta give" },
    { start: 95.47, end: 98.60, text: "If you don't know what it is, we gon' let 'em know" },
    { start: 98.73, end: 101.60, text: "When we come to town, we gon' let 'em know" },
    { start: 101.73, end: 103.10, text: "Every single down, we" },
    { start: 103.17, end: 104.40, text: "Gon' let 'em know" },
    { start: 104.47, end: 105.80, text: "Do everything to win" },
    { start: 105.90, end: 107.20, text: "Then something's gotta give" },
    { start: 107.30, end: 108.70, text: "If you don't know what it is" },
    { start: 108.80, end: 112.50, text: "We gon' let 'em know" },

    // --- Bridge / Post-Chorus ---
    { start: 114.13, end: 116.50, text: "Whoa..." },
    { start: 116.97, end: 120.00, text: "Go on let 'em know" },

    // --- Pre-Chorus 3 ---
    { start: 120.97, end: 124.25, text: "I said Monday, Tuesday, I've been dry" },
    { start: 124.37, end: 127.60, text: "I barely made it out alive" },
    { start: 127.73, end: 130.30, text: "Wednesday almost lost my mind" },
    { start: 130.40, end: 134.20, text: "But every Thursday night, we gon' let 'em know" },

    // --- Final Chorus ---
    { start: 134.30, end: 136.90, text: "When we come to town, we gon' let 'em know" },
    { start: 137.03, end: 139.95, text: "And we don't play around, we gon' let 'em know" },
    { start: 140.10, end: 142.75, text: "Do everything to win, if something's gotta give" },
    { start: 142.87, end: 146.05, text: "If you don't know what it is, we gon' let 'em know" },
    { start: 146.17, end: 149.05, text: "When we come to town, we gon' let 'em know" },
    { start: 149.17, end: 151.75, text: "Every single down, we gon' let 'em know" },
    { start: 151.87, end: 154.60, text: "Do everything to win, if something's gotta give" },
    { start: 154.70, end: 158.00, text: "If you don't know what it is, we gon' let 'em know" },

    // --- Outro ---
    { start: 161.50, end: 164.20, text: "Whoa..." },
    { start: 164.43, end: 166.90, text: "Go on and let 'em know" },
    { start: 167.03, end: 172.00, text: "Whoa, we gon' let 'em know" }
];

var audioPosition = 0.0;   // tracks elapsed playback time
var targetTransform = null;
var initialScale  = new vec3(1.0, 1.0, 1.0);
var currentLyricIndex = -1;
var isRestarting  = false;
var lastDebugAlpha = -1;

// --- Easing functions for smooth pop & fade animations ---
function easeOutBack(x) {
    var c1 = 1.70158;
    var c3 = c1 + 1.0;
    return 1.0 + c3 * Math.pow(x - 1.0, 3) + c1 * Math.pow(x - 1.0, 2);
}

function easeOutCubic(x) {
    return 1.0 - Math.pow(1.0 - x, 3);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function smoothStep(min, max, x) {
    var t = clamp((x - min) / (max - min), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}

// --- Initialization ---
function init() {
    // Auto-detect Text Component if not assigned
    if (!script.lyricsText) {
        script.lyricsText = script.getSceneObject().getComponent("Component.Text");
    }
    print("[DBG] lyricsText: " + (script.lyricsText ? "FOUND" : "NULL - assign in Inspector!"));
    if (script.lyricsText) {
        print("[DBG] textFill: " + (script.lyricsText.textFill ? "OK" : "NULL"));
        print("[DBG] text visible: " + script.lyricsText.enabled);
    }

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
    print("[DBG] screenTransform: " + (screenTf ? "FOUND" : "NULL (pop animation disabled)"));

    if (screenTf) {
        targetTransform = screenTf.getSceneObject().getTransform();
        if (targetTransform) {
            initialScale = targetTransform.getLocalScale();
            print("[DBG] initialScale: " + initialScale);
        }
    }

    // Clear initial text & opacity
    if (script.lyricsText) {
        script.lyricsText.text = "";
        applyVisuals(0.0, 1.0);
    }

    startPlayback();
}

function startPlayback() {
    audioPosition     = 0.0;
    currentLyricIndex = -1;
    isRestarting      = false;
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

// Apply text alpha and pop scale
function applyVisuals(alpha, scaleFactor) {
    alpha = clamp(alpha, 0.0, 1.0);

    // Debug: log alpha changes
    if (script.debugMode && Math.abs(alpha - lastDebugAlpha) > 0.05) {
        lastDebugAlpha = alpha;
        print("[DBG] applyVisuals alpha=" + alpha.toFixed(2) + " scale=" + scaleFactor.toFixed(2)
              + " | textFill=" + (script.lyricsText && script.lyricsText.textFill ? "OK" : "NULL"));
    }

    if (script.lyricsText && script.lyricsText.textFill) {
        var baseA = script.baseColor ? script.baseColor.w : 1.0;
        var r = script.baseColor ? script.baseColor.x : 1.0;
        var g = script.baseColor ? script.baseColor.y : 1.0;
        var b = script.baseColor ? script.baseColor.z : 1.0;
        script.lyricsText.textFill.color = new vec4(r, g, b, baseA * alpha);
    } else if (script.lyricsText) {
        // Fallback: textFill not available, ensure Text component itself is enabled
        print("[DBG] WARNING: textFill is null! Trying to keep text enabled.");
        script.lyricsText.enabled = (alpha > 0.01);
    }

    // Apply color alpha to Outline if present
    if (script.lyricsText && script.lyricsText.outlineSettings && script.lyricsText.outlineSettings.fill) {
        var outA = script.outlineColor ? script.outlineColor.w : 1.0;
        var or = script.outlineColor ? script.outlineColor.x : 0.0;
        var og = script.outlineColor ? script.outlineColor.y : 0.0;
        var ob = script.outlineColor ? script.outlineColor.z : 0.0;
        script.lyricsText.outlineSettings.fill.color = new vec4(or, og, ob, outA * alpha);
    }

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
        if (script.lyricsText) script.lyricsText.text = "";
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

    if (activeLyric) {
        // Change text string when moving to a new lyric line
        if (currentLyricIndex !== activeIndex) {
            currentLyricIndex = activeIndex;
            if (script.lyricsText) {
                script.lyricsText.text = activeLyric.text;
                if (script.debugMode) {
                    print("[DBG] LYRIC #" + activeIndex + " at t=" + audioPosition.toFixed(2) + "s -> \"" + activeLyric.text.substring(0, 30) + "\"");
                }
            }
        }

        var lyricDuration = activeLyric.end - activeLyric.start;
        var lyricElapsed  = loopTime - activeLyric.start;
        var fadeIn = Math.min(script.fadeInDuration, lyricDuration * 0.4);
        var fadeOut = Math.min(script.fadeOutDuration, lyricDuration * 0.4);

        var alpha = 1.0;
        var scale = 1.0;

        if (lyricElapsed < fadeIn) {
            // Fade In & Pop Up phase
            var progressIn = lyricElapsed / fadeIn;
            alpha = smoothStep(0.0, 1.0, progressIn);
            if (script.enablePopAnimation) {
                // Scale from 0.85 with pop overshoot to 1.0
                scale = 0.85 + 0.15 * easeOutBack(progressIn);
            }
        } else if (lyricElapsed > (lyricDuration - fadeOut)) {
            // Fade Out phase
            var progressOut = (lyricDuration - lyricElapsed) / fadeOut;
            alpha = smoothStep(0.0, 1.0, progressOut);
            if (script.enablePopAnimation) {
                // Slight shrink out
                scale = 0.95 + 0.05 * progressOut;
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
        if (script.lyricsText) {
            script.lyricsText.text = "";
        }
        applyVisuals(0.0, 1.0);
    }
}

// Bind Events
var startEvent = script.createEvent("OnStartEvent");
startEvent.bind(init);

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);
