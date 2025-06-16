# LME documentation repository

Tracks all logging made easy documentation for LME's public github hosted documentation website.

## how it works: 

Using [github-pages](https://pages.github.com/), the actions pipeline for this repository, uses a static-site generator called [hugo](https://gohugo.io/) to create a html/css content from the markdown files in `/content/`. Default Hugo creates plan html websites with little design, so to get a more robust site, we're using the [docsy](https://www.docsy.dev/docs/) theme. This theme includes templates for documentation, search, and best practices as seen in its docs page linked in the previous sentence. 

This is all configured under [jobs](https://github.com/mreeve-snl/docs-test/blob/main/.github/workflows/hugo.yml#L29) in the github workflow for this repository. 

## Building locally: 

Essentially, this builds from the workflow after any push to main using the gohugo.io hugo binary

since we'll want to test things locally before uploading to main, you can:
 1. download hugo locally: (windows: https://gohugo.io/installation/windows/#prebuilt-binaries)
 2. download git if you don't have it: https://git-scm.com/downloads/win (download 64-bit windows)
 3. if you don't have go, you'll need it to pull in the website depends: https://go.dev/dl/ (windows download the .msi file under: https://go.dev/dl/#featured)
 4. clone the docs repo locally: `git clone https://github.com/mreeve-snl/docs-test.git`
 5. run `hugo serve` in the repo directory to build it and see it in the browser locally at `localhost:1313` 


If you have docker and docker compose installed, you can run everything by running this in the root directory

```bash
docker compose up server
# Web Server is available at http://localhost:1313/lme-docs/
```

If you need to run it behind a proxy you can use a command like this to make sure all the certificates get overriden:
```bash
podman run  -v ./ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt -v ./:/project -v ~/hugo_cache:/cache -p1313:1313 ghcr.io/gohugoio/hugo:v0.147.8 serve --port 1313 --bind 0.0.0.0 --disableFastRender
```
