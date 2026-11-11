const projectIndex = document.querySelector('.work-toc');
const projectDetails = projectIndex.querySelector('details');
const projectLinks = Array.from(projectIndex.querySelectorAll('a'));
const projectCards = projectLinks.map(link => document.getElementById(link.hash.slice(1)));
const currentProjectLabel = projectIndex.querySelector('[data-current]');
const mobileIndex = matchMedia('(max-width: 800px)');

function adaptProjectIndex() {
  projectDetails.open = !mobileIndex.matches;
}

let activeProject = -1;
let pendingProjectUpdate = false;

function updateActiveProject() {
  pendingProjectUpdate = false;
  const threshold = Math.max(138, window.innerHeight * .26);
  const current = Math.max(0, projectCards.findLastIndex(card => card.getBoundingClientRect().top <= threshold));
  if (current === activeProject) return;
  projectLinks[activeProject]?.removeAttribute('aria-current');
  projectLinks[current].setAttribute('aria-current', 'location');
  currentProjectLabel.textContent = projectLinks[current].querySelector('[data-title]').textContent;
  activeProject = current;

  if (!mobileIndex.matches) {
    const visible = projectDetails.getBoundingClientRect();
    const active = projectLinks[current].getBoundingClientRect();
    if (active.top < visible.top) projectDetails.scrollTop += active.top - visible.top;
    else if (active.bottom > visible.bottom) projectDetails.scrollTop += active.bottom - visible.bottom;
  }
}

function scheduleProjectUpdate() {
  if (pendingProjectUpdate) return;
  pendingProjectUpdate = true;
  requestAnimationFrame(updateActiveProject);
}

mobileIndex.addEventListener('change', adaptProjectIndex);
window.addEventListener('scroll', scheduleProjectUpdate, {passive: true});
window.addEventListener('resize', scheduleProjectUpdate);
window.addEventListener('pageshow', scheduleProjectUpdate);

projectIndex.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!mobileIndex.matches || !link) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  projectDetails.open = false;
  const card = document.getElementById(link.hash.slice(1));
  history.pushState(null, '', link.hash);
  requestAnimationFrame(() => {
    const margin = parseFloat(getComputedStyle(card).scrollMarginTop);
    window.scrollTo({top: window.scrollY + card.getBoundingClientRect().top - margin});
    card.querySelector('a').focus({preventScroll: true});
    scheduleProjectUpdate();
  });
});

adaptProjectIndex();
updateActiveProject();

const pointerPreference = matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)');
const projectGrid = document.querySelector('.sticky-projects .project-grid');
const projectPointer = document.createElement('span');
projectPointer.className = 'project-pointer';
const pointerArrow = projectGrid.querySelector('.project-arrow svg').cloneNode(true);
const pointerLabel = document.createElement('span');
pointerLabel.textContent = 'see project';
projectPointer.append(pointerArrow, pointerLabel);
projectPointer.hidden = true;
projectPointer.setAttribute('aria-hidden', 'true');
document.body.append(projectPointer);

let hoveredProject;
function clearProjectPointer() {
  hoveredProject?.classList.remove('has-project-pointer');
  hoveredProject = null;
  projectPointer.hidden = true;
}

projectGrid.addEventListener('pointermove', event => {
  const link = event.target.closest('.project-card > a');
  if (!pointerPreference.matches || event.pointerType !== 'mouse' || !link) {
    clearProjectPointer();
    return;
  }
  if (link !== hoveredProject) {
    clearProjectPointer();
    hoveredProject = link;
    link.classList.add('has-project-pointer');
  }
  projectPointer.style.left = event.clientX + 'px';
  projectPointer.style.top = event.clientY + 'px';
  projectPointer.hidden = false;
});
projectGrid.addEventListener('pointerleave', clearProjectPointer);
window.addEventListener('scroll', clearProjectPointer, {passive: true});
window.addEventListener('blur', clearProjectPointer);
pointerPreference.addEventListener('change', clearProjectPointer);
