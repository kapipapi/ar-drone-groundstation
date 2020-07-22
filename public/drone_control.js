function loadComponents() {
    printLedOptions();
    printActionPiano();
}

var socket;

(() => {
    socket = io("http://localhost:3001");
})();

// NAVDATA UPDATE
socket.on("navdata", (data) => {
    batteryStatus(data);
    altitudeStatus(data);
});

// BATTERY STATUS UPDATE
function batteryStatus(dronestatus) {
    let status = dronestatus;

    let lowBattery = status.droneState.lowBattery;
    let batteryPercentage = status.demo.batteryPercentage;
    let batteryMilliVolt = status.rawMeasures.batteryMilliVolt;

    var batteryStatus = document.querySelector("#batteryStatus");
    batteryStatus.onclick = () => console.log(status);

    var procentageBlock = document.querySelector("#procentageBlock");
    procentageBlock.innerHTML = batteryPercentage + "%";
    procentageBlock.style.width = batteryPercentage + "%";
    procentageBlock.style.backgroundColor = lowBattery ? "red" : "green";
}

// ALTITUDE STATUS
function altitudeStatus(dronestatus) {
    let status = dronestatus;
    let altitudeMeters = status.altitude.vision;

    var altitudeStatus = document.querySelector("#altitudeStatus");
    altitudeStatus.innerHTML =
        altitudeMeters / 10 +
        "<br/><span style='font-size: 15px'>centimeters</span>";
}

// LED CHANGE
let ledOptions = [
    "blinkGreenRed",
    "blinkGreen",
    "blinkRed",
    "blinkOrange",
    "snakeGreenRed",
    "fire",
    "standard",
    "red",
    "green",
    "redSnake",
    "blank",
    "rightMissile",
    "leftMissile",
    "doubleMissile",
    "frontLeftGreenOthersRed",
    "frontRightGreenOthersRed",
    "rearRightGreenOthersRed",
    "rearLeftGreenOthersRed",
    "leftGreenRightRed",
    "leftRedRightGreen",
    "blinkStandard",
];
function printLedOptions() {
    var selectContainer = document.querySelector("#changeLedOptions");
    var selectOption = document.createElement("select");
    selectOption.appendChild(document.createElement("option"));
    ledOptions.forEach((option) => {
        var optionElement = document.createElement("option");
        optionElement.innerHTML = option;
        selectOption.appendChild(optionElement);
    });
    selectOption.onchange = () => changeLed(selectOption.value);
    selectContainer.appendChild(selectOption);
}
function changeLed(color) {
    socket.emit("led", color);
}

// ACTION PIANO
var actionPianoOptions = [
    "phiM30Deg",
    "phi30Deg",
    "thetaM30Deg",
    "theta30Deg",
    "theta20degYaw200deg",
    "theta20degYawM200deg",
    "turnaround",
    "turnaroundGodown",
    "yawShake",
    "yawDance",
    "phiDance",
    "thetaDance",
    "vzDance",
    "wave",
    "phiThetaMixed",
    "doublePhiThetaMixed",
    "flipAhead",
    "flipBehind",
    "flipLeft",
    "flipRight",
];
function removeShadowClassSendAction(e) {
    var styleChange;
    e.path[0].localName == "p"
        ? (styleChange = e.path[1])
        : (styleChange = e.path[0]);
    styleChange.classList.remove("neumorphic-shadow");

    sendAction(styleChange.attributes.action.value);
}
function addShadowClass(e) {
    var styleChange;
    e.path[0].localName == "p"
        ? (styleChange = e.path[1])
        : (styleChange = e.path[0]);
    styleChange.classList.add("neumorphic-shadow");
}
function printActionPiano() {
    var actionPiano = document.querySelector("#actionPiano");
    actionPianoOptions.forEach((action) => {
        var button = document.createElement("div");
        button.classList.add("action-button");
        button.classList.add("neumorphic-shadow");
        button.onmousedown = (e) => removeShadowClassSendAction(e);
        button.onmouseup = (e) => addShadowClass(e);

        var label = document.createElement("p");
        label.innerHTML = action
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => {
                return str.toLowerCase();
            });
        button.setAttribute("action", action);
        button.appendChild(label);
        actionPiano.appendChild(button);
    });
}
function sendAction(action) {
    console.log(action);
    socket.emit("action", action);
}

// GAMEPAD API
var gamepad, gamepadtimer;

function gamepadHandler(event, status) {
    if (status) {
        gamepad = event.gamepad;
        gamepadtimer = setInterval(() => updateGamepadStatus(), 30);
        console.log("gamepad connected");
        document.querySelector("#gamepadStatus").style.color = "green";
    } else {
        socket.emit("gamepadDisconnect", true);
        delete gamepad;
        clearInterval(gamepadtimer);
        document.querySelector("#gamepadStatus").style.color = "red";
        document.querySelector("#gamepad").innerHTML = "";
    }
}

function updateGamepadStatus() {
    gamepad = navigator.getGamepads()[0];
    printGamepad();
    sendGamepadInfo();
}

let axisName = ["LX", "LY", "RX", "RY"];
let buttonName = [
    "X",
    "O",
    "SQ",
    "TR",
    "L1",
    "R1",
    "L2",
    "R2",
    "SHARE",
    "OPTION",
    "L3",
    "R3",
    "UP",
    "DOWN",
    "LEFT",
    "RIGHT",
    "PS",
    "TOUCHPAD",
];

function sendGamepadInfo() {
    if (!gamepad) return;

    var gamepad_data = {
        axes: [],
        buttons: [],
    };

    gamepad_data.axes = gamepad.axes;
    gamepad.buttons.forEach((button) => {
        gamepad_data.buttons.push({
            value: button.value,
            pressed: button.pressed,
        });
    });

    socket.emit("gamepad", gamepad_data);
}

function printGamepad() {
    var gamepadContainer = document.querySelector("#gamepad");
    gamepadContainer.innerHTML = "";
    gamepad.axes.forEach((val, id) => {
        var axis = document.createElement("p");
        var prev = val;
        val = Math.round(val * 10) / 10;
        axis.innerHTML = axisName[id] + " = " + val + " (" + prev + ")";
        gamepadContainer.appendChild(axis);
    });
    gamepad.buttons.forEach((val, id) => {
        var button = document.createElement("p");
        val.pressed
            ? (button.innerHTML =
                  buttonName[id] + " = <b>" + val.value + "</b>")
            : (button.innerHTML = buttonName[id] + " = " + val.value);
        gamepadContainer.appendChild(button);
    });
}

window.addEventListener(
    "gamepadconnected",
    (e) => gamepadHandler(e, true),
    false
);

window.addEventListener(
    "gamepaddisconnected",
    (e) => gamepadHandler(e, false),
    false
);
