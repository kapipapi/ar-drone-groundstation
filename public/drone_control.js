function loadComponents() {
    printLedOptions();
    batteryStatus(test_data);
    altitudeStatus(test_data);
}

var socket;

(() => {
    socket = io("http://localhost:3001");
})();

var test_data = {
    header: 1432778632,
    droneState: {
        flying: 0,
        videoEnabled: 0,
        visionEnabled: 0,
        controlAlgorithm: 0,
        altitudeControlAlgorithm: 1,
        startButtonState: 0,
        controlCommandAck: 1,
        cameraReady: 1,
        travellingEnabled: 0,
        usbReady: 0,
        navdataDemo: 0,
        navdataBootstrap: 0,
        motorProblem: 0,
        communicationLost: 0,
        softwareFault: 0,
        lowBattery: 0,
        userEmergencyLanding: 0,
        timerElapsed: 0,
        MagnometerNeedsCalibration: 0,
        anglesOutOfRange: 0,
        tooMuchWind: 0,
        ultrasonicSensorDeaf: 0,
        cutoutDetected: 0,
        picVersionNumberOk: 1,
        atCodecThreadOn: 1,
        navdataThreadOn: 1,
        videoThreadOn: 1,
        acquisitionThreadOn: 1,
        controlWatchdogDelay: 0,
        adcWatchdogDelay: 0,
        comWatchdogProblem: 0,
        emergencyLanding: 0
    },
    sequenceNumber: 30938,
    visionFlag: 0,
    demo: {
        controlState: "CTRL_LANDED",
        flyState: "FLYING_OK",
        batteryPercentage: 38,
        frontBackDegrees: 0.537,
        leftRightDegrees: -1.659,
        clockwiseDegrees: 5.449,
        altitudeMeters: 0,
        xVelocity: 0,
        yVelocity: 0,
        zVelocity: 0,
        frameIndex: 0
    },
    time: 239303.131,
    rawMeasures: {
        accelerometers: { x: 2068, y: 2008, z: 2560 },
        gyrometers: { x: 80, y: 32, z: -13 },
        gyrometers110: [0, 0],
        batteryMilliVolt: 11402,
        usDebutEcho: 0,
        usFinEcho: 0,
        usAssociationEcho: 3758,
        usDistanceEcho: 0,
        usCourbeTemps: 11017,
        usCourbeValeur: 0,
        usCourbeRef: 120,
        flagEchoIni: 1,
        nbEcho: 0,
        sumEcho: 0,
        altTempRaw: 0
    },
    phyMeasures: {},
    gyrosOffsets: {},
    eulerAngles: {},
    references: {},
    trims: {},
    rcReferences: {},
    pwm: {
        motors: [0, 0, 0, 0],
        satMotors: [255, 255, 255, 255],
        gazFeedForward: 0,
        gazAltitude: 0,
        altitudeIntegral: 0,
        vzRef: 0,
        uPitch: 0,
        uRoll: 0,
        uYaw: 0,
        yawUI: 0,
        uPitchPlanif: 0,
        uRollPlanif: 0,
        uYawPlanif: 0,
        uGazPlanif: 0,
        motorCurrents: [0, 0, 0, 0],
        altitudeProp: 0,
        altitudeDer: 0
    },
    altitude: {},
    visionRaw: {},
    visionOf: {},
    vision: {},
    visionPerf: {},
    trackersSend: {},
    visionDetect: {},
    watchdog: 5000,
    adcDataFrame: {},
    videoStream: {},
    games: {},
    pressureRaw: {},
    magneto: {},
    windSpeed: {},
    kalmanPressure: {},
    hdvideoStream: {},
    wifi: { linkQuality: 1 },
    zimmu3000: {},
    undefined: {}
};

// NAVDATA UPDATE
socket.on("navdata", data => {
    console.log(data);
});

// BATTERY STATUS UPDATE
function batteryStatus(dronestatus) {
    let status = dronestatus;

    let lowBattery = status.droneState.lowBattery;
    let batteryPercentage = status.demo.batteryPercentage;
    let batteryMilliVolt = status.rawMeasures.batteryMilliVolt;

    var batteryStatus = document.querySelector("#batteryStatus");
    batteryStatus.style.border = "3px solid black";
    batteryStatus.style.width = "100px";
    batteryStatus.style.height = "40px";

    var procentageBlock = document.querySelector("#procentageBlock");
    procentageBlock.innerHTML =
        (batteryPercentage * parseInt(batteryStatus.style.width)) / 100;
    procentageBlock.style.width = batteryPercentage + "%";
    procentageBlock.style.height = "40px";
    procentageBlock.style.backgroundColor = lowBattery ? "red" : "green";
}

// ALTITUDE STATUS
function altitudeStatus(dronestatus) {
    let status = dronestatus;
    let altitudeMeters = status.demo.altitudeMeters;

    var altitudeStatus = document.querySelector("#altitudeStatus");
    altitudeStatus.innerHTML =
        altitudeMeters + "<br/><span style='font-size: 15px'>meters</span>";
}

// LED TEST
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
    "blinkStandard"
];
function printLedOptions() {
    var selectContainer = document.querySelector("#changeLedOptions");
    var selectOption = document.createElement("select");
    selectOption.appendChild(document.createElement("option"));
    ledOptions.forEach(option => {
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

// GAMEPAD API
var gamepad, gamepadtimer;

function gamepadHandler(event, status) {
    if (status) {
        gamepad = event.gamepad;
        gamepadtimer = setInterval(() => updateGamepadStatus(), 10);
        console.log("gamepad connected");
        document.querySelector("#gamepadStatus").style.color = "green";
    } else {
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
    "TOUCHPAD"
];

function sendGamepadInfo() {
    if (!gamepad) return;

    var gamepad_data = {
        axes: [],
        buttons: []
    };

    gamepad_data.axes = gamepad.axes;
    gamepad.buttons.forEach(button => {
        gamepad_data.buttons.push({
            value: button.value,
            pressed: button.pressed
        });
    });

    socket.emit("gamepad", gamepad_data);
}

function printGamepad() {
    var gamepadContainer = document.querySelector("#gamepad");
    gamepadContainer.innerHTML = "";
    gamepad.axes.forEach((val, id) => {
        var axis = document.createElement("p");
        axis.innerHTML = axisName[id] + " = " + val;
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
    e => gamepadHandler(e, true),
    false
);

window.addEventListener(
    "gamepaddisconnected",
    e => gamepadHandler(e, false),
    false
);
