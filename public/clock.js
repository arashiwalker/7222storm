const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const mirthaCount = document.getElementById('mirthaCount');
const minitCount = document.getElementById('minitCount');
const hourCount = document.getElementById('hourCount');
const soundToggle = document.getElementById('soundToggle');

canvas.width = 400;
canvas.height = 400;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let mirtha = 0;
let minit = 0;
let hour = 0;
let soundOn = true;

// Web Audio API for sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioCtx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(369, audioCtx.currentTime);
oscillator.connect(audioCtx.destination);
oscillator.start();

// D♭ major triad (D♭-F-A♭: 277 Hz, 349 Hz, 415 Hz)
function playTriad() {
  const triad = [277, 349, 415];
  triad.forEach(freq => {
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  });
}

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? 'Toggle Sound Off' : 'Toggle Sound On';
});

function drawClock() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw rings
  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
  ctx.strokeStyle = '#00ff00'; // Mirtha ring
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
  ctx.strokeStyle = '#800080'; // Minit ring
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
  ctx.strokeStyle = '#ff0000'; // Hour ring
  ctx.stroke();

  // Draw hands
  const mirthaAngle = (mirtha / 22) * Math.PI * 2 - Math.PI / 2;
  const minitAngle = (minit / 22) * Math.PI * 2 - Math.PI / 2;
  const hourAngle = (hour / 24) * Math.PI * 2 - Math.PI / 2;

  // Mirtha hand
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + 150 * Math.cos(mirthaAngle), centerY + 150 * Math.sin(mirthaAngle));
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Minit hand
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + 120 * Math.cos(minitAngle), centerY + 120 * Math.sin(minitAngle));
  ctx.strokeStyle = '#800080';
  ctx.stroke();

  // Hour hand
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + 90 * Math.cos(hourAngle), centerY + 90 * Math.sin(hourAngle));
  ctx.strokeStyle = '#ff0000';
  ctx.stroke();
}

function updateClock() {
  mirtha++;
  if (mirtha >= 22) {
    mirtha = 0;
    minit++;
    if (soundOn) playTriad(); // Play D♭ major triad every Minit (72 seconds)
  }
  if (minit >= 22) {
    minit = 0;
    hour++;
  }
  if (hour >= 24) {
    hour = 0;
  }

  mirthaCount.textContent = mirtha;
  minitCount.textContent = minit;
  hourCount.textContent = hour;

  if (soundOn) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(369, audioCtx.currentTime);
    osc.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }

  drawClock();
}

setInterval(updateClock, 1000 / 3.2727); // ~305.55ms per Mirtha tick
drawClock();