//@input SceneObject[] objectsElements
//@input float delaytoEnable


//enable the whole array after the delay

function onStart() {
    for (var i = 0; i < script.objectsElements.length; i++) {
        script.objectsElements[i].enabled = false;
    }

    var event = script.createEvent("DelayedCallbackEvent");
    event.bind(enableObjects);
    event.reset(script.delaytoEnable);
}

function enableObjects() {
    for (var i = 0; i < script.objectsElements.length; i++) {
        script.objectsElements[i].enabled = true;
    }
}

onStart();