let audio;
let acceleration = { x: 0, y: 0, z: 0 };
let previousAcceleration = { x: 0, y: 0, z: 0 };
let speed = 0;
let audioContextStarted = false;

function preload() {
    audio = loadSound('https://cdn.glitch.global/d96bfdf7-8c7e-4817-9470-488ec2333c6b/cher.mp3?v=1720493464774', loaded, loadError);
}

function setup() {
    createCanvas(400, 400);
    textSize(32);
    textAlign(CENTER, CENTER);

    let startButton = document.getElementById('start-button');
    startButton.addEventListener('click', () => {
        getAudioContext().resume().then(() => {
            audioContextStarted = true;
            document.getElementById('start-button-container').style.display = 'none';
            
            // Request permission for motion events on iOS
            if (typeof(DeviceMotionEvent) !== 'undefined' && typeof(DeviceMotionEvent.requestPermission) === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('devicemotion', handleMotion, true);
                            audio.loop();
                        } else {
                            showError('Permission not granted for Motion sensors');
                        }
                    })
                    .catch(err => showError(`Error requesting permission: ${err}`));
            } else {
                window.addEventListener('devicemotion', handleMotion, true);
                audio.loop();
            }
        });
    });
}

function draw() {
    background(220);
    if (audioContextStarted) {
        calculateSpeed();
        adjustPlaybackRate();
        text(`Speed: ${speed.toFixed(2)}`, width / 2, height / 2);
        text(`Playback Rate: ${audio.rate().toFixed(2)}`, width / 2, height / 2 + 50);
    } else {
        text('Click "Start" to enable audio', width / 2, height / 2);
    }
}

function handleMotion(event) {
    acceleration.x = event.accelerationIncludingGravity.x;
    acceleration.y = event.accelerationIncludingGravity.y;
    acceleration.z = event.accelerationIncludingGravity.z;
}

function calculateSpeed() {
    let deltaX = acceleration.x - previousAcceleration.x;
    let deltaY = acceleration.y - previousAcceleration.y;
    let deltaZ = acceleration.z - previousAcceleration.z;
    speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

    previousAcceleration.x = acceleration.x;
    previousAcceleration.y = acceleration.y;
    previousAcceleration.z = acceleration.z;
}

function adjustPlaybackRate() {
    if (speed < 0.1) {
        audio.rate(0.5); // Half speed when not moving
    } else if (speed >= 0.1 && speed <= 1) {
        audio.rate(1); // Normal speed
    } else {
        audio.rate(2); // Twice speed when moving fast
    }
}

function loaded() {
    console.log('Audio loaded successfully');
}

function loadError(err) {
    showError(`Failed to load audio: ${err}`);
}

function showError(message) {
    background(220);
    text(message, width / 2, height / 2);
}
