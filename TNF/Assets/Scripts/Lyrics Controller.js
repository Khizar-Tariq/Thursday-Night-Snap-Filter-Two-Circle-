// @input Component.AudioComponent audioComponent
// @input Component.Text lyricsText
// @input Component.Text lyricsText2
// @input Component.ScreenTransform lyricsScreenTransform
// @input float totalLoopDuration = 184.0
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
// @input float buttonLeadTime = 1.0 {"label":"Button Lead Time (sec)"}
// @ui {"widget":"group_end"}

/**
 * Hard-coded lyrics data for Lens Studio
 * Clean 2-line formatted text with exact 30fps timestamps
 */
var lyricsData = [
    // --- Verse 1 ---
    { start: 11.70, end: 13.15, text: "BEEN A HARD DAY'S WORK" },
    { start: 13.15, end: 14.60, text: "GRINDIN' ME TO THE BONE" },
    { start: 14.70, end: 16.15, text: "I'M COVERED IN DIRT" },
    { start: 16.15, end: 17.65, text: "GOTTA FEND FOR MY OWN" },
    { start: 17.77, end: 19.10, text: "BEEN BURNIN' THESE CANDLES" },
    { start: 19.10, end: 20.40, text: "AT BOTH ENDS" },
    { start: 20.53, end: 21.90, text: "BUT A HANDFUL OF DOLLARS" },
    { start: 21.90, end: 23.30, text: "IS ALL I GET" },

    // --- Pre-Chorus 1 ---
    { start: 23.40, end: 24.95, text: "I SAID MONDAY, TUESDAY" },
    { start: 24.95, end: 26.50, text: "I'VE BEEN DRY" },
    { start: 26.60, end: 28.10, text: "I BARELY MADE IT" },
    { start: 28.10, end: 29.60, text: "OUT ALIVE" },
    { start: 29.70, end: 31.10, text: "WEDNESDAY ALMOST" },
    { start: 31.10, end: 32.50, text: "LOST MY MIND" },
    { start: 32.60, end: 34.50, text: "BUT EVERY THURSDAY NIGHT" },
    { start: 34.50, end: 36.40, text: "WE GON' LET 'EM KNOW" },

    // --- Chorus 1 ---
    { start: 36.50, end: 38.00, text: "WHEN WE COME TO TOWN" },
    { start: 38.00, end: 39.50, text: "WE GON' LET 'EM KNOW" },
    { start: 39.63, end: 40.85, text: "WE DON'T PLAY AROUND" },
    { start: 40.85, end: 42.10, text: "WE GON' LET 'EM KNOW" },
    { start: 42.23, end: 43.60, text: "DO EVERYTHING TO WIN" },
    { start: 43.60, end: 44.95, text: "AND SOMETHING'S GOTTA GIVE" },
    { start: 45.07, end: 46.70, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 46.70, end: 48.30, text: "WE GON' LET 'EM KNOW" },
    { start: 48.40, end: 49.85, text: "WHEN WE COME TO TOWN" },
    { start: 49.85, end: 51.30, text: "WE GON' LET 'EM KNOW" },
    { start: 51.40, end: 52.70, text: "EVERY SINGLE DOWN, WE" },
    { start: 52.80, end: 53.95, text: "GON' LET 'EM KNOW" },
    { start: 54.07, end: 55.45, text: "DO EVERYTHING TO WIN" },
    { start: 55.45, end: 56.80, text: "AND SOMETHING'S GOTTA GIVE" },
    { start: 56.90, end: 58.45, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 58.45, end: 60.00, text: "WE GON' LET 'EM KNOW" },

    // --- Verse 2 ---
    { start: 62.13, end: 63.45, text: "IT'S THURSDAY NIGHT" },
    { start: 63.45, end: 64.75, text: "WE'VE BEEN OUT ON THE ROAD" },
    { start: 64.83, end: 66.70, text: "SOMEBODY HIT THOSE LIGHTS" },
    { start: 66.80, end: 67.90, text: "LET'S GET READY TO ROLL" },
    { start: 67.97, end: 69.40, text: "WHEN THE FANS GO LOUD" },
    { start: 69.50, end: 71.50, text: "THE BAND GOES CRAZY" },
    { start: 71.50, end: 73.50, text: "WHEN THE DRUMLINE ROLLS: ALL IN" },

    // --- Pre-Chorus 2 ---
    { start: 73.67, end: 75.30, text: "I SAID MONDAY, TUESDAY" },
    { start: 75.30, end: 76.90, text: "I'VE BEEN DRY" },
    { start: 77.00, end: 78.50, text: "I BARELY MADE IT" },
    { start: 78.50, end: 79.95, text: "OUT ALIVE" },
    { start: 80.03, end: 81.45, text: "WEDNESDAY ALMOST" },
    { start: 81.45, end: 82.85, text: "LOST MY MIND" },
    { start: 82.97, end: 84.85, text: "BUT EVERY THURSDAY NIGHT" },
    { start: 84.85, end: 86.75, text: "WE GON' LET 'EM KNOW" },

    // --- Chorus 2 ---
    { start: 86.87, end: 88.20, text: "WHEN WE COME TO TOWN" },
    { start: 88.20, end: 89.50, text: "WE GON' LET 'EM KNOW" },
    { start: 89.63, end: 91.05, text: "AND WE DON'T PLAY AROUND" },
    { start: 91.05, end: 92.50, text: "WE GON' LET 'EM KNOW" },
    { start: 92.63, end: 94.00, text: "DO EVERYTHING TO WIN" },
    { start: 94.00, end: 95.35, text: "THEN SOMETHING'S GOTTA GIVE" },
    { start: 95.47, end: 97.05, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 97.05, end: 98.60, text: "WE GON' LET 'EM KNOW" },
    { start: 98.73, end: 100.15, text: "WHEN WE COME TO TOWN" },
    { start: 100.15, end: 101.60, text: "WE GON' LET 'EM KNOW" },
    { start: 101.73, end: 103.10, text: "EVERY SINGLE DOWN, WE" },
    { start: 103.17, end: 104.40, text: "GON' LET 'EM KNOW" },
    { start: 104.47, end: 105.80, text: "DO EVERYTHING TO WIN" },
    { start: 105.90, end: 107.20, text: "THEN SOMETHING'S GOTTA GIVE" },
    { start: 107.30, end: 108.70, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 108.80, end: 112.50, text: "WE GON' LET 'EM KNOW" },

    // --- Bridge / Post-Chorus ---
    { start: 114.13, end: 116.50, text: "WHOA..." },
    { start: 116.97, end: 120.00, text: "GO ON LET 'EM KNOW" },

    // --- Pre-Chorus 3 ---
    { start: 120.97, end: 122.60, text: "I SAID MONDAY, TUESDAY" },
    { start: 122.60, end: 124.25, text: "I'VE BEEN DRY" },
    { start: 124.37, end: 126.00, text: "I BARELY MADE IT" },
    { start: 126.00, end: 127.60, text: "OUT ALIVE" },
    { start: 127.73, end: 129.00, text: "WEDNESDAY ALMOST" },
    { start: 129.00, end: 130.30, text: "LOST MY MIND" },
    { start: 130.40, end: 132.30, text: "BUT EVERY THURSDAY NIGHT" },
    { start: 132.30, end: 134.20, text: "WE GON' LET 'EM KNOW" },

    // --- Final Chorus ---
    { start: 134.30, end: 135.60, text: "WHEN WE COME TO TOWN" },
    { start: 135.60, end: 136.90, text: "WE GON' LET 'EM KNOW" },
    { start: 137.03, end: 138.50, text: "AND WE DON'T PLAY AROUND" },
    { start: 138.50, end: 139.95, text: "WE GON' LET 'EM KNOW" },
    { start: 140.10, end: 141.45, text: "DO EVERYTHING TO WIN" },
    { start: 141.45, end: 142.75, text: "IF SOMETHING'S GOTTA GIVE" },
    { start: 142.87, end: 144.45, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 144.45, end: 146.05, text: "WE GON' LET 'EM KNOW" },
    { start: 146.17, end: 147.60, text: "WHEN WE COME TO TOWN" },
    { start: 147.60, end: 149.05, text: "WE GON' LET 'EM KNOW" },
    { start: 149.17, end: 150.45, text: "EVERY SINGLE DOWN" },
    { start: 150.45, end: 151.75, text: "WE GON' LET 'EM KNOW" },
    { start: 151.87, end: 153.25, text: "DO EVERYTHING TO WIN" },
    { start: 153.25, end: 154.60, text: "IF SOMETHING'S GOTTA GIVE" },
    { start: 154.70, end: 156.35, text: "IF YOU DON'T KNOW WHAT IT IS" },
    { start: 156.35, end: 158.00, text: "WE GON' LET 'EM KNOW" },

    // --- Outro ---
    { start: 161.50, end: 164.20, text: "WHOA..." },
    { start: 164.43, end: 166.90, text: "GO ON AND LET 'EM KNOW" },
    { start: 167.03, end: 169.50, text: "WHOA" },
    { start: 169.50, end: 172.00, text: "WE GON' LET 'EM KNOW" }
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
