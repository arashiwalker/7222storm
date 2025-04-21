const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const toggleSoundBtn = document.getElementById('toggleSound');
if (!ctx) {
    console.error('Failed to get 2D context for canvas');
}

// Web Audio API setup
let audioCtx;
let isSoundOn = true;

// Special mode tracking
let isHarmonyMode = false;
let harmonyMirthaCount = 0;
const mirthasPerMinit = 22; // 22 Mirthas = 1 Minit

// Initialize AudioContext on page load
function initializeAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext initialized');
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log('AudioContext resumed');
            if (isSoundOn) {
                playMirthaSound(); // Play sound immediately after resuming
            }
        }).catch(err => console.error('Failed to resume AudioContext:', err));
    }
}

// Resume AudioContext on user interaction for mobile devices
function setupAudioContextResume() {
    const events = ['touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, function handler() {
            initializeAudioContext();
            // Remove event listeners after first interaction
            events.forEach(ev => document.removeEventListener(ev, handler));
        }, { once: true });
    });
}

// Call setup on script load
initializeAudioContext();
setupAudioContextResume();

function playMirthaSound() {
    if (!isSoundOn) return;
    try {
        if (!audioCtx || audioCtx.state === 'suspended') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Db note (277.18 Hz, root of D-flat major triad)
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine'; // Clean, meditative tone
        oscillator.frequency.setValueAtTime(277.18, audioCtx.currentTime); // Db4
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05); // Volume
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.35); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5); // Fade-out
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);

        console.log('Mirtha sound played: Db note at 277.18 Hz');
    } catch (error) {
        console.error('Audio error in playMirthaSound:', error);
    }
}

function playChime(note, duration = 0.1, isTriad = false) {
    if (!isSoundOn) return;
    try {
        if (!audioCtx || audioCtx.state === 'suspended') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (isTriad) {
            // Play D-flat major triad (Db-F-Ab) for Huor
            const notes = [277.18, 349.23, 415.30]; // Db4, F4, Ab4
            notes.forEach((freq, index) => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.1); // Slight delay between notes
                gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + index * 0.1); // Volume
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start(audioCtx.currentTime + index * 0.1);
                oscillator.stop(audioCtx.currentTime + index * 0.1 + duration);
            });
            console.log('Huor triad played: D-flat major (Db-F-Ab)');
        } else {
            // Play single note for Minit (Ab)
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(note, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); // Volume
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
            console.log(`Minit chime played: ${note} Hz`);
        }
    } catch (error) {
        console.error('Audio error in playChime:', error);
    }
}

function playHarmonySounds() {
    if (!isSoundOn) return;
    // Play all three sounds together: Mirtha (Db), Minit (Ab), and Huor (triad)
    playMirthaSound(); // Db note
    playChime(415.30); // Ab note for Minit
    playChime(null, 0.3, true); // D-flat major triad for Huor
    console.log('Harmony mode: Played all interval sounds together');
}

toggleSoundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    toggleSoundBtn.textContent = isSoundOn ? '🔊 Sound: On' : '🔇 Sound: Off';
    console.log('Sound toggled:', isSoundOn);
    if (isSoundOn && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log('AudioContext resumed after toggle');
        }).catch(err => console.error('Failed to resume AudioContext:', err));
    }
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

function drawClockHands() {
    console.log('Drawing clock hands');
    const now = Date.now();
    const elapsedTime = now - startTime;

    const mirthaTick = Math.floor(elapsedTime / secondsInterval) % totalMirthas + 1;
    const minitTick = Math.floor(elapsedTime / minutesInterval) % totalMinits + 1;
    const huorTick = Math.floor(elapsedTime / huorsInterval) % totalHuors + 1;

    // Update Mirtha glow and sound
    if (mirthaTick !== lastMirthaTick) {
        // Check for alignment of all intervals to trigger harmony mode
        if (mirthaTick === 1 && minitTick === 1 && huorTick === 1) {
            isHarmonyMode = true;
            harmonyMirthaCount = 0; // Reset counter
            console.log('All intervals aligned, starting harmony mode for 1 Minit');
        }

        if (isHarmonyMode) {
            playHarmonySounds(); // Play all sounds together
            harmonyMirthaCount++;
            if (harmonyMirthaCount >= mirthasPerMinit) {
                isHarmonyMode = false; // End harmony mode after 1 Minit (22 Mirthas)
                console.log('Harmony mode ended after 1 Minit');
            }
        } else {
            playMirthaSound(); // Play Db note (277.18 Hz)
        }
        lastMirthaTick = mirthaTick;
        mirthaGlowOpacity = 1; // Start glow at max
        console.log('Mirtha tick:', mirthaTick);
    } else {
        // Fade glow over the Mirtha interval (~3272.727 ms)
        const glowStep = (elapsedTime % secondsInterval) / secondsInterval;
        mirthaGlowOpacity = 1 - glowStep; // Linear fade from 1 to 0

        // During harmony mode, make all rings pulse together
        if (isHarmonyMode) {
            minitGlowOpacity = 1 - glowStep; // Pulse Minit ring
            huorGlowOpacity = 1 - glowStep;  // Pulse Huor ring
        }
    }

    // Update Minit glow and sound (Ab note)
    if (minitTick !== lastMinitTick) {
        if (!isHarmonyMode) { // Only play if not in harmony mode
            playChime(415.30); // Ab4
            console.log('Minit sound triggered outside harmony mode');
        }
        lastMinitTick = minitTick;
        minitGlowOpacity = 1; // Start glow at max
        console.log('Minit tick:', minitTick);
    } else if (!isHarmonyMode) {
        // Fade glow over the Mirtha interval (~3272.727 ms) to match Mirtha, but only if not in harmony mode
        minitGlowOpacity = Math.max(0, minitGlowOpacity - (1 / (secondsInterval / 16.666))); // Fade over ~3.273s
    }

    // Update Huor glow and sound (D-flat major triad: Db-F-Ab)
    if (huorTick !== lastHuorTick) {
        if (!isHarmonyMode) { // Only play if not in harmony mode
            playChime(null, 0.3, true); // Play D-flat major triad
            console.log('Huor sound triggered outside harmony mode');
        }
        lastHuorTick = huorTick;
        huorGlowOpacity = 1; // Start glow at max
        console.log('Huor tick:', huorTick);
    } else if (!isHarmonyMode) {
        // Fade glow over the Mirtha interval (~3272.727 ms) to match Mirtha, but only if not in harmony mode
        huorGlowOpacity = Math.max(0, huorGlowOpacity - (1 / (secondsInterval / 16.666))); // Fade over ~3.273s
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