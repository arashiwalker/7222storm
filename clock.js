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
        oscillator.frequency.setValueAtTime(369, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
        console.log('Mirtha sound played: 369 Hz');
    } catch (error) {
        console.error('Audio error:', error);
    }
}

toggleSoundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    toggleSoundBtn.textContent = `Toggle Sound (${isSoundOn ? 'On' : 'Off'})`;
    console.log('Sound toggled:', isSoundOn);
});

// Canvas size and responsiveness
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
    drawClock();
});

// Custom time system
const totalMirthas = 22;
const totalMinits = 50;
const totalHours = 24;

const secondsInterval = (1000 * 72) / 22;
const minutesInterval = secondsInterval * totalMirthas;
const hoursInterval = minutesInterval * totalMinits;

const startTime = new Date("2020-02-02T00:00:00").getTime();

let lastMirthaTick = 0;

// Glowing ring animation state
let glowOpacity = 0;
let glowIncreasing = true;

function getLabel(currentTick, totalTicks) {
    return (currentTick + totalTicks - 2) % totalTicks + 1;
}

function drawClockFace() {
    console.log('Drawing clock face');
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, clockRadius);
    gradient.addColorStop(0, '#333');
    gradient.addColorStop(1, '#181818');
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Glowing ring for Mirtha (outermost)
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(0, 255, 0, ${glowOpacity})`; // Green glow with varying opacity
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mirtha Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Minit Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, (clockRadius * 2) / 3, 0, 2 * Math.PI);
    ctx.strokeStyle = '#800080';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hour Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius / 3, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawTicks() {
    console.log('Drawing ticks');
    for (let i = 0; i < totalMirthas; i++) {
        const angle = ((i + 1) * 2 * Math.PI) / totalMirthas - Math.PI / 2;
        const tickXStart = centerX + clockRadius * Math.cos(angle);
        const tickYStart = centerY + clockRadius * Math.sin(angle);
        const tickXEnd = centerX + (clockRadius - 15) * Math.cos(angle);
        const tickYEnd = centerY + (clockRadius - 15) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(tickXStart, tickYStart);
        ctx.lineTo(tickXEnd, tickYEnd);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (let i = 0; i < totalMinits; i++) {
        const angle = ((i + 1) * 2 * Math.PI) / totalMinits - Math.PI / 2;
        const tickXStart = centerX + (clockRadius * 2 / 3) * Math.cos(angle);
        const tickYStart = centerY + (clockRadius * 2 / 3) * Math.sin(angle);
        const tickXEnd = centerX + (clockRadius * 2 / 3 - 10) * Math.cos(angle);
        const tickYEnd = centerY + (clockRadius * 2 / 3 - 10) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(tickXStart, tickYStart);
        ctx.lineTo(tickXEnd, tickYEnd);
        ctx.strokeStyle = '#800080';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (let i = 0; i < totalHours; i++) {
        const angle = ((i + 1) * 2 * Math.PI) / totalHours - Math.PI / 2;
        const tickXStart = centerX + (clockRadius / 3) * Math.cos(angle);
        const tickYStart = centerY + (clockRadius / 3) * Math.sin(angle);
        const tickXEnd = centerX + (clockRadius / 3 - 8) * Math.cos(angle);
        const tickYEnd = centerY + (clockRadius / 3 - 8) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(tickXStart, tickYStart);
        ctx.lineTo(tickXEnd, tickYEnd);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

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

function drawLabel(label, x, y, color) {
    const fontSize = Math.max(12, canvas.width / 25);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
}

function drawClockHands() {
    console.log('Drawing clock hands');
    const now = Date.now();
    const elapsedTime = now - startTime;

    const mirthaTick = Math.floor(elapsedTime / secondsInterval) % totalMirthas + 1;
    const minitTick = Math.floor(elapsedTime / minutesInterval) % totalMinits + 1;
    const hourTick = Math.floor(elapsedTime / hoursInterval) % totalHours + 1;

    // Update glowing ring opacity (sync with Mirtha tick at 0.305555 Hz)
    if (mirthaTick !== lastMirthaTick) {
        playTone();
        lastMirthaTick = mirthaTick;
        glowOpacity = 1; // Start glow at max on new Mirtha tick
        glowIncreasing = false;
        console.log('Mirtha tick:', mirthaTick);
    } else {
        // Fade glow over the Mirtha interval (~3272.727 ms)
        const glowStep = (elapsedTime % secondsInterval) / secondsInterval;
        glowOpacity = 1 - glowStep; // Linear fade from 1 to 0
    }

    const mirthaFraction = (elapsedTime % secondsInterval) / secondsInterval;
    const minitFraction = (elapsedTime % minutesInterval) / minutesInterval;
    const hourFraction = (elapsedTime % hoursInterval) / hoursInterval;

    const mirthaRotation = ((mirthaTick - 1 + mirthaFraction) / totalMirthas) * 360;
    const minitRotation = ((minitTick - 1 + minitFraction) / totalMinits) * 360;
    const hourRotation = ((hourTick - 1 + hourFraction) / totalHours) * 360;

    const hour = drawHand(hourRotation, clockRadius / 3, '#FF0000', 3);
    const minit = drawHand(minitRotation, (clockRadius * 2) / 3, '#800080', 3);
    const mirtha = drawHand(mirthaRotation, clockRadius, '#00FF00', 3);

    const hourLabel = getLabel(hourTick, totalHours);
    const hourTextX = hour.xEnd + 15 * Math.cos((hourRotation - 90) * (Math.PI / 180));
    const hourTextY = hour.yEnd + 15 * Math.sin((hourRotation - 90) * (Math.PI / 180));
    drawLabel(hourLabel, hourTextX, hourTextY, '#FF0000');

    const minitLabel = getLabel(minitTick, totalMinits);
    const minitTextX = minit.xEnd + 15 * Math.cos((minitRotation - 90) * (Math.PI / 180));
    const minitTextY = minit.yEnd + 15 * Math.sin((minitRotation - 90) * (Math.PI / 180));
    drawLabel(minitLabel, minitTextX, minitTextY, '#800080');

    const mirthaLabel = getLabel(mirthaTick, totalMirthas);
    const mirthaTextX = mirtha.xEnd + 15 * Math.cos((mirthaRotation - 90) * (Math.PI / 180));
    const mirthaTextY = mirtha.yEnd + 15 * Math.sin((mirthaRotation - 90) * (Math.PI / 180));
    drawLabel(mirthaLabel, mirthaTextX, mirthaTextY, '#00FF00');
}

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

try {
    console.log('Initializing clock');
    drawClock();
    animateClock();
} catch (error) {
    console.error('Error initializing clock:', error);
}