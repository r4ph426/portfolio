const menuOptions = ['Schnitt', 'Module', 'Kontaktbogen', 'Blaue Iris', 'Satzspiegel'];

{
  const requestedMenu = new URLSearchParams(location.search).get('menu');
  const header = document.querySelector('.hero-menu');
  const details = header.querySelector('details');
  const summary = details.querySelector('summary');
  const nav = details.querySelector('nav');
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './menu-preview.css?v=8';
  document.head.append(stylesheet);

  const motionOptions = {paper: 'Papierstreifen', wave: 'Wiggle', type: 'Typografische Blende'};
  const motion = new URLSearchParams(location.search).get('menuMotion');
  if (requestedMenu === null) {
    header.dataset.menuMotion = Object.hasOwn(motionOptions, motion) ? motion : 'paper';
  }
  if (Object.hasOwn(motionOptions, motion)) {
    header.dataset.menuMotion = motion;
    const picker = document.createElement('nav');
    picker.className = 'menu-picker';
    picker.setAttribute('aria-label', 'Menüanimationen');
    for (const [value, label] of Object.entries(motionOptions)) {
      const link = document.createElement('a');
      const url = new URL(location.href);
      url.searchParams.delete('menu');
      url.searchParams.set('menuMotion', value);
      link.href = url;
      link.textContent = label;
      if (value === motion) link.setAttribute('aria-current', 'page');
      picker.append(link);
    }
    document.body.append(picker);
  }

  const chapters = [
    ['top', 'intro'],
    ['work-title', 'selected work'],
    ['wechselspiel', 'wechselspiel']
  ];

  const links = chapters.map(([id, title], index) => {
    const link = document.createElement('a');
    link.href = '#' + id;
    link.innerHTML = '<span class="chapter-number" aria-hidden="true">0' + (index + 1) +
      '</span><span class="chapter-dot" aria-hidden="true"></span><span>' + title +
      '</span><span class="chapter-arrow" aria-hidden="true"><svg width="22" height="22"><use href="./assets/interface-icons.svg#arrow-' + (index ? 'down' : 'up') + '"/></svg></span>';
    return link;
  });
  nav.prepend(...links);
  nav.querySelectorAll('a').forEach(link => {
    if (!links.includes(link)) link.remove();
  });

  const picker = document.createElement('div');
  picker.className = 'menu-picker';
  const label = document.createElement('label');
  label.textContent = 'Menüvariante ';
  const select = document.createElement('select');
  menuOptions.forEach((name, index) => select.add(new Option('0' + (index + 1) + ' · ' + name, index + 1)));
  label.append(select);
  picker.append(label);
  if (requestedMenu !== null) document.body.append(picker);

  const markers = document.createElement('span');
  markers.className = 'menu-markers';
  markers.setAttribute('aria-hidden', 'true');
  markers.innerHTML = '<i></i><i></i><i></i>';
  summary.prepend(markers);

  function updateChapter() {
    const active = chapters.findLastIndex(([id]) => document.getElementById(id).getBoundingClientRect().top <= 120);
    links.forEach((link, index) => {
      if (index === Math.max(0, active)) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    header.dataset.chapter = Math.max(0, active);
  }

  select.value = requestedMenu;
  if (!select.value) select.value = '5';
  header.dataset.menu = select.value;
  select.addEventListener('change', () => {
    exitAnimation?.cancel();
    header.dataset.menu = select.value;
    details.open = true;
    const url = new URL(location.href);
    url.searchParams.set('menu', select.value);
    history.replaceState(history.state, '', url);
  });
  let exitAnimation;
  const reducedMenuMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function closeMenu() {
    if (!details.open || exitAnimation) return;
    if (header.dataset.menu !== '5' || reducedMenuMotion.matches) {
      details.open = false;
      return;
    }

    if (header.dataset.menuMotion) {
      const animations = nav.getAnimations({subtree: true});
      if (animations.length) {
        for (const animation of animations) animation.reverse();
        exitAnimation = {
          cancel() {
            for (const animation of animations) animation.reverse();
            exitAnimation = null;
          }
        };
        const closing = exitAnimation;
        Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
          if (exitAnimation !== closing) return;
          details.open = false;
          exitAnimation = null;
        });
        return;
      }
    }

    const animation = nav.animate([
      {transform: getComputedStyle(nav).transform},
      {transform: 'translateY(-100%)'}
    ], {duration: 360, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards'});
    exitAnimation = animation;
    animation.finished.then(() => {
      details.open = false;
      animation.cancel();
    }, () => {}).finally(() => {
      if (exitAnimation === animation) exitAnimation = null;
    });
  }

  summary.addEventListener('click', event => {
    if (!details.open) return;
    event.preventDefault();
    if (exitAnimation) exitAnimation.cancel();
    else closeMenu();
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      summary.focus({preventScroll: true});
      closeMenu();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && details.open) {
      closeMenu();
      summary.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target) && !event.target.closest('.menu-picker')) closeMenu();
  });
  window.addEventListener('scroll', updateChapter, {passive: true});
  function updateMenuWidth() {
    header.style.setProperty('--menu-viewport', document.documentElement.clientWidth + 'px');
    updateChapter();
  }
  window.addEventListener('resize', updateMenuWidth);
  updateMenuWidth();
}
