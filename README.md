# ScaryMonkeyPortfolio_Docker
A Portfolio website docker setup built use Vite, Node.js, Tailwind, Nginx, and Three.js.

All code is open source and free to use.

## How deploys work

1. Push to `main`.
2. GitHub Actions (`.github/workflows/deploy.yml`) builds the image on GitHub's runners and pushes it to
   `ghcr.io/johnheim14/scarymonkeyportfolio_docker:latest`.
3. Watchtower on the server checks GHCR every 5 minutes and restarts the site with the new image.

## Server setup (Portainer)

1. If an old copy of the site is still running, remove its container/stack first so port `4080` is free.
2. If the GHCR package is private, add it under **Registries → Add registry → Custom registry**
   (URL `ghcr.io`, username `johnheim14`, a GitHub token with `read:packages` as the password),
   or make the package public under GitHub → Packages → Package settings.
3. **Stacks → Add stack**, name it `scary-monkey`, and either paste `docker-compose.yml` into the
   **Web editor** or choose **Repository** with this repo's URL and compose path `docker-compose.yml`.
4. **Deploy the stack.** The site is served on port `4080`.

After that, every push to `main` is live within about 5 minutes. Watchtower handles the update, so the
stack doesn't need to be redeployed in Portainer.

Without Portainer: copy `docker-compose.yml` to the server and run `docker compose up -d`.

To build the image locally instead: `docker build -t scary-monkey-web ./web`.

## Local development

```sh
cd web
npm ci
npm run dev
```
