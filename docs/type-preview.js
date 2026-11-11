// The review switch is opt-in and uses locally installed commercial faces.
const params = new URLSearchParams(location.search);
const comparison = document.querySelector('.type-preview');
const selected = params.has('preview') && params.get('type') === 'eiko' ? 'eiko' : document.documentElement.dataset.type;
document.documentElement.dataset.type = selected;

if (params.has('preview')) {
  comparison.hidden = false;
  const mono = ['400 13px "Neue Montreal Mono"', 'PP Neue Montreal Mono Book'];
  const fonts = {
    eiko: [['italic 500 24px Eiko', 'PP Eiko Medium Italic'], ['400 16px Geist', 'Geist'], mono],
    editorial: [['400 24px Editorial', 'PP Editorial New'], ['400 16px Montreal', 'PP Neue Montreal'], mono],
  };
  let generation = 0;
  async function apply(value) {
    const id = ++generation;
    document.documentElement.dataset.type = value;
    params.set('type', value);
    history.replaceState(null, '', '?' + params + location.hash);
    const results = await Promise.all(fonts[value].map(async ([spec, name]) => {
      try { return (await document.fonts.load(spec)).length ? null : name; }
      catch { return name; }
    }));
    if (id !== generation) return;
    const missing = results.filter(Boolean);
    comparison.querySelector('.font-status').textContent =
      missing.length ? 'Fallback active for: ' + missing.join(', ') + '.' : 'All faces in this pairing loaded.';
  }
  for (const input of comparison.querySelectorAll('input')) {
    input.checked = input.value === selected;
    input.addEventListener('change', () => apply(input.value));
  }
  apply(selected);
}
