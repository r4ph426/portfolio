const cursorVariant = new URLSearchParams(location.search).get('cursor') ?? 'flat';
if (cursorVariant === 'soft' || cursorVariant === 'flat') {
  document.body.dataset.cursor = cursorVariant;
}

const svg = document.querySelector('.ribbon-art svg');
const track = document.querySelector('#track');
const rainbow = document.createElementNS(svg.namespaceURI, 'g');
rainbow.classList.add('ribbon-rainbow');
const spectrum = [
  [255, 74, 139], [255, 135, 67], [255, 222, 85],
  [58, 223, 172], [65, 183, 255], [148, 94, 255],
];
const segments = 36;
const bands = Array.from({length: segments * 2}, () => {
  const band = document.createElementNS(svg.namespaceURI, 'path');
  rainbow.append(band);
  return band;
});
let audio;
let audioOutput;
let soundEnabled = false;
let heroAudioMuted = false;
const heroScrollThreshold = 80;
let stringSource;
let stringRequest = 0;
let manualPluckUntil = 0;
const stringDuration = .85;
const manualPluckPause = 2000;

function resumeAudio() {
  audio ??= new AudioContext();
  if (!audioOutput) {
    audioOutput = audio.createGain();
    audioOutput.connect(audio.destination);
  }
  audioOutput.gain.value = soundEnabled && !heroAudioMuted ? 1 : 0;
  return audio.resume();
}
let pulse = null;
track.after(rainbow);
const ribbonVariant = new URLSearchParams(location.search).get('ribbon');
const loopVariant = !ribbonVariant || ribbonVariant === 'loop';
const nameVariant = ribbonVariant === 'rapha';
const greetingVariant = ribbonVariant === 'hi';
const introductionVariant = ribbonVariant === 'intro';
const letteringShape = loopVariant || nameVariant || greetingVariant || introductionVariant;
const greetingCurve = [
  'M-110 356 C40 351 134 310 250 240',
  'C349 180 428 131 391 71 C354 11 282 65 269 155',
  'C254 247 228 381 222 432 C217 471 247 426 273 371',
  'C313 286 376 265 421 318 C455 357 465 405 522 396',
  'C581 387 603 314 606 248 C608 220 614 228 624 253',
  'C664 352 775 373 867 316 C952 263 1043 256 1210 306',
].join(' ');
let greetingDot;
if (loopVariant || greetingVariant || introductionVariant) {
  const dot = document.createElementNS(svg.namespaceURI, 'circle');
  dot.setAttribute('cx', introductionVariant ? '205' : '610');
  dot.setAttribute('cy', introductionVariant ? '153' : '141');
  dot.setAttribute('r', '26');
  const dotVariant = new URLSearchParams(location.search).get('dot') ?? 'gradient';
  dot.setAttribute('fill', dotVariant === 'gradient' ? 'url(#ribbon-dot-blue)' : '#72b0eb');
  track.after(dot);
  greetingDot = dot;
}
const introductionCurve = [
  'M-13 281 C32 279 60 255 95 214',
  'C125 179 148 151 137 116 C126 81 105 113 101 165',
  'C96 218 88 296 87 326 C85 348 94 322 102 290',
  'C114 241 133 229 146 259 C156 282 160 310 177 305',
  'C194 299 201 257 202 219 C202 203 204 207 207 222',
  'C236 245 256 231 270 191 C282 158 286 117 272 117 C256 118 256 166 264 200 C271 230 289 259 310 243',
  'C330 218 358 208 367 225 C376 248 346 273 333 260 C320 247 343 218 367 223 C381 226 356 265 375 267 C389 268 402 242 411 226',
  'C421 208 426 218 422 236 C417 253 417 263 424 247 C437 216 455 214 453 234 C451 247 443 268 453 248 C470 218 488 218 485 240 C481 266 494 288 512 305 C524 316 541 321 561 308',
  'C541 327 576 296 598 258 C613 233 621 194 621 198',
  'C621 212 613 237 619 222 C627 205 638 204 645 217 C651 228 661 214 668 210',
  'C689 188 714 201 711 231 C709 258 691 281 675 271 C660 261 667 228 682 212',
  'C699 195 722 206 716 225 C710 244 702 273 716 275 C729 279 744 249 753 231',
  'C762 214 765 198 763 211 C759 241 736 329 738 350 C741 368 751 346 758 316',
  'C768 275 770 208 794 207 C816 205 819 239 804 260 C792 277 777 278 769 262',
  'C780 279 806 278 825 251 C844 224 870 163 864 132 C860 114 847 130 839 157',
  'C827 201 818 250 821 273 C824 291 838 243 850 223 C862 201 880 207 879 230',
  'C877 249 869 269 880 276 C892 283 906 248 918 226',
  'C932 202 958 196 966 216 C977 239 957 277 941 274 C924 271 927 239 941 220',
  'C955 201 979 202 974 224 C967 246 960 269 971 277 C984 288 1010 249 1027 230',
  'C1047 209 1080 196 1122 213',
].join(' ');
// One continuous pen stroke, including the lead-in and terminal flourish.
const signatureCurve = [
  'M-70 378',
  'C12 397 80 351 123 294 C152 257 169 198 169 205',
  'C169 226 153 262 165 240 C180 215 201 213 215 233 C228 250 247 229 260 222',
  'C301 189 350 209 345 253 C341 294 305 328 274 313 C246 299 259 249 289 225',
  'C321 200 366 216 355 245 C344 273 327 316 354 320 C381 325 410 280 428 253',
  'C445 229 451 204 447 224 C440 268 394 400 399 432 C404 458 424 426 438 380',
  'C456 319 460 220 507 218 C551 215 556 266 527 297 C503 323 474 324 458 300',
  'C480 325 532 324 569 283 C605 244 657 152 645 106 C638 79 611 103 596 144',
  'C572 209 555 282 560 316 C566 343 595 272 617 242 C641 209 677 218 674 252',
  'C671 281 654 311 676 321 C700 332 727 279 751 247',
  'C779 210 829 201 846 232 C867 266 828 323 797 318 C763 313 769 266 797 237',
  'C824 209 871 210 860 244 C847 276 833 310 854 323 C881 339 932 280 965 252',
  'C1004 221 1068 201 1150 227',
].join(' ');
const middleCurve = [
  'M-100 336 C30 350 130 327 193 251',
  'C217 222 223 205 225 221 C228 245 179 339 219 356',
  'C270 378 337 311 384 250',
  'C424.18 214.36 472.20 235.96 467.30 283.48 C463.38 327.76 428.10 364.48 397.72 348.28 C370.28 333.16 383.02 289.96 412.42 253.24 C443.78 226.24 487.88 243.52 477.10 274.84 C466.32 305.08 449.66 351.52 476.12 355.84 C502.58 361.24 531.00 312.64 548.64 283.48',
  'C584 225 631 183 669 198 C707 213 688 260 674 292',
  'C660 324 663 338 683 317 C703 296 742 198 789 208',
  'C836 218 807 284 813 321 C819 358 879 363 929 345',
  'C1000 319 1099 298 1200 294',
].join(' ');
const letteringWidth = 52;
const letteringStudy = new URLSearchParams(location.search).get('lettering');
const roomier = letteringStudy === 'roomy';

function spaceWord(curve) {
  if (!roomier) return curve;
  return curve.replace(/(-?\d+) (-?\d+)/g, (_, x, y) => {
    return (550 + (Number(x) - 550) * 1.13).toFixed(2) + ' '
      + (260 + (Number(y) - 260) * 1.26).toFixed(2);
  });
}

const loopScenes = [
  {curve: greetingCurve, width: letteringWidth, dot: {x: 610, y: 141}},
  {curve: spaceWord(middleCurve), width: letteringWidth, dot: roomier ? {x: 200, y: 102} : {x: 240, y: 135}},
  {curve: spaceWord(signatureCurve), width: letteringWidth},
];
let sceneIndex = 0;
let scenePlucked = false;
const holdTime = 1000;
const dotBounceTime = 180;
let dotLanded = false;
const morphTime = 1000;
let morphSamples;
let sceneTime = 0;

const pluckButton = document.querySelector('.pluck-button');
const soundToggle = document.querySelector('.sound-toggle');
const ribbonControls = pluckButton.closest('.ribbon-controls');
let pluck = null;
// Alle meine Entchen, in C major. Each press advances one note.
const melody = [
  60, 62, 64, 65, 67, 67,
  69, 69, 69, 69, 67,
  69, 69, 69, 69, 67,
  65, 65, 65, 65, 64, 64,
  62, 62, 62, 62, 60,
];
let melodyIndex = 0;
const loopChord = [60, 64, 67]; // C–E–G
const compact = matchMedia('(max-width: 640px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const wideCurve = track.getAttribute('d');
const compactCurve = 'M-80 270 C3 306 172 256 101 159 C62 87 105 35 188 48 C274 61 272 133 218 167 C160 204 77 195 98 161 C121 127 241 179 233 240 C229 271 245 295 288 295 C328 298 382 230 440 204';
let playing = !reduced.matches;
let previous, frame, baseCurve;
let pointer = null;
let shiftX = 0;
let shiftY = 0;
let twist = 0;
let focus = 0;
const dotStudy = createDotStudy(svg, track);
const variation = Array.from({length: 64}, () => Math.random() * 2 - 1);
const pointPattern = /(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g;

function smoothJoins(curve) {
  const points = Array.from(curve.matchAll(pointPattern), match => ({
    x: Number(match[1]), y: Number(match[2]),
  }));

  for (let index = 3; index < points.length - 1; index += 3) {
    const anchor = points[index];
    const before = points[index - 1];
    const after = points[index + 1];
    const incoming = {x: anchor.x - before.x, y: anchor.y - before.y};
    const outgoing = {x: after.x - anchor.x, y: after.y - anchor.y};
    const inLength = Math.hypot(incoming.x, incoming.y);
    const outLength = Math.hypot(outgoing.x, outgoing.y);
    if (!inLength || !outLength) continue;

    const x = incoming.x / inLength + outgoing.x / outLength;
    const y = incoming.y / inLength + outgoing.y / outLength;
    const length = Math.hypot(x, y);
    const dx = length > .001 ? x / length : incoming.x / inLength;
    const dy = length > .001 ? y / length : incoming.y / inLength;
    before.x = anchor.x - dx * inLength;
    before.y = anchor.y - dy * inLength;
    after.x = anchor.x + dx * outLength;
    after.y = anchor.y + dy * outLength;
  }

  let index = 0;
  return curve.replace(pointPattern, () => {
    const {x, y} = points[index++];
    return x.toFixed(2) + ' ' + y.toFixed(2);
  });
}

function generateCurve(source, view) {
  let index = 0;
  return source.replace(pointPattern, (point, x, y) => {
    x = Number(x);
    y = Number(y);
    const offset = variation[index++];
    if (x < 0 || x > view.width) return point;
    return (x + offset * view.width * .026).toFixed(2) + ' ' +
      (y + offset * view.height * .065).toFixed(2);
  });
}

const shading = document.createElementNS(svg.namespaceURI, 'g');
shading.classList.add('ribbon-shading');
track.before(shading);
const gradientPieces = [];
const blueStops = [
  [19, 39, 125], [31, 103, 196], [121, 190, 228],
  [174, 217, 239], [68, 145, 214], [19, 39, 125],
];

function blueAt(distance) {
  const position = (distance / 610 % 1) * (blueStops.length - 1);
  const index = Math.floor(position);
  const mix = position - index;
  return 'rgb(' + blueStops[index].map((value, channel) =>
    Math.round(value + (blueStops[index + 1][channel] - value) * mix)
  ).join(' ') + ')';
}

function cubicPoint([a, b, c, d], t) {
  const u = 1 - t;
  return a.map((value, axis) => u ** 3 * value + 3 * u ** 2 * t * b[axis]
    + 3 * u * t ** 2 * c[axis] + t ** 3 * d[axis]);
}

function cubicHandle([a, b, c, d], point, t, step) {
  const u = 1 - t;
  return point.map((value, axis) => value + step * (
    u ** 2 * (b[axis] - a[axis]) + 2 * u * t * (c[axis] - b[axis])
    + t ** 2 * (d[axis] - c[axis])
  ));
}

function paintRibbon(curve) {
  track.setAttribute('d', curve);
  const points = Array.from(curve.matchAll(pointPattern), match => [Number(match[1]), Number(match[2])]);
  const width = getComputedStyle(track).strokeWidth;
  const scale = 1100 / svg.viewBox.baseVal.width;
  const pieces = [];
  let totalLength = 0;

  for (let index = 0; index + 3 < points.length; index += 3) {
    const cubic = points.slice(index, index + 4);
    for (let step = 0; step < 4; step++) {
      const t = step / 4;
      const start = cubicPoint(cubic, t);
      const end = cubicPoint(cubic, t + .25);
      const handleA = cubicHandle(cubic, start, t, .25);
      const handleB = cubicHandle(cubic, end, t + .25, -.25);
      // Measure along the bend so tight loops do not compress the color cycle.
      const middle = cubicPoint(cubic, t + .125);
      const length = Math.hypot(middle[0] - start[0], middle[1] - start[1])
        + Math.hypot(end[0] - middle[0], end[1] - middle[1]);
      if (length < .01) continue;

      pieces.push({start, end, handleA, handleB, length});
      totalLength += length;
    }
  }

  // Use the same three color cycles across every frame of the lettering morph.
  const colorScale = letteringShape && totalLength ? 1830 / totalLength : scale;
  let pieceIndex = 0;
  let distance = 0;
  for (const {start, end, handleA, handleB, length} of pieces) {
    let piece = gradientPieces[pieceIndex++];
    if (!piece) {
      const gradient = document.createElementNS(svg.namespaceURI, 'linearGradient');
      gradient.id = 'ribbon-shade-' + pieceIndex;
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      const stops = ['0', '1'].map(offset => {
        const stop = document.createElementNS(svg.namespaceURI, 'stop');
        stop.setAttribute('offset', offset);
        gradient.append(stop);
        return stop;
      });
      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute('stroke', 'url(#' + gradient.id + ')');
      shading.append(gradient, path);
      piece = {gradient, stops, path};
      gradientPieces.push(piece);
    }
    const {gradient, stops, path} = piece;
    gradient.setAttribute('x1', start[0]);
    gradient.setAttribute('y1', start[1]);
    gradient.setAttribute('x2', end[0]);
    gradient.setAttribute('y2', end[1]);
    stops[0].setAttribute('stop-color', blueAt(distance * colorScale));
    distance += length;
    stops[1].setAttribute('stop-color', blueAt(distance * colorScale));
    path.setAttribute('d', 'M' + start.join(' ') + ' C' +
      [handleA, handleB, end].map(point => point.join(' ')).join(' '));
    path.setAttribute('stroke-width', width);
    path.style.display = '';
  }
  for (const piece of gradientPieces.slice(pieceIndex)) piece.path.style.display = 'none';
  track.classList.add('has-shading');
}

function drawCurve(elapsed) {
  const blend = 1 - Math.exp(-elapsed / (pointer?.ease ?? 130));
  shiftX += ((pointer?.dx ?? 0) - shiftX) * blend;
  shiftY += ((pointer?.dy ?? 0) - shiftY) * blend;
  twist += ((pointer?.turn ?? 0) - twist) * blend;
  if (pluck) {
    pluck.time += elapsed;
    if (pluck.time > (pluck.strong ? morphTime : 820)) pluck = null;
  }
  const vibration = pluck
    ? svg.viewBox.baseVal.height * (pluck.strong ? .36 : .20)
      * Math.sin(pluck.time / (pluck.strong ? 21 : 31))
      * Math.exp(-pluck.time / (pluck.strong ? 210 : 170))
    : 0;
  if (!pointer && !pluck && Math.hypot(shiftX, shiftY, twist * 100) < .05) {
    if (track.getAttribute('d') !== baseCurve) paintRibbon(baseCurve);
    return;
  }

  const view = svg.viewBox.baseVal;
  const radius = view.width * (pointer?.radius ?? .28);
  const pivotY = pointer?.y ?? view.height / 2;
  const curve = baseCurve.replace(pointPattern, (point, x, y) => {
    x = Number(x);
    y = Number(y);
    const distance = (x - focus) / radius;
    const influence = Math.exp(-distance * distance);
    const angle = twist * influence;
    const localX = x - focus;
    const localY = y - pivotY;
    const nextX = focus + localX * Math.cos(angle) - localY * Math.sin(angle) + shiftX * influence;
    const stringPosition = Math.max(0, Math.min(1, x / view.width));
    const stringArc = Math.sin(Math.PI * stringPosition);
    const nextY = pivotY + localX * Math.sin(angle) + localY * Math.cos(angle)
      + shiftY * influence + vibration * stringArc;
    return nextX.toFixed(2) + ' ' + nextY.toFixed(2);
  });
  paintRibbon(smoothJoins(curve));
}

function spectrumColor(position) {
  const index = position * (spectrum.length - 1);
  const start = Math.floor(index);
  const end = Math.min(spectrum.length - 1, start + 1);
  return 'rgb(' + spectrum[start].map((value, channel) =>
    Math.round(value + (spectrum[end][channel] - value) * (index - start))
  ).join(' ') + ')';
}

function drawRainbow(elapsed) {
  if (!pulse) return;
  pulse.time += elapsed;
  const pathLength = track.getTotalLength();
  const origin = pulse.origin * pathLength;
  const tail = pathLength * .19;
  const head = pulse.time / 1050 * (Math.max(origin, pathLength - origin) + tail);
  if (pulse.time >= 1050) {
    pulse = null;
    rainbow.style.display = 'none';
    return;
  }

  const curve = track.getAttribute('d');
  rainbow.style.display = '';
  rainbow.setAttribute('stroke-width', getComputedStyle(track).strokeWidth);
  for (const [index, band] of bands.entries()) {
    const direction = index < segments ? -1 : 1;
    const t = (index % segments) / segments;
    const distance = head - t * tail;
    const span = tail / segments + .6;
    const from = Math.max(0, origin + direction * distance - span / 2);
    const to = Math.min(pathLength, origin + direction * distance + span / 2);
    const visible = to > from && distance >= 0;
    band.style.display = visible ? '' : 'none';
    if (!visible) continue;
    band.setAttribute('d', curve);
    band.setAttribute('stroke', spectrumColor(t));
    band.setAttribute('opacity', Math.min(1, t * 7, (1 - t) * 7));
    band.setAttribute('stroke-dasharray', `0 ${from} ${to - from} ${pathLength + 1}`);
  }
}

function playChime() {
  if (!soundEnabled || heroAudioMuted || !window.AudioContext) return;
  resumeAudio().then(() => {
    if (!soundEnabled || heroAudioMuted) return;
    const start = audio.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const time = start + index * .048;
      const oscillator = audio.createOscillator();
      const envelope = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(.0001, time);
      envelope.gain.exponentialRampToValueAtTime(.047, time + .012);
      envelope.gain.exponentialRampToValueAtTime(.0001, time + .36);
      oscillator.connect(envelope).connect(audioOutput);
      oscillator.start(time);
      oscillator.stop(time + .37);
    });
  }).catch(() => {});
}

function playString(note, manual = false) {
  if (!soundEnabled || heroAudioMuted || !window.AudioContext) return;
  const request = ++stringRequest;
  if (manual) {
    stringSource?.stop();
    stringSource = null;
  }
  resumeAudio().then(() => {
    if (!soundEnabled || heroAudioMuted || request !== stringRequest) return;
    if (manual) manualPluckUntil = performance.now() + manualPluckPause;
    const rate = audio.sampleRate;
    const frequency = 440 * 2 ** ((note - 69) / 12);
    const delay = Math.round(rate / frequency + .5);
    const length = Math.round(rate * stringDuration);
    const buffer = audio.createBuffer(1, length, rate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < delay; index++) {
      samples[index] = (Math.random() * 2 - 1) * .21;
    }
    for (let index = delay; index < length; index++) {
      const previous = index - delay;
      samples[index] = .497 * (samples[previous] + samples[previous + 1]);
    }
    const source = audio.createBufferSource();
    const envelope = audio.createGain();
    const now = audio.currentTime;
    envelope.gain.setValueAtTime(.68, now);
    envelope.gain.exponentialRampToValueAtTime(.001, now + stringDuration);
    source.buffer = buffer;
    source.connect(envelope).connect(audioOutput);
    source.start();
    stringSource = source;
    source.onended = () => {
      if (stringSource === source) stringSource = null;
    };
  }).catch(() => {});
}

function startRainbow(point) {
  const length = track.getTotalLength();
  let nearest = 0;
  let best = Infinity;
  for (let distance = 0; distance <= length; distance += 8) {
    const sample = track.getPointAtLength(distance);
    const squared = (sample.x - point.x) ** 2 + (sample.y - point.y) ** 2;
    if (squared < best) {
      best = squared;
      nearest = distance;
    }
  }
  pulse = {origin: nearest / length, time: 0};
  playChime();
}

function position(event) {
  const rect = svg.getBoundingClientRect();
  const view = svg.viewBox.baseVal;
  return {
    x: (event.clientX - rect.left) * view.width / rect.width,
    y: (event.clientY - rect.top) * view.height / rect.height,
  };
}

svg.addEventListener('pointerdown', event => {
  if (!playing || !event.isPrimary || event.button !== 0 || event.target !== track) return;
  const start = position(event);
  focus = start.x;
  pointer = {
    ...start, id: event.pointerId, dx: 0, dy: 0, turn: 0,
    ease: 55 + Math.random() * 95,
    radius: .22 + Math.random() * .16,
    twistGain: (.7 + Math.random() * .85) * (Math.random() < .5 ? -1 : 1),
  };
  svg.setPointerCapture(event.pointerId);
});
svg.addEventListener('pointermove', event => {
  if (!pointer || event.pointerId !== pointer.id) return;
  const next = position(event);
  const view = svg.viewBox.baseVal;
  const limit = (value, max) => Math.max(-max, Math.min(max, value));
  pointer.dx = limit(next.x - pointer.x, view.width * .30);
  pointer.dy = limit(next.y - pointer.y, view.height * .43);
  pointer.turn = limit((pointer.dx / view.width * 3 + pointer.dy / view.height * 1.4) * pointer.twistGain, 1.12);
});
svg.addEventListener('pointerup', event => {
  if (pointer?.id !== event.pointerId) return;
  const end = position(event);
  if (Math.hypot(end.x - pointer.x, end.y - pointer.y) < 8) startRainbow(end);
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  svg.addEventListener(event, event => {
    if (pointer?.id === event.pointerId) pointer = null;
  });
}

function morphLoopScene(nextIndex, progress, time) {
  morphSamples ??= loopScenes.map(scene => {
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', smoothJoins(scene.curve));
    const length = path.getTotalLength();
    return Array.from({length: 81}, (_, index) => path.getPointAtLength(length * index / 80));
  });

  const start = morphSamples[sceneIndex];
  const end = morphSamples[nextIndex];
  const mix = (a, b) => a + (b - a) * progress;
  const points = start.map((point, index) => ({
    x: mix(point.x, end[index].x),
    y: mix(point.y, end[index].y),
  }));
  const pair = (x, y) => x.toFixed(2) + ' ' + y.toFixed(2);
  let curve = 'M' + pair(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index++) {
    const a = points[index - 1];
    const b = points[index];
    const before = points[index - 2] ?? a;
    const after = points[index + 1] ?? b;
    curve += ' C' + pair(a.x + (b.x - before.x) / 6, a.y + (b.y - before.y) / 6)
      + ' ' + pair(b.x - (after.x - a.x) / 6, b.y - (after.y - a.y) / 6)
      + ' ' + pair(b.x, b.y);
  }
  baseCurve = curve;
  const current = loopScenes[sceneIndex];
  const next = loopScenes[nextIndex];
  const width = mix(current.width, next.width);
  track.style.strokeWidth = String(width);
  greetingDot.setAttribute('r', width / 2);
  const screen = svg.getScreenCTM();
  const aboveViewport = screen ? (-80 - screen.f) / screen.d : -400;
  const aboveHeader = Math.min(-240, aboveViewport);
  const entering = !current.dot;
  const exiting = !next.dot;
  const startDot = current.dot ?? {x: next.dot.x - 48, y: aboveHeader};
  const endDot = next.dot ?? {x: current.dot.x + 105, y: aboveHeader};
  // Keep gravity pulling down on the climb and on the return.
  const arcHeight = entering || exiting ? Math.abs(endDot.y - startDot.y) * .18 : 102;
  const lift = 4 * time * (1 - time);
  const x = startDot.x + (endDot.x - startDot.x) * time;
  const y = startDot.y + (endDot.y - startDot.y) * time - arcHeight * lift;
  const angle = (endDot.x < startDot.x ? -360 : 360) * time;
  greetingDot.setAttribute('cx', x);
  greetingDot.setAttribute('cy', y);
  greetingDot.setAttribute('transform', 'rotate(' + angle + ' ' + x + ' ' + y + ')');
  greetingDot.style.display = '';
  greetingDot.style.opacity = '1';
}

function showLoopScene() {
  const scene = loopScenes[sceneIndex];
  baseCurve = smoothJoins(scene.curve);
  track.style.strokeWidth = String(scene.width);
  greetingDot.setAttribute('r', scene.width / 2);
  if (scene.dot) {
    greetingDot.setAttribute('cx', scene.dot.x);
    greetingDot.setAttribute('cy', scene.dot.y);
  }
  greetingDot.removeAttribute('transform');
  greetingDot.style.opacity = '';
  greetingDot.style.display = scene.dot ? '' : 'none';
  paintRibbon(baseCurve);
}

function advanceLoop(elapsed) {
  if (pointer || pulse) return;
  sceneTime += elapsed;
  if (sceneTime < holdTime) {
    const dot = loopScenes[sceneIndex].dot;
    if (dotLanded && dot) {
      const bounce = Math.min(1, sceneTime / dotBounceTime);
      greetingDot.setAttribute('cy', dot.y - 4 * 8 * bounce * (1 - bounce));
      if (bounce === 1) dotLanded = false;
    }
    return;
  }
  if (!scenePlucked) {
    scenePlucked = true;
    pluck = {time: 0, strong: sceneIndex === 0};
    if (audio?.state === 'running') playString(loopChord[sceneIndex]);
  }

  const nextIndex = (sceneIndex + 1) % loopScenes.length;
  const progress = (sceneTime - holdTime) / morphTime;
  if (progress < 1) {
    morphLoopScene(nextIndex, progress * progress * (3 - 2 * progress), progress);
    return;
  }

  sceneIndex = nextIndex;
  dotLanded = Boolean(loopScenes[sceneIndex].dot);
  sceneTime = 0;
  scenePlucked = false;
  pluck = null;
  showLoopScene();
}

function layout() {
  const small = compact.matches;
  svg.setAttribute('viewBox', small && !letteringShape ? '0 0 360 342' : '0 0 1100 515');
  svg.style.aspectRatio = letteringShape ? '1100 / 515' : '';
  let source = generateCurve(small ? compactCurve : wideCurve, svg.viewBox.baseVal);
  if (nameVariant) source = signatureCurve;
  if (greetingVariant) source = greetingCurve;
  if (introductionVariant) source = introductionCurve;
  baseCurve = smoothJoins(source);
  pointer = null;
  shiftX = shiftY = twist = 0;
  pulse = null;
  pluck = null;
  rainbow.style.display = 'none';
  if (nameVariant || introductionVariant || greetingVariant) track.style.strokeWidth = String(letteringWidth);
  else track.style.strokeWidth = small ? '43' : '';
  if (loopVariant) {
    svg.style.opacity = '1';
    showLoopScene();
  } else {
    paintRibbon(baseCurve);
  }
  dotStudy?.reset();
}
const ribbonCloud = document.createElementNS(svg.namespaceURI, 'g');
ribbonCloud.style.pointerEvents = 'none';
svg.append(ribbonCloud);
const gridCrosses = document.createElementNS(svg.namespaceURI, 'path');
gridCrosses.setAttribute('fill', 'none');
gridCrosses.setAttribute('stroke', '#1935ec');
gridCrosses.setAttribute('stroke-linecap', 'round');
gridCrosses.setAttribute('vector-effect', 'non-scaling-stroke');
ribbonCloud.after(gridCrosses);
let cloudParticles = [];
let dissolveProgress = 0;

function ribbonScrollState(gridTop) {
  const start = heroScrollThreshold;
  const end = Math.max(innerHeight * .95, scrollY + gridTop - innerHeight * .22);
  const progress = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
  return {progress, end};
}

function updateRibbonDissolve() {
  const grid = document.querySelector('.work-index');
  if (!grid) return;
  const gridRect = grid.getBoundingClientRect();
  const {progress, end} = ribbonScrollState(gridRect.top);
  const controlsHidden = scrollY >= heroScrollThreshold;
  ribbonControls.inert = controlsHidden;
  ribbonControls.style.opacity = 1 - Math.max(0, Math.min(1, (scrollY - 40) / 40));
  if (heroAudioMuted !== controlsHidden) {
    heroAudioMuted = controlsHidden;
    if (audioOutput) audioOutput.gain.value = soundEnabled && !heroAudioMuted ? 1 : 0;
    if (heroAudioMuted) {
      stringRequest++;
      stringSource?.stop();
      stringSource = null;
    }
  }
  const motion = reduced.matches ? 0 : progress;
  const ribbonLayers = [track, shading, rainbow, greetingDot].filter(Boolean);
  svg.style.translate = reduced.matches ? '' : '0 ' + Math.min(scrollY, end) + 'px';
  if (!motion) {
    if (dissolveProgress) {
      ribbonCloud.replaceChildren();
      gridCrosses.removeAttribute('d');
      cloudParticles = [];
      for (const layer of ribbonLayers) {
        layer.style.removeProperty('opacity');
        layer.style.removeProperty('visibility');
      }
    }
    dissolveProgress = 0;
    return;
  }
  dissolveProgress = motion;

  if (!cloudParticles.length) {
    const length = track.getTotalLength();
    const stroke = parseFloat(getComputedStyle(track).strokeWidth) || letteringWidth;
    const fragment = document.createDocumentFragment();
    for (let along = 0; along < length; along += 5) {
      const center = track.getPointAtLength(along);
      const next = track.getPointAtLength(Math.min(length, along + 1));
      const angle = Math.atan2(next.y - center.y, next.x - center.x);
      for (let row = -2; row <= 2; row++) {
        const seed = Math.sin(along * 2.13 + row * 17.2);
        const spread = (row + seed * .42) * stroke / 4.9;
        const dot = document.createElementNS(svg.namespaceURI, 'circle');
        dot.setAttribute('fill', blueAt(along));
        const radius = .55 + Math.abs(seed) * .85;
        dot.setAttribute('r', radius);
        fragment.append(dot);
        cloudParticles.push({
          dot, radius,
          x: center.x - Math.sin(angle) * spread,
          y: center.y + Math.cos(angle) * spread,
          dx: Math.cos(along * .042 + row * 2.1) * (35 + 70 * Math.abs(seed)),
          dy: Math.sin(along * .039 + row * 2.3) * (30 + 95 * Math.abs(seed)),
          delay: .27 * Math.abs(seed),
          cloudAngle: along * 2.399963 + row * 1.73,
          cloudRadius: .20 + .80 * Math.abs(Math.sin(along * .731 + row * 4.37))
        });
      }
    }
    ribbonCloud.append(fragment);

  }

  const burstProgress = Math.min(1, motion / .46);
  const alignment = Math.max(0, Math.min(1, (motion - .44) / .22));
  const matrix = svg.getScreenCTM();
  if (!matrix) return;
  const gridStyle = getComputedStyle(grid, '::before');
  const cell = parseFloat(gridStyle.backgroundSize) || gridRect.width / 8;
  const left = gridRect.left + (parseFloat(gridStyle.backgroundPositionX) || 0);
  const right = left + Math.floor((gridRect.right - left + .01) / cell) * cell;
  const gridY = gridRect.top;
  const snap = (value, origin) => origin + Math.round((value - origin) / cell) * cell;
  const dissolve = Math.min(1, burstProgress / .27);
  const ink = 1 - dissolve * dissolve * (3 - 2 * dissolve);
  for (const layer of ribbonLayers) {
    layer.style.opacity = ink;
    layer.style.visibility = ink ? '' : 'hidden';
  }
  ribbonCloud.style.visibility = motion === 1 ? 'hidden' : '';
  const crossProgress = Math.max(0, Math.min(1, (motion - .71) / .25));
  const crossEase = crossProgress * crossProgress * (3 - 2 * crossProgress);
  const arm = cell / 2 * crossEase;
  const marks = [];
  if (motion > .59 && motion < 1 && cell > 0) {
    const firstY = gridY + Math.max(0, Math.floor(-gridY / cell)) * cell;
    for (let y = firstY; y <= innerHeight + cell; y += cell) {
      for (let x = left; x <= right + .01; x += cell) {
        const cx = (x - matrix.e) / matrix.a;
        const cy = (y - matrix.f) / matrix.d;
        marks.push('M' + (cx - arm / matrix.a) + ' ' + cy + 'H' + (cx + arm / matrix.a + .01),
          'M' + cx + ' ' + (cy - arm / matrix.d) + 'V' + (cy + arm / matrix.d + .01));
      }
    }
  }
  gridCrosses.setAttribute('d', marks.join(' '));
  gridCrosses.setAttribute('stroke-width', 5 - 4 * Math.min(1, crossProgress * 3));
  gridCrosses.setAttribute('opacity', (.42 - .22 * crossProgress) * Math.min(1, Math.max(0, (motion - .59) / .08)) * (1 - Math.max(0, (motion - .96) / .04)));
  if (motion === 1) return;
  for (const {dot, radius: particleRadius, x, y, dx, dy, delay, cloudAngle, cloudRadius} of cloudParticles) {
    const release = .24 + delay * .65;
    const travel = Math.max(0, (burstProgress - release) / (1 - release));
    const burst = travel * travel * (3 - 2 * travel);
    dot.setAttribute('r', particleRadius * (1 + 1.45 * (1 - Math.sqrt(travel))));
    const px = x + dx * burst;
    const py = y + dy * burst;
    const screenX = px * matrix.a + matrix.e;
    const screenY = py * matrix.d + matrix.f;
    // Stagger assignment near cell boundaries, then gather by radial distance.
    const targetX = Math.min(right, Math.max(left,
      snap(screenX + Math.cos(cloudAngle) * cell * .18, left)));
    const targetY = Math.max(gridY, snap(screenY + Math.sin(cloudAngle) * cell * .18, gridY));
    const dxToNode = screenX - targetX;
    const dyToNode = screenY - targetY;
    const distanceToNode = Math.hypot(dxToNode, dyToNode);
    const rounded = 1 - (1 - alignment) ** 3;
    const contraction = Math.max(0, Math.min(1, (motion - .57) / .09));
    const radius = cell * .32;
    const radialScale = distanceToNode ? radius * Math.tanh(distanceToNode / radius) / distanceToNode : 1;
    const contour = 1 + .16 * Math.sin(cloudAngle * 3 + Math.round((targetX - left) / cell));
    const scatter = radius * cloudRadius * contour;
    const cloudX = (dxToNode * radialScale * .38 + Math.cos(cloudAngle) * scatter) * (1 - contraction);
    const cloudY = (dyToNode * radialScale * .38 + Math.sin(cloudAngle) * scatter) * (1 - contraction);
    dot.setAttribute('cx', px + (cloudX - dxToNode) * rounded / matrix.a);
    dot.setAttribute('cy', py + (cloudY - dyToNode) * rounded / matrix.d);
    const merge = Math.min(1, Math.max(0, (motion - .60) / .09));
    dot.setAttribute('opacity', (1 - ink) * (1 - merge));

  }
}

let dissolveFrame = 0;
window.addEventListener('scroll', () => {
  if (dissolveFrame) return;
  dissolveFrame = requestAnimationFrame(() => {
    dissolveFrame = 0;
    updateRibbonDissolve();
  });
}, {passive: true});
window.addEventListener('resize', updateRibbonDissolve);
reduced.addEventListener('change', updateRibbonDissolve);

function tick(now) {
  if (previous != null) {
    const elapsed = Math.min(now - previous, 50);
    if (!dissolveProgress) {
      if (loopVariant && !heroAudioMuted && now >= manualPluckUntil) advanceLoop(elapsed);
      drawCurve(elapsed);
      drawRainbow(elapsed);
    }
    dotStudy?.update(elapsed, Math.hypot(shiftX, shiftY), focus, Boolean(pointer));
  }
  previous = now;
  frame = requestAnimationFrame(tick);
}
function setPlaying(value) {
  playing = value;
  cancelAnimationFrame(frame);
  previous = null;
  pointer = null;
  if (playing) frame = requestAnimationFrame(tick);
}
layout();
updateRibbonDissolve();
pluckButton.hidden = false;
if (window.AudioContext && soundToggle) {
  soundToggle.hidden = false;
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.title = soundEnabled ? 'Turn sound off' : 'Turn sound on';
    soundToggle.querySelector('use').setAttribute('href',
      './assets/interface-icons.svg?v=2#' + (soundEnabled ? 'speaker' : 'speaker-muted'));
    if (soundEnabled) resumeAudio().catch(() => {});
    else {
      if (audioOutput) audioOutput.gain.value = 0;
      stringRequest++;
    }
  });
}
pluckButton.addEventListener('click', () => {
  manualPluckUntil = performance.now() + manualPluckPause;
  playString(melody[melodyIndex], true);
  melodyIndex = (melodyIndex + 1) % melody.length;
  if (playing && !reduced.matches) pluck = {time: 0};
});
setPlaying(playing);
compact.addEventListener('change', layout);
reduced.addEventListener('change', () => {
  if (reduced.matches) {
    setPlaying(false);
    sceneIndex = 0;
    dotLanded = false;
    sceneTime = 0;
    scenePlucked = false;
    layout();
  }
  else setPlaying(true);
});

const workIndex = document.querySelector('.work-index');
const workPanels = workIndex?.querySelectorAll('.work-intro > .ribbon-intro, .work-overview > h2, .work-list > li, .case > *');
if (workPanels?.length) {
  const paper = workIndex.closest('.paper');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    canvas.className = 'work-grid-motion';
    canvas.setAttribute('aria-hidden', 'true');
    paper.prepend(canvas);

    const gridMotion = new URLSearchParams(location.search).get('gridMotion');
    const quietGrid = !['cloud', 'nodes', 'wave'].includes(gridMotion);
    workIndex.classList.toggle('work-grid-reveal', quietGrid);
    const clamp = value => Math.max(0, Math.min(1, value));
    let hasLockedDots = false;
    let lockedPaperTop = 0;
    let heroPositions;

    function drawWorkTransition() {
      const {width, height, top} = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const viewport = window.innerHeight;
      const gridTop = workIndex.getBoundingClientRect().top;
      const paperTop = paper.getBoundingClientRect().top;
      const transitionStart = Math.max(0, window.scrollY + gridTop - viewport * (quietGrid ? .84 : 1.05));
      const progress = quietGrid ? ribbonScrollState(gridTop).progress
        : clamp((window.scrollY - transitionStart) / (viewport * 1.38));
      const forming = !quietGrid && !reduced.matches && progress > 0 && progress < 1;
      if (progress === 0 || reduced.matches) hasLockedDots = false;
      if (forming && !hasLockedDots) {
        hasLockedDots = true;
        lockedPaperTop = paper.classList.contains('has-dot-study') ? 0 : paperTop;
        heroPositions = dotStudy?.snapshot();
      }
      paper.classList.toggle('is-forming-grid', forming);
      const handoff = quietGrid || reduced.matches ? 0 : clamp(progress / .06);
      paper.style.setProperty('--hero-dot-opacity', quietGrid
        ? 1 - clamp((progress - .40) / .25) : 1 - handoff);
      paper.style.setProperty('--hero-dot-fade-start', Math.max(0, gridTop - paperTop - viewport * .28) + 'px');
      paper.style.setProperty('--hero-dot-fade-end', Math.max(0, gridTop - paperTop) + 'px');
      const settle = clamp((progress - .94) / .06);
      workIndex.style.setProperty('--grid-settle', reduced.matches || quietGrid ? 1 : settle);
      if (quietGrid) {
        workIndex.style.setProperty('--grid-reveal', reduced.matches || progress === 1
          ? '100%' : '0px');
        workIndex.style.setProperty('--grid-settle', reduced.matches ? 1 : clamp((progress - .96) / .04));
        if (progress > .96) workIndex.style.setProperty('--grid-reveal', '100%');
      }
      let contentReveal = 0;
      for (const panel of workPanels) {
        const panelTop = panel.getBoundingClientRect().top - (parseFloat(panel.style.translate.split(' ')[1]) || 0);
        const reveal = reduced.matches ? 1 : progress < 1 ? 0 : clamp((viewport * .86 - panelTop) / (viewport * .22));
        contentReveal = Math.max(contentReveal, reveal);
        panel.style.translate = '0 ' + (1 - reveal) * 48 + 'px';
        panel.style.opacity = String(reveal);
        panel.style.visibility = reveal === 0 ? 'hidden' : '';
      }
      workIndex.style.setProperty('--grid-gray', (quietGrid ? contentReveal * 100 : 100) + '%');
      if (!forming) return;

      const ratio = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const mobileGrid = width <= 720;
      const moduleSize = width / (mobileGrid ? 4 : 8);
      const gridStart = gridTop - top;
      const verticalOffset = mobileGrid ? 0 : moduleSize / 2;
      const align = (position, offset) => Math.round((position - offset) / moduleSize) * moduleSize + offset;
      const firstRow = ((lockedPaperTop + 13.5 - top) % 15 + 15) % 15;
      const margin = moduleSize + 90;
      const visibleStart = Math.max(0, -top - margin);
      const visibleEnd = Math.min(height, viewport - top + margin);
      const startIndex = Math.max(0, Math.floor((visibleStart - firstRow) / 15));
      for (let rowIndex = startIndex, row = firstRow + startIndex * 15;
        row < visibleEnd; row += 15, rowIndex++) {
        for (let column = 13.5, columnIndex = 0; column < width + 15; column += 15, columnIndex++) {
          const verticalLine = align(column, verticalOffset);
          const horizontalLine = align(row, gridStart);
          const dx = verticalLine - column;
          const dy = horizontalLine - row;
          const vertical = Math.abs(dx) < Math.abs(dy);
          const phase = Math.sin(rowIndex * 2.14 + columnIndex * 3.17);
          const diagonalDelay = (column / width + clamp(row / viewport)) * .09;
          const delay = gridMotion === 'wave' ? diagonalDelay : .07 * (phase + 1);
          const local = clamp((progress - delay) / .68);
          const gather = clamp((local - .18) / .82);
          const ease = gather * gather * (3 - 2 * gather);
          const drift = Math.sin(Math.PI * local) ** 1.4 * Math.min(68, width * .15);
          const turn = row * .013 + column * .017 + phase * 1.4 + local * 7;
          const toNode = gridMotion === 'nodes';
          const heroRow = 13.5 + 15 * Math.round((row + top - lockedPaperTop - 13.5) / 15);
          const [offsetX, offsetY, swell] = heroPositions?.get(column + ':' + heroRow) ?? [0, 0, 1];
          const x = column + offsetX * (1 - ease) + (vertical || toNode ? dx * ease : 0)
            + (gridMotion === 'wave' ? drift * .58 : Math.cos(turn) * drift);
          const y = row + offsetY * (1 - ease) + (!vertical || toNode ? dy * ease : 0)
            + (gridMotion === 'wave' ? -drift * .22 : Math.sin(turn) * drift * .8);
          const gray = clamp((local - .25) / .6);
          context.fillStyle = 'rgb(' + [25, 53, 236].map(channel =>
            Math.round(channel + (119 - channel) * gray)).join(' ') + ')';
          const heroFade = clamp((gridStart - row) / (viewport * .28));
          const fadeAbove = row < gridStart ? heroFade + (1 - heroFade) * ease : ease;
          const viewportFade = y < gridStart ? 1 - clamp((progress - .77) / .19) : 1;
          const opacity = handoff * fadeAbove * viewportFade;
          // The added points take over as the moving points settle, especially at crossings.
          const fade = toNode ? 1 - .75 * clamp((progress - .76) / .17) : 1;
          context.globalAlpha = (.52 - .32 * progress) * opacity * fade * (1 - settle);
          context.beginPath();
          context.arc(x, y, (.90 - .25 * progress) * (1 + (swell - 1) * (1 - ease)), 0, Math.PI * 2);
          context.fill();
        }
      }

      // Successively bisect the gaps with round points on the final grid axes.
      context.fillStyle = '#777';
      const addPoint = (x, y, distance, layer) => {
        const delay = gridMotion === 'nodes' ? distance * .11
          : gridMotion === 'wave' ? (x / width + clamp(y / viewport)) * .045 : 0;
        const density = clamp((progress - .69 - layer * .028 - delay) / .065);
        if (!density) return;
        context.globalAlpha = .20 * density * (1 - settle);
        context.beginPath();
        context.arc(x, y, .65, 0, Math.PI * 2);
        context.fill();
      };
      for (let layer = 0; layer < 4; layer++) {
        if (progress < .69 + layer * .028) break;
        const spacing = 15 / 2 ** layer;
        for (let x = verticalOffset; x <= width; x += moduleSize) {
          for (let y = gridStart + spacing / 2; y < visibleEnd; y += spacing) {
            addPoint(x, y, Math.abs(y - align(y, gridStart)) / moduleSize * 2, layer);
          }
        }
        for (let y = gridStart; y < visibleEnd; y += moduleSize) {
          for (let x = spacing / 2; x < width; x += spacing) {
            addPoint(x, y, Math.abs(x - align(x, verticalOffset)) / moduleSize * 2, layer);
          }
        }
      }
      context.globalAlpha = 1;
    }

    let workFrame = 0;
    function scheduleWorkTransition() {
      if (workFrame) return;
      workFrame = requestAnimationFrame(() => {
        workFrame = 0;
        drawWorkTransition();
      });
    }
    window.addEventListener('scroll', scheduleWorkTransition, {passive: true});
    new ResizeObserver(scheduleWorkTransition).observe(workIndex);
    reduced.addEventListener('change', scheduleWorkTransition);
    scheduleWorkTransition();
  }
}
