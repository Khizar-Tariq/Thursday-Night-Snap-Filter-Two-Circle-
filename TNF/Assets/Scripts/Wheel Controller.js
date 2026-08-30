// ============================================================
//  Wheel Controller.js  —  Ferris Wheel Pod Orbiter
//  Lens Studio  |  ScreenTransform space  |  ES2021 JS
//
//  SETUP:
//    1. Drag your wheel SceneObject into "Wheel SceneObject".
//    2. Create an EMPTY SceneObject with a ScreenTransform placed
//       at the visual centre of your wheel → assign to "Orbit Pivot".
//    3. Drag any number of pod SceneObjects into the "Pods" array.
//       They will be evenly distributed around the circle automatically.
//    4. Tune Orbit Radius until pods sit on the rim.
//    5. Adjust Rotation Speed (negative = reverse direction).
// ============================================================

// --- Wheel image SceneObject (spins in sync with pod orbit) ---
// @input SceneObject wheelObject  {"label":"Wheel SceneObject (auto-rotated)"}
// @input SceneObject wheelLights1 {"label":"Wheel Lights 1 (auto-rotated)"}
// @input SceneObject wheelLights2 {"label":"Wheel Lights 2 (auto-rotated)"}

// --- Orbit centre ---
// @input Component.ScreenTransform orbitPivot {"label":"Orbit Pivot (empty ST at wheel centre)"}

// --- Pods ---
// @input SceneObject[] pods {"label":"Pods  (drag any number, evenly spaced)"}

// --- Placement mode ---
// @input bool autoPlacement = true {"label":"Auto Placement  (OFF = use your manual pod positions)"}

// --- Orbit settings ---
// @ui {"widget":"group_start", "label":"Orbit Settings"}
// @input float orbitRadius   = 0.35  {"label":"Orbit Radius  (1.0 = half screen height)", "widget":"slider", "min":0.01, "max":1.0, "step":0.005}
// @input float rotationSpeed = 30.0  {"label":"Rotation Speed (deg/sec)", "widget":"slider", "min":-360.0, "max":360.0, "step":1.0}
// @input float startAngle    = 90.0  {"label":"[Auto only] First Pod Angle (deg)  90=top  0=right", "widget":"slider", "min":-360.0, "max":360.0, "step":1.0}
// @input float pivotY        = 1.0   {"label":"Pivot Y  1=top-on-circle(hangs down)  0=centre  -1=bottom-on-circle", "widget":"slider", "min":-1.0, "max":1.0, "step":0.05}
// @ui {"widget":"group_end"}

// --- Aspect ratio correction (fixes ellipse on portrait screens) ---
// @ui {"widget":"group_start", "label":"Aspect Ratio Correction"}
// @input float aspectRatio = 0.5625  {"label":"W÷H  |  9:16=0.5625  3:4=0.75  1:1=1.0", "widget":"slider", "min":0.1, "max":2.0, "step":0.0001}
// @ui {"widget":"group_end"}

// --- Debug ---
// @input bool debugMode = false {"label":"Debug Logging"}

// ─────────────────────────────────────────────────────────────
//  Runtime state
// ─────────────────────────────────────────────────────────────
var podSTs = [];   // ScreenTransform per valid pod
var podHalfW = [];   // cached half-width of anchor rect
var podHalfH = [];   // cached half-height of anchor rect
var podBaseAngles = [];   // pre-computed base angle per pod (radians)
var currentAngle = 0.0;  // master spinning offset

var DEG2RAD = Math.PI / 180.0;
var FALLBACK_HALF = 0.05; // anchor half-size fallback if pod rect is zero

// ─────────────────────────────────────────────────────────────
//  Helper: centre of a ScreenTransform Rect
// ─────────────────────────────────────────────────────────────
function rectCenter(r) {
    return new vec2((r.left + r.right) * 0.5, (r.bottom + r.top) * 0.5);
}

// ─────────────────────────────────────────────────────────────
//  Orbit centre from pivot object
// ─────────────────────────────────────────────────────────────
function getOrbitCenter() {
    if (script.orbitPivot) {
        return rectCenter(script.orbitPivot.anchors);
    }
    print("[WheelController] WARNING: No Orbit Pivot assigned — using screen centre (0,0).");
    return new vec2(0.0, 0.0);
}

// ─────────────────────────────────────────────────────────────
//  Build pod list — evenly distribute around the circle
//  Single-pass: collect valid pods → compute stepDeg → assign.
//  Guarantees stepDeg is always based on exactly the pods placed.
// ─────────────────────────────────────────────────────────────
function gatherPods() {
    podSTs = [];
    podHalfW = [];
    podHalfH = [];
    podBaseAngles = [];

    var podInputs = script.pods;
    if (!podInputs || podInputs.length === 0) {
        print("[WheelController] WARNING: No pods assigned. Drag SceneObjects into the Pods array.");
        return;
    }

    // --- Pass 1: collect every valid pod into a temp list ---
    var validSTs = [];
    var validObjs = [];
    for (var k = 0; k < podInputs.length; k++) {
        if (!podInputs[k]) {
            if (script.debugMode) print("[WheelController] Pod slot [" + k + "] is empty — skipped.");
            continue;
        }
        var st = podInputs[k].getComponent("Component.ScreenTransform");
        if (!st) {
            print("[WheelController] Pod[" + k + "] has no ScreenTransform — skipped.");
            continue;
        }
        // Warn if the pod is invisible (disabled) — it'll still be moved but you won't see it
        if (!podInputs[k].enabled) {
            print("[WheelController] *** Pod[" + k + "] (" + podInputs[k].name + ") is DISABLED — it will be invisible! Enable it in the hierarchy. ***");
        }
        validObjs.push(podInputs[k]);
        validSTs.push(st);
    }

    var N = validSTs.length;
    if (N === 0) {
        print("[WheelController] No valid pods found.");
        return;
    }

    // --- Pass 2: assign base angles ---
    if (script.autoPlacement) {
        // AUTO: evenly distribute pods starting from startAngle, clockwise
        var stepDeg = 360.0 / N;
        for (var j = 0; j < N; j++) {
            var angleDeg = script.startAngle - stepDeg * j;
            podBaseAngles.push(angleDeg * DEG2RAD);
            if (script.debugMode) print("[WheelController] [Auto] Pod[" + j + "] angle=" + angleDeg.toFixed(2) + "°");
        }
        print("[WheelController] AUTO placement: " + N + " pod(s). Step = " + stepDeg.toFixed(4) + "° each.");
    } else {
        // MANUAL: read each pod's current editor position to derive its base angle.
        // The pod orbits from wherever it already is — no repositioning on start.
        var pivot = getOrbitCenter();
        var xScale = (script.aspectRatio > 0.001) ? (1.0 / script.aspectRatio) : 1.0;

        for (var m = 0; m < N; m++) {
            var a   = validSTs[m].anchors;
            var hh  = (a.top   - a.bottom) * 0.5;
            if (hh < 0.001) hh = FALLBACK_HALF;

            // Recover the orbit-circle point from the anchor rect.
            // (Reverse the pivotY offset applied during onUpdate.)
            var anchorCx = (a.left + a.right)   * 0.5;
            var anchorCy = (a.bottom + a.top)    * 0.5;
            var orbitPtX = anchorCx;                          // X: no pivot offset
            var orbitPtY = anchorCy + script.pivotY * hh;     // Y: reverse pivotY shift

            // Compute angle from pivot to orbit point,
            // un-doing the xScale so atan2 gives the true circle angle
            var dx = (orbitPtX - pivot.x) / xScale;
            var dy =  orbitPtY - pivot.y;
            var baseAngle = Math.atan2(dy, dx);
            podBaseAngles.push(baseAngle);

            if (script.debugMode) {
                print("[WheelController] [Manual] Pod[" + m + "] derived angle=" + (baseAngle / DEG2RAD).toFixed(2) + "°");
            }
        }
        print("[WheelController] MANUAL placement: " + N + " pod(s). Angles derived from editor positions.");
    }

    // --- Pass 3: cache anchor half-sizes for each valid pod ---
    for (var j = 0; j < N; j++) {
        var a  = validSTs[j].anchors;
        var hw = (a.right - a.left)   * 0.5;
        var hh = (a.top   - a.bottom) * 0.5;
        if (hw < 0.001) hw = FALLBACK_HALF;
        if (hh < 0.001) hh = FALLBACK_HALF;

        podSTs.push(validSTs[j]);
        podHalfW.push(hw);
        podHalfH.push(hh);
    }

    if (script.debugMode) {
        print("[WheelController] Radius=" + script.orbitRadius + "  AR=" + script.aspectRatio);
        var pc = getOrbitCenter();
        print("[WheelController] Pivot: (" + pc.x.toFixed(3) + ", " + pc.y.toFixed(3) + ")");
    }
}

// ─────────────────────────────────────────────────────────────
//  Init
// ─────────────────────────────────────────────────────────────
function onStart() {
    currentAngle = 0.0;
    gatherPods();
}

// ─────────────────────────────────────────────────────────────
//  Per-frame — orbit pods
// ─────────────────────────────────────────────────────────────
function onUpdate() {
    if (podSTs.length === 0) return;

    currentAngle += (script.rotationSpeed * DEG2RAD) * getDeltaTime();

    var center = getOrbitCenter();
    var r = script.orbitRadius;

    // Aspect ratio fix:
    //   Screen is portrait so 1 unit X ≠ 1 unit Y in pixels.
    //   xScale = 1/aspectRatio equalises pixel distances → true circle.
    var xScale = (script.aspectRatio > 0.001) ? (1.0 / script.aspectRatio) : 1.0;

    for (var i = 0; i < podSTs.length; i++) {
        var st = podSTs[i];
        if (!st) continue;

        var angle = podBaseAngles[i] + currentAngle;

        var cx = center.x + r * xScale * Math.cos(angle);
        var cy = center.y + r * Math.sin(angle);

        var hw = podHalfW[i];
        var hh = podHalfH[i];

        // Pivot offset: shifts which part of the pod sits on the circle.
        //   pivotY =  1.0 → top edge on circle, pod hangs DOWN  (gondola style)
        //   pivotY =  0.0 → centre on circle
        //   pivotY = -1.0 → bottom edge on circle, pod sits UP
        var anchorCenterY = cy - script.pivotY * hh;

        // Must set Rect properties individually — vec4 assignment silently fails in Lens Studio
        st.anchors.left = cx - hw;
        st.anchors.right = cx + hw;
        st.anchors.bottom = anchorCenterY - hh;
        st.anchors.top = anchorCenterY + hh;
    }

    // ── Rotate wheel + lights ──────────────────────────────────────────
    // All three share the same currentAngle — perfectly in sync.
    var wheelRot = quat.fromEulerAngles(0, 0, currentAngle);
    if (script.wheelObject)  script.wheelObject.getTransform().setLocalRotation(wheelRot);
    if (script.wheelLights1) script.wheelLights1.getTransform().setLocalRotation(wheelRot);
    if (script.wheelLights2) script.wheelLights2.getTransform().setLocalRotation(wheelRot);

    if (script.debugMode) {
        var a0 = podBaseAngles[0] + currentAngle;
        var c0x = center.x + r * xScale * Math.cos(a0);
        var c0y = center.y + r * Math.sin(a0);
        var offScreen = (Math.abs(c0x) > 1.5 || Math.abs(c0y) > 1.5);
        var msg = "[WC] Pod0 cx=" + c0x.toFixed(3) + " cy=" + c0y.toFixed(3)
            + "  wheel-rot=" + (currentAngle / DEG2RAD).toFixed(1) + "deg";
        if (offScreen) msg += "  *** RADIUS TOO LARGE — reduce Orbit Radius! ***";
        print(msg);
    }
}

// ─────────────────────────────────────────────────────────────
//  Events
// ─────────────────────────────────────────────────────────────
script.createEvent("OnStartEvent").bind(onStart);
script.createEvent("UpdateEvent").bind(onUpdate);
