let audioCtx = null;
let masterGain = null;
let isMuted = false;
const activeOscillators = {};

const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');
const startBtn = document.getElementById('start-btn');

function log(msg) {
  logEl.innerHTML += `<div>${msg}</div>`;
  logEl.scrollTop = logEl.scrollHeight;
}

// Convert MIDI Note number to Hz frequency
function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// Initialize Audio Context on user interaction (Android requirement)
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : 1;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  statusEl.innerText = "Audio Ready. Requesting MIDI...";
  log("AudioContext activated.");
  initMIDI();
}

// Request Web MIDI Access
function initMIDI() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  } else {
    statusEl.innerText = "Web MIDI API not supported in this browser.";
    log("Error: Web MIDI API unavailable.");
  }
}

function onMIDISuccess(midiAccess) {
  statusEl.innerText = "MIDI Connected! Play your Piano M.";
  log("MIDI Access granted.");

  const inputs = midiAccess.inputs.values();
  let deviceFound = false;

  for (let input of inputs) {
    deviceFound = true;
    log(`Found device: ${input.name}`);
    input.onmidimessage = handleMIDIMessage;
  }

  if (!deviceFound) {
    log("No MIDI device detected. Plug in your ROLI Piano M via USB OTG.");
  }

  midiAccess.onstatechange = (e) => {
    log(`Device state changed: ${e.port.name} (${e.port.state})`);
    if (e.port.state === 'connected') {
      e.port.onmidimessage = handleMIDIMessage;
    }
  };
}

function onMIDIFailure(err) {
  statusEl.innerText = "MIDI Access Denied or Failed.";
  log(`Failed to get MIDI access: ${err}`);
}

// Parse raw MIDI events (Note On / Note Off)
function handleMIDIMessage(event) {
  const [statusByte, note, velocity] = event.data;
  const command = statusByte >> 4;

  // Note On event (Command 9)
  if (command === 9 && velocity > 0) {
    playNote(note, velocity);
  }
  // Note Off event (Command 8 or Command 9 with 0 velocity)
  else if (command === 8 || (command === 9 && velocity === 0)) {
    stopNote(note);
  }
}

// Polyphonic Sound Synthesizer
function playNote(note, velocity) {
  if (activeOscillators[note]) {
    stopNote(note); // Stop old note if duplicate
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Soft triangle wave for synth/piano sound
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(midiToFreq(note), audioCtx.currentTime);

  // Map velocity (0-127) to gain volume
  const volume = (velocity / 127) * 0.5;
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();
  activeOscillators[note] = { osc, gain };
  log(`Note ON: ${note} (Vol: ${velocity})`);
}

function stopNote(note) {
  if (activeOscillators[note]) {
    const { osc, gain } = activeOscillators[note];
    // Fast release to prevent click sounds
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    setTimeout(() => {
      osc.stop();
      osc.disconnect();
    }, 80);
    delete activeOscillators[note];
    log(`Note OFF: ${note}`);
  }
}

startBtn.addEventListener('click', initAudio);

window.addEventListener('piano-mute-change', (event) => {
  isMuted = event.detail.muted;

  if (masterGain) {
    masterGain.gain.setTargetAtTime(
      isMuted ? 0 : 1,
      audioCtx.currentTime,
      0.015
    );
  }
});
