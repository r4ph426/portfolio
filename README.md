# Raphael Regli · Portfolio

The portfolio is a static site. The selected cobalt ribbon homepage and all its dependencies are in `docs/`.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1 --directory docs` and open http://127.0.0.1:8000.

## GitHub Pages

Push to `main`. In the repository's **Settings → Pages**, select **Deploy from a branch**, then **main → /docs**, and save. The site uses relative asset URLs and does not need a build step.

The original design studies in `site/` are kept locally. Keep unpublished research, client materials, and credentials out of this repository.
