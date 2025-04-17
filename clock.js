// Get the canvas element and its 2D drawing context
const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const toggleSoundBtn = document.getElementById('toggleSound');
if (!ctx) {
    console.error('Failed to get 2D context for canvas');
}

// Web Audio API setup
let audioCtx;
let isSoundOn = true;

function playTone() {
    if (!isSoundOn) return;
    try {
        if (!audioCtx || audioCtx.state === 'suspended') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(432, audioCtx.currentTime); // 432 Hz tone
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // 20% volume
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1); // 100ms duration
        console.log('Mirtha sound played: 432 Hz');
    } catch (error) {
        console.error('Audio error:', error);
    }
}

toggleSoundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    toggleSoundBtn.textContent = `Toggle Sound (${isSoundOn ? 'On' : 'Off'})`;
    console.log('Sound toggled:', isSoundOn);
});

// Set initial canvas size and make it responsive
let clockRadius, centerX, centerY;
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
    canvas.height = canvas.width;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    clockRadius = canvas.width / 2.5;
    console.log('Canvas resized:', canvas.width, canvas.height, 'Radius:', clockRadius);
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    drawClock(); // Redraw immediately on resize
});

// Custom time system
const totalMirthas = 22; // Seconds equivalent
const totalMinits = 50;  // Minutes equivalent
const totalHours = 24;   // Hours equivalent

// Custom time intervals (3.2727 Hz for Mirthas: 72/22 seconds)
const secondsInterval = (1000 * 72) / 22; // One Mirtha (~3272.727 ms)
const minutesInterval = secondsInterval * totalMirthas; // One Minit (~72,000 ms)
const hoursInterval = minutesInterval * totalMinits; // One Hour (~3,600,000 ms)

// Start time for the clock
const startTime = new Date("2020-02-02T00:00:00").getTime();

// Track last Mirtha tick for sound
let lastMirthaTick = 0;

// Helper function to map tick number to label
function getLabel(currentTick, totalTicks) {
    return (currentTick + totalTicks - 2) % totalTicks + 1;
}

// Function to draw the clock face
function drawClockFace() {
    console.log('Drawing clock face');
    // Background gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, clockRadius);
    gradient.addColorStop(0, '#333');
    gradient.addColorStop(1, '#181818');
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Mirtha Circle (outermost)
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Minit Circle (middle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, (clockRadius * 2) / 3, 0, 2 * Math.PI);
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hour Circle (innermost)
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius / 3, 0, 2 * Math.PI);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Function to draw tick marks
function drawTicks() {
    console.log('Drawing ticks');
    // Mirtha ticks (22 in green, shifted one tick to the right)
    for (let i = 0; i < totalMirthas; i++) {
        const angle = ((i + 1) * 2 * Math.PI) / totalMirthas - Math.PI / 2;
        const tickXStart = centerX + clockRadius * Math.cos(angle);
        const tickYStart = centerY + clockRadius * Math.sin(angle);
        const tickXEnd = centerX + (clockRadius - 15) * Math.cos(angle);
        const tickYEnd = centerY + (clockRadius - 15) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(tickXStart, tickYStart);
        ctx.lineTo(tickXEnd, tickYEnd);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Minit ticks (50 in purple, shifted one tick to the right)
    for (let i = 0; i < totalMinits; i++) {
        const angle = ((i + 1) * 2 * Math.PI) / totalMinits - Math.PI / 2;
        const tickXStart = centerX + (clockRadius * 2 / 3) * Math.cos(angle);
        const tickYStart = centerY + (clockRadius * 2 / 3) * Math.sin(angle);
        const tickXEnd = centerX + (clockRadius * 2 / 3 - 10) * Math.cos(angle);
        const tickYEnd = centerY + (clockRadius * 2 / 3 - 10) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(tickXStart, tickYStart);
        ctx.lineTo(tickXEnd, tickYEnd);
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Hour ticks (24 in red, shifted one tick to the right)
    for (let i = 0; i < totalHours; i++) {
        const angle = ((i + 1) * 2 * Math.PI) / totalHours - Math.PI / 2;
        const tickXStart = centerX + (clockRadius / 3) * Math.cos(angle);
        const tickYStart = centerY + (clockRadius / 3) * Math.sin(angle);
        const tickXEnd = centerX + (clockRadius / 3 - 8) * Math.cos(angle);
        const tickYEnd = centerY + (clockRadius / 3 - 8 - 8) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(tickXStart, tickYStart);
        ctx.lineTo(tickXEnd, tickYEnd);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Function to draw a clock hand
function drawHand(rotation, length, color, lineWidth) {
    const radians = (rotation - 90) * (Math.PI / 180);
    const xEnd = centerX + length * Math.cos(radians);
    const yEnd = centerY + length * Math.sin(radians);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    return { xEnd, yEnd };
}

// Function to draw labels
function drawLabel(label, x, y, color) {
    const fontSize = Math.max(12, canvas.width / 25);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
}

// Function to draw the clock hands and labels
function drawClockHands() {
    console.log('Drawing clock hands');
    const now = Date.now();
    const elapsedTime = now - startTime;

    // Calculate current tick for each hand
    const mirthaTick = Math.floor(elapsedTime / secondsInterval) % totalMirthas + 1;
    const minitTick = Math.floor(elapsedTime / minutesInterval) % totalMinits + 1;
    const hourTick = Math.floor(elapsedTime / hoursInterval) % totalHours + 1;

    // Trigger sound on new Mirtha tick
    if (mirthaTick !== lastMirthaTick) {
        playTone();
        lastMirthaTick = mirthaTick;
        console.log('Mirtha tick:', mirthaTick);
    }

    // Calculate fractional movements for smooth animation
    const mirthaFraction = (elapsedTime % secondsInterval) / secondsInterval;
    const minitFraction = (elapsedTime % minutesInterval) / minutesInterval;
    const hourFraction = (elapsedTime % hoursInterval) / hoursInterval;

    // Calculate rotations
    const mirthaRotation = ((mirthaTick - 1 + mirthaFraction) / totalMirthas) * 360;
    const minitRotation = ((minitTick - 1 + minitFraction) / totalMinits) * 360;
    const hourRotation = ((hourTick - 1 + hourFraction) / totalHours) * 360;

    // Draw hands
    const hour = drawHand(hourRotation, clockRadius / 3, 'red', 3);
    const minit = drawHand(minitRotation, (clockRadius * 2) / 3, 'purple', 3);
    const mirtha = drawHand(mirthaRotation, clockRadius, 'green', 3);

    // Draw labels
    const hourLabel = getLabel(hourTick, totalHours);
    const hourTextX = hour.xEnd + 15 * Math.cos((hourRotation - 90) * (Math.PI / 180));
    const hourTextY = hour.yEnd + 15 * Math.sin((hourRotation - 90) * (Math.PI / 180));
    drawLabel(hourLabel, hourTextX, hourTextY, 'red');

    const minitLabel = getLabel(minitTick, totalMinits);
    const minitTextX = minit.xEnd + 15 * Math.cos((minitRotation - 90) * (Math.PI / 180));
    const minitTextY = minit.yEnd + 15 * Math.sin((minitRotation - 90) * (Math.PI / 180));
    drawLabel(minitLabel, minitTextX, minitTextY, 'purple');

    const mirthaLabel = getLabel(mirthaTick, totalMirthas);
    const mirthaTextX = mirtha.xEnd + 15 * Math.cos((mirthaRotation - 90) * (Math.PI / 180));
    const mirthaTextY = mirtha.yEnd + 15 * Math.sin((mirthaRotation - 90) * (Math.PI / 180));
    drawLabel(mirthaLabel, mirthaTextX, mirthaTextY, 'green');
}

// Function to draw the entire clock
function drawClock() {
    if (!ctx) {
        console.error('No context available');
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawClockFace();
    drawTicks();
    drawClockHands();
}

// Animation loop with pause/resume
let isRunning = true;
canvas.addEventListener('click', () => {
    isRunning = !isRunning;
    console.log(isRunning ? 'Resuming animation' : 'Pausing animation');
    if (isRunning) animateClock();
});

function animateClock() {
    if (!isRunning) return;
    drawClock();
    requestAnimationFrame(animateClock);
}

// Initialize and start
try {
    console.log('Initializing clock');
    drawClock();
    animateClock();
} catch (error) {
    console.error('Error initializing clock:', error);
}