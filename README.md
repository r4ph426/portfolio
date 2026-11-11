# Raphael Regli · Portfolio

The portfolio is a static site. The selected cobalt ribbon homepage and its public assets are in `docs/`.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1 --directory docs` and open http://127.0.0.1:8000.

## GitHub Pages

Push to `main`. In the repository's **Settings → Pages**, select **Deploy from a branch**, then **main → /docs**, and save. The site uses relative asset URLs and does not need a build step.

The original design studies in `site/` are kept locally. Keep unpublished research, client materials, and credentials out of this repository.

## Portfolio design system

See [Design system v1](DESIGN_SYSTEM.md) for foundations, components, and usage. Open [the live specimen](http://127.0.0.1:8000/design-system.html) while the local preview server is running.

For the local art direction comparison, open `/?preview=1&type=eiko#wechselspiel` or `/?preview=1&type=editorial#wechselspiel`. Editorial New and Neue Montreal are the current default. The switch below the case uses the same layout and copy. PP fonts resolve from local preview files or installed system fonts and are not bundled; the preview identifies any active fallback. Geist and Geist Mono are bundled under the SIL Open Font License. The Wechselspiel section shows the beta menu and working graphics. The project cards below link to standalone case pages in `docs/work/`.
