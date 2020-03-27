var express = require("express");
var drone = require("ar-drone").createClient();
var dronestream = require("dronestream");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

// USE PUBLIC
app.use(express.static("public"));

// REQUEST FULL NAVDATA
drone.config("general:navdata_demo", "FALSE");
drone.config("control:outdoor", "TRUE");

// CAMERA STREAM
dronestream.listen(server);

// SETUP SOCKET
io.on("connection", socket => {
    console.log("socket connected");

    socket.on("led", color => {
        console.warn("LED CHANGE -", color);
        drone.animateLeds(color, 4, 1);
    });

    socket.on("gamepad", gamepad => {
        menageControl(gamepad);
    });

    socket.on("gamepadDisconnect", d => {
        console.error("GAMEPAD DISCONNECT", d);
        console.log("LANDING");
        drone.land();
    });

    socket.on("disconnect", () => {
        console.log("socket disconnected");
    });
});

// NAVDATA UPDATE
drone.on("navdata", data => {
    io.emit("navdata", data);
});

// GAME PAD CONTROL
var pressed_buttons = [];
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

/**
 * Checking if given button name is pressed once.
 * @param {Array} buttons         Gamepad buttons array in given moment.
 * @param {String} button_string  String name of button to check. (from buttonName array)
 */
function isPressed(buttons, button_string) {
    var id = buttonName.indexOf(button_string);
    if (buttons[id].pressed) {
        if (!pressed_buttons.includes(id)) {
            pressed_buttons.push(id);
            return true;
        }
    } else {
        var index = pressed_buttons.indexOf(id);
        if (index != -1) {
            pressed_buttons.splice(index, 1);
            unpressedButton(button_string);
        }
    }
    return false;
}

function unpressedButton(button_string) {
    // STOP IS UNPRESSED
    if (["UP", "DOWN", "LEFT", "RIGHT", "X", "O"].includes(button_string)) {
        console.info("STOP");
        drone.stop();
    }
}

var axescontrol = true;
function menageControl(gamepad) {
    var buttons = gamepad.buttons;
    var axes = gamepad.axes;

    // LAND
    if (isPressed(buttons, "SQ")) {
        console.info("LANDING");
        drone.land();
    }

    // TAKE OFF
    if (isPressed(buttons, "TR")) {
        console.info("TAKE OFF");
        drone.takeoff();
    }

    // UP DOWN WITH X O

    if (isPressed(buttons, "X")) {
        console.info("UP");
        drone.up(0.3);
    }

    if (isPressed(buttons, "O")) {
        console.info("DOWN");
        drone.down(0.3);
    }

    // MOVING WITH ARROWS IN PLANE
    var moveSpeed = 0.3;

    if (isPressed(buttons, "UP")) {
        console.info("MOVE FRONT");
        drone.front(moveSpeed);
    }

    if (isPressed(buttons, "DOWN")) {
        console.info("MOVE BACK");
        drone.back(moveSpeed);
    }

    if (isPressed(buttons, "LEFT")) {
        console.info("MOVE LEFT");
        drone.left(moveSpeed);
    }

    if (isPressed(buttons, "RIGHT")) {
        console.info("MOVE RIGHT");
        drone.right(moveSpeed);
    }

    if (isPressed(buttons, "TOUCHPAD")) {
        console.info("STOP");
        drone.stop();
    }

    // FLIP AHEAD
    if (isPressed(buttons, "R1")) {
        console.info("FLIP AHEAD!");
        drone.animate("flipAhead", 1000);
    }

    // STEER WITH AXES
    axes.forEach((item, id) => {
        axes[id] = Math.round(item * 10) / 10;
    });

    if (axescontrol) {
        // ROLL
        // console.log(axes[0], axes[1], axes[2], axes[3]);
        if (axes[0] > 0) drone.clockwise(axes[0]);
        if (axes[0] < 0) drone.counterClockwise(-axes[0]);
        // THROTTLE
        if (axes[1] < 0) drone.up(-axes[1]);
        if (axes[1] > 0) drone.down(axes[1]);
        //PITCH
        if (axes[2] > 0) drone.right(axes[2]);
        if (axes[2] < 0) drone.right(axes[2]);
        //YAW
        if (axes[3] < 0) drone.front(-axes[3]);
        if (axes[3] > 0) drone.back(axes[3]);
    }
}

// RUN ON :3001
server.listen(3001);
