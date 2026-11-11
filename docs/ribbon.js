const svg = document.querySelector('.ribbon-art svg');
const track = document.querySelector('#track');
const lettering = document.querySelector('#lettering');
const template = lettering.firstElementChild.cloneNode(true);
const toggle = document.querySelector('.ribbon-controls button');
const compact = matchMedia('(max-width: 640px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const wideCurve = track.getAttribute('d');
const compactCurve = 'M-75 201 C21 236 87 198 109 118 C132 27 249 25 248 106 C247 162 174 184 158 140 C140 95 229 85 271 133 C319 188 365 171 435 100';
let playing = !reduced.matches;
let labels = [];
let pitch, speed, phase, previous, frame;

function draw() {
  labels.forEach((label, i) => label.setAttribute('startOffset', (i - 1) * pitch + phase));
}
function layout() {
  const small = compact.matches;
  svg.setAttribute('viewBox', small ? '0 0 360 250' : '0 0 1100 350');
  track.setAttribute('d', small ? compactCurve : wideCurve);
  track.style.strokeWidth = small ? '39' : '';
  lettering.style.fontSize = small ? '13px' : '';
  pitch = small ? 166 : 310;
  speed = small ? 24 : 48;
  phase = small ? 83 : 172;
  const copies = Array.from({length: Math.ceil(track.getTotalLength() / pitch) + 2},
    () => template.cloneNode(true));
  lettering.replaceChildren(...copies);
  labels = copies.map(copy => copy.firstElementChild);
  draw();
}
function tick(now) {
  if (previous != null) {
    phase = (phase + Math.min(now - previous, 50) * speed / 1000) % pitch;
    draw();
  }
  previous = now;
  frame = requestAnimationFrame(tick);
}
function setPlaying(value) {
  playing = value;
  cancelAnimationFrame(frame);
  previous = null;
  if (playing) frame = requestAnimationFrame(tick);
  toggle.textContent = playing ? 'Pause motion' : 'Play motion';
}
layout();
toggle.hidden = false;
setPlaying(playing);
toggle.addEventListener('click', () => setPlaying(!playing));
compact.addEventListener('change', layout);
reduced.addEventListener('change', () => {
  if (reduced.matches) { setPlaying(false); layout(); }
  else setPlaying(true);
});
