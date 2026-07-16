# Workflow Status

GitHub Pages deployment is temporarily disabled.

The preserved workflow is `deploy-pages.yml.disabled`. GitHub Actions only
detects `.yml` and `.yaml` files in this directory, so it cannot run while the
file has the `.disabled` suffix.

To restore automatic deployment, rename it back to `deploy-pages.yml` and
merge that change into `main`.
