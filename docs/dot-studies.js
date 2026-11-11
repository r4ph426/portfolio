const studies = {
  push: {reach: 36, strength: 10, settle: 85, direction: 'outward'},
  wake: {reach: 52, strength: 14, settle: 220, direction: 'along'},
  spring: {reach: 43, strength: 13, settle: 130, direction: 'spring'},
};

const ambientMotions = {
  breathe(x, y, time) {
    return [0, 0, 1 + .34 * Math.sin(time / 1150 + y / 125 + x / 480)];
  },
  breeze(x, y, time) {
    const phase = time / 1150 + y / 115 - x / 260;
    return [3.6 * Math.sin(phase), 1.4 * Math.cos(phase), 1];
  },
  ripple(x, y, time) {
    const wave = Math.sin((x * .65 + y) / 48 - time / 580);
    const crest = Math.max(0, wave) ** 4;
    return [0, -3.4 * crest, 1 + .3 * crest];
  },
};

function createDotStudy(svg, track) {
  const query = new URLSearchParams(location.search);
  const motionName = query.get('ambient');
  const ambient = Object.hasOwn(ambientMotions, motionName) ? ambientMotions[motionName] : null;
  const name = query.get('dots');
  if (!Object.hasOwn(studies, name)) return;
  const study = studies[name];
  const paper = svg.closest('.paper');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.className = 'dot-study';
  canvas.setAttribute('aria-hidden', 'true');
  paper.prepend(canvas);
  paper.classList.add('has-dot-study');

  let width, height;
  let dots = [];
  let displaced = [];
  let release = 0;
  let time = 0;
  let sincePaint = 0;
  let scrollY = window.scrollY;
  let scrollImpulse = 0;
  let scrollPaintPending = false;

  window.addEventListener('scroll', () => {
    const nextScrollY = window.scrollY;
    scrollImpulse = Math.max(-12, Math.min(12, scrollImpulse + (nextScrollY - scrollY) * .18));
    scrollY = nextScrollY;
    scrollPaintPending = true;
  }, {passive: true});

  function position(dot) {
    const [driftX, driftY, swell] = ambient && time
      ? ambient(dot.x, dot.y, time) : [0, 0, 1];
    const phase = dot.y / 96 - dot.x / 180 + scrollY / 110;
    return [
      dot.x + dot.dx + driftX + Math.sin(phase) * scrollImpulse,
      dot.y + dot.dy + driftY + Math.cos(phase) * scrollImpulse * .55,
      swell
    ];
  }

  function snapshot() {
    const top = canvas.getBoundingClientRect().top;
    return new Map(dots.filter(dot => dot.y + top > -24 && dot.y + top < innerHeight + 24)
      .map(dot => {
        const [x, y, swell] = position(dot);
        return [dot.x + ':' + dot.y, [x - dot.x, y - dot.y, swell]];
      }));
  }

  function paint(dotsToDraw, radius = .90) {
    context.beginPath();
    for (const dot of dotsToDraw) {
      const [x, y, swell] = position(dot);
      const size = radius * swell;
      context.moveTo(x + size, y);
      context.arc(x, y, size, 0, Math.PI * 2);
    }
    context.fill();
  }

  function resize() {
    time = sincePaint = scrollImpulse = 0;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = 'rgba(25,53,236,.52)';
    dots = [];
    for (let y = 13.5; y < height; y += 15) {
      for (let x = 13.5; x < width; x += 15) dots.push({x, y, dx: 0, dy: 0});
    }
    displaced = [];
    paint(dots);
  }

  function update(elapsed, wiggle, focus, active) {
    if (!width) return;
    time += elapsed;
    scrollImpulse *= Math.exp(-elapsed / 210);
    if (Math.abs(scrollImpulse) < .03) scrollImpulse = 0;
    if (!active && !displaced.length) {
      if (!ambient && !scrollPaintPending) return;
      sincePaint += elapsed;
      if (sincePaint < 33) return;
      sincePaint = 0;
      scrollPaintPending = scrollImpulse !== 0;
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(25,53,236,.52)';
      paint(dots);
      return;
    }
    const paperRect = canvas.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const view = svg.viewBox.baseVal;
    const scale = svgRect.width / view.width;
    const offsetX = svgRect.left - paperRect.left;
    const offsetY = svgRect.top - paperRect.top;
    const halfStroke = parseFloat(getComputedStyle(track).strokeWidth) * scale / 2;
    const radius = halfStroke + study.reach;
    const focusX = offsetX + focus * scale;
    const pull = .55 + .45 * Math.min(1, Math.abs(wiggle) / (view.height * .12));
    const samples = [];
    if (active) {
      const length = track.getTotalLength();
      for (let i = 0; i <= length; i += 9 / scale) {
        const point = track.getPointAtLength(i);
        const x = offsetX + point.x * scale;
        if (Math.abs(x - focusX) > svgRect.width * .24) continue;
        samples.push({x, y: offsetY + point.y * scale});
      }
    }
    release = active ? 0 : release + elapsed;
    const next = new Set(displaced);
    const targets = new Map();
    for (const dot of dots) {
      if (!samples.length) break;
      if (Math.abs(dot.x - focusX) > svgRect.width * .24 + radius) continue;
      if (dot.y < offsetY - radius || dot.y > offsetY + svgRect.height + radius) continue;
      let nearest;
      let squared = radius * radius;
      for (const sample of samples) {
        const distance = (dot.x - sample.x) ** 2 + (dot.y - sample.y) ** 2;
        if (distance < squared) {
          squared = distance;
          nearest = sample;
        }
      }
      if (!nearest) continue;
      const distance = Math.sqrt(squared) || 1;
      const pressure = Math.min(1, (radius - distance) / (study.reach * .65));
      const local = Math.sqrt(1 - Math.min(1, Math.abs(dot.x - focusX) / (svgRect.width * .24)));
      const amount = study.strength * pressure * local * pull;
      const dx = (dot.x - nearest.x) / distance;
      const dy = (dot.y - nearest.y) / distance;
      targets.set(dot, study.direction === 'along'
        ? {x: (dx * .4 + .7) * amount, y: dy * amount * .6}
        : {x: dx * amount, y: dy * amount});
      next.add(dot);
    }
    if (!next.size && !ambient) return;

    const blend = 1 - Math.exp(-elapsed / study.settle);
    displaced = [];
    for (const dot of next) {
      const target = targets.get(dot);
      dot.dx += ((target?.x ?? 0) - dot.dx) * blend;
      dot.dy += ((target?.y ?? 0) - dot.dy) * blend;
      if (active) {
        dot.releaseX = dot.dx;
        dot.releaseY = dot.dy;
      } else if (study.direction === 'spring') {
        const rebound = Math.cos(release / 65) * Math.exp(-release / 100);
        dot.dx = (dot.releaseX ?? 0) * rebound;
        dot.dy = (dot.releaseY ?? 0) * rebound;
      }
      if (Math.hypot(dot.dx, dot.dy) > .03 || target || (study.direction === 'spring' && !active && release < 260)) displaced.push(dot);
      else dot.dx = dot.dy = 0;
    }
    context.clearRect(0, 0, width, height);
    const moving = new Set(displaced);
    context.fillStyle = 'rgba(25,53,236,.52)';
    paint(dots.filter(dot => !moving.has(dot)));
    context.fillStyle = 'rgba(25,53,236,.78)';
    paint(displaced, 1.1);
  }

  new ResizeObserver(resize).observe(canvas);
  resize();
  return {update, reset: resize, snapshot};
}
