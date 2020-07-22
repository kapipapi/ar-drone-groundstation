let video;
let poseNet;
let poses = [];

let nn;

const options = {
    inputs: 18,
    outputs: 1,
    task: "classification",
    debug: true
};

function setup() {
    createCanvas(1080, 600);
    video = createCapture(VIDEO);
    video.size(width, height);

    nn = ml5.neuralNetwork(options);

    poseNet = ml5.poseNet(video, console.log("model ready"));
    poseNet.on("pose", function(results) {
        poses = results;
    });
    video.hide();
}

var prediction = "waiting";

function draw() {
    image(video, 0, 0, width, height);
    if (ready) {
        classify();
    }
    fill(255, 0, 0);
    textSize(32);
    text(prediction, 100, 100);
    drawKeypoints();
    drawSkeleton();
}

function addData(action) {
    for (var i = 0; i < 10; i++) {
        if (poses.length > 0) {
            var pose = poses[0].pose;
            var rawData = [
                pose.leftShoulder.x,
                pose.leftShoulder.y,
                pose.leftShoulder.confidence,
                pose.rightShoulder.x,
                pose.rightShoulder.y,
                pose.rightShoulder.confidence,
                pose.leftElbow.x,
                pose.leftElbow.y,
                pose.leftElbow.confidence,
                pose.rightElbow.x,
                pose.rightElbow.y,
                pose.rightElbow.confidence,
                pose.leftWrist.x,
                pose.leftWrist.y,
                pose.leftWrist.confidence,
                pose.rightWrist.x,
                pose.rightWrist.y,
                pose.rightWrist.confidence
            ];
            nn.addData(rawData, [action]);
        }
    }
    console.log("DONE!", action);
}

var ready = false;

function train(epo) {
    nn.normalizeData();
    nn.train(
        { epochs: epo },
        e => console.log("training", e),
        () => (ready = true)
    );
}

function classify() {
    if (poses.length > 0) {
        var pose = poses[0].pose;
        var rawData = [
            pose.leftShoulder.x,
            pose.leftShoulder.y,
            pose.leftShoulder.confidence,
            pose.rightShoulder.x,
            pose.rightShoulder.y,
            pose.rightShoulder.confidence,
            pose.leftElbow.x,
            pose.leftElbow.y,
            pose.leftElbow.confidence,
            pose.rightElbow.x,
            pose.rightElbow.y,
            pose.rightElbow.confidence,
            pose.leftWrist.x,
            pose.leftWrist.y,
            pose.leftWrist.confidence,
            pose.rightWrist.x,
            pose.rightWrist.y,
            pose.rightWrist.confidence
        ];
        nn.classify(rawData, getResult);
    }
}

function getResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    // console.log(results);
    prediction = results[0].label + ", " + results[0].confidence;
}

function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or rightShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
            }
        }
    }
}

function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255, 0, 0);
            line(
                partA.position.x,
                partA.position.y,
                partB.position.x,
                partB.position.y
            );
        }
    }
}
