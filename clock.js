const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const toggleSoundBtn = document.getElementById('toggleSound');
const mirthaTickDisplay = document.getElementById('mirtha-tick');
const minitTickDisplay = document.getElementById('minit-tick');
const huorTickDisplay = document.getElementById('huor-tick');
if (!ctx) {
    console.error('Failed to get 2D context for canvas');
}

// Web Audio API setup
let audioCtx;
let isSoundOn = true;

function playChime(note) {
    if (!isSoundOn) return;
    try {
        if (!audioCtx || audioCtx.state === 'suspended') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
        console.log(`Chime played: ${note} Hz`);
    } catch (error) {
        console.error('Audio error:', error);
    }
}

toggleSoundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    toggleSoundBtn.textContent = isSoundOn ? '🔊 Sound: On' : '🔇 Sound: Off';
    console.log('Sound toggled:', isSoundOn);
});

// Copy-to-clipboard for donation addresses
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const addressId = btn.getAttribute('data-address');
        const address = document.getElementById(addressId).textContent;
        navigator.clipboard.writeText(address).then(() => {
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy', 2000);
        });
    });
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
const totalHuors = 24;

const secondsInterval = (1000 * 72) / 22;
const minutesInterval = secondsInterval * totalMirthas;
const huorsInterval = minutesInterval * totalMinits;

const startTime = new Date("2020-02-01T23:00:00").getTime();

let lastMirthaTick = 0;
let lastMinitTick = 0;
let lastHuorTick = 0;

// Glowing ring animation state
let mirthaGlowOpacity = 0;
let minitGlowOpacity = 0;
let huorGlowOpacity = 0;

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
    ctx.strokeStyle = `rgba(0, 255, 0, ${mirthaGlowOpacity})`; // Green glow
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glowing ring for Minit
    ctx.beginPath();
    ctx.arc(centerX, centerY, (clockRadius * 2) / 3 + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(128, 0, 128, ${minitGlowOpacity})`; // Purple glow
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glowing ring for Huor
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius / 3 + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 0, 0, ${huorGlowOpacity})`; // Red glow
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

    // Huor Circle
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

    for (let i = 0; i < totalHuors; i++) {
        const angle = ((i + 1) * 2 * Math.PI) / totalHuors - Math.PI / 2;
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

function updateIntervalTicks(huorTick, minitTick, mirthaTick) {
    const huorDisplay = getLabel(huorTick, totalHuors).toString().padStart(2, '0');
    const minitDisplay = getLabel(minitTick, totalMinits).toString().padStart(2, '0');
    const mirthaDisplay = getLabel(mirthaTick, totalMirthas).toString().padStart(2, '0');
    huorTickDisplay.textContent = huorDisplay;
    minitTickDisplay.textContent = minitDisplay;
    mirthaTickDisplay.textContent = mirthaDisplay;
}

function drawClockHands() {
    console.log('Drawing clock hands');
    const now = Date.now();
    const elapsedTime = now - startTime;

    const mirthaTick = Math.floor(elapsedTime / secondsInterval) % totalMirthas + 1;
    const minitTick = Math.floor(elapsedTime / minutesInterval) % totalMinits + 1;
    const huorTick = Math.floor(elapsedTime / huorsInterval) % totalHuors + 1;

    // Update Mirtha glow and chime
    if (mirthaTick !== lastMirthaTick) {
        playChime(369); // D♭4
        lastMirthaTick = mirthaTick;
        mirthaGlowOpacity = 1; // Start glow at max
        console.log('Mirtha tick:', mirthaTick);
    } else {
        // Fade glow over the Mirtha interval (~3272.727 ms)
        const glowStep = (elapsedTime % secondsInterval) / secondsInterval;
        mirthaGlowOpacity = 1 - glowStep; // Linear fade from 1 to 0
    }

    // Update Minit glow and chime
    if (minitTick !== lastMinitTick) {
        playChime(465.12); // F4
        lastMinitTick = minitTick;
        minitGlowOpacity = 1; // Start glow at max
        console.log('Minit tick:', minitTick);
    } else {
        // Fade glow over the Mirtha interval (~3272.727 ms) to match Mirtha
        minitGlowOpacity = Math.max(0, minitGlowOpacity - (1 / (secondsInterval / 16.666))); // Fade over ~3.273s
    }

    // Update Huor glow and chime
    if (huorTick !== lastHuorTick) {
        playChime(586.02); // A♭4
        lastHuorTick = huorTick;
        huorGlowOpacity = 1; // Start glow at max
        console.log('Huor tick:', huorTick);
    } else {
        // Fade glow over the Mirtha interval (~3272.727 ms) to match Mirtha
        huorGlowOpacity = Math.max(0, huorGlowOpacity - (1 / (secondsInterval / 16.666))); // Fade over ~3.273s
    }

    // Play harmony when all intervals align
    if (mirthaTick === 1 && minitTick === 1 && huorTick === 1) {
        playChime(369); // D♭4
        playChime(465.12); // F4
        playChime(586.02); // A♭4
        console.log('Harmony chord played');
    }

    const mirthaFraction = (elapsedTime % secondsInterval) / secondsInterval;
    const minitFraction = (elapsedTime % minutesInterval) / minutesInterval;
    const huorFraction = (elapsedTime % huorsInterval) / huorsInterval;

    const mirthaRotation = ((mirthaTick - 1 + mirthaFraction) / totalMirthas) * 360;
    const minitRotation = ((minitTick - 1 + minitFraction) / totalMinits) * 360;
    const huorRotation = ((huorTick - 1 + huorFraction) / totalHuors) * 360;

    const huor = drawHand(huorRotation, clockRadius / 3, '#FF0000', 3);
    const minit = drawHand(minitRotation, (clockRadius * 2) / 3, '#800080', 3);
    const mirtha = drawHand(mirthaRotation, clockRadius, '#00FF00', 3);

    const huorLabel = getLabel(huorTick, totalHuors);
    const huorTextX = huor.xEnd + 15 * Math.cos((huorRotation - 90) * (Math.PI / 180));
    const huorTextY = huor.yEnd + 15 * Math.sin((huorRotation - 90) * (Math.PI / 180));
    drawLabel(huorLabel, huorTextX, huorTextY, '#FF0000');

    const minitLabel = getLabel(minitTick, totalMinits);
    const minitTextX = minit.xEnd + 15 * Math.cos((minitRotation - 90) * (Math.PI / 180));
    const minitTextY = minit.yEnd + 15 * Math.sin((minitRotation - 90) * (Math.PI / 180));
    drawLabel(minitLabel, minitTextX, minitTextY, '#800080');

    const mirthaLabel = getLabel(mirthaTick, totalMirthas);
    const mirthaTextX = mirtha.xEnd + 15 * Math.cos((mirthaRotation - 90) * (Math.PI / 180));
    const mirthaTextY = mirtha.yEnd + 15 * Math.sin((mirthaRotation - 90) * (Math.PI / 180));
    drawLabel(mirthaLabel, mirthaTextX, mirthaTextY, '#00FF00');

    // Update interval ticks
    updateIntervalTicks(huorTick, minitTick, mirthaTick);
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