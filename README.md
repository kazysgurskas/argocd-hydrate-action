# Setup ArgoCD Hydrate Action

This GitHub Action sets up the [ArgoCD Hydrate](https://github.com/kazysgurskas/argocd-hydrate) binary in your GitHub Actions workflow. It automatically detects and installs the appropriate version for your runner's operating system and architecture.

## Features

- Cross-platform support (Linux, macOS, Windows)
- Multi-architecture support (amd64, arm64)
- Version specification
- Caching using `@actions/tool-cache` for improved performance

## Usage

Add the following step to your GitHub Actions workflow:

```yaml
- name: Setup ArgoCD Hydrate
  uses: kazysgurskas/setup-argocd-hydrate@v1
  with:
    # Optional parameters (defaults shown)
    version: 'latest'     # Version to install (e.g., 'v1.0.0' or 'latest')
    token: ${{ github.token }}  # GitHub token for API requests (recommended)
    # The following are auto-detected, but can be specified if needed
    arch: ''              # Architecture (amd64, arm64)
    os: ''                # OS (linux, darwin, windows)
```

After setting up the hydrate, you can use it in subsequent steps:

```yaml
- name: Hydrate ArgoCD applications
  run: |
    argocd-hydrate --applications ./manifests/applications.yaml \
                   --output ./manifests \
                   --charts-dir ./charts
```

## Examples

### Basic usage

```yaml
name: Hydrate ArgoCD Applications

on:
  push:
    paths:
      - 'manifests/**'

jobs:
  hydrate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup ArgoCD Hydrate
        uses: kazysgurskas/setup-argocd-hydrate@v1
        with:
          token: ${{ github.token }}

      - name: Hydrate Applications
        run: |
          argocd-hydrate --applications ./manifests/applications.yaml \
                         --output ./manifests/hydrated \
                         --charts-dir ./tmp/charts
```

### Using a specific version

```yaml
- name: Setup ArgoCD Hydrate
  uses: kazysgurskas/setup-argocd-hydrate@v1
  with:
    version: 'v1.2.0'
```

### Specifying OS and architecture

```yaml
- name: Setup ArgoCD Hydrate
  uses: kazysgurskas/setup-argocd-hydrate@v1
  with:
    os: 'darwin'
    arch: 'arm64'
```

### Full example

You can find the full example for a real gitops diff when using ArgoCD app of apps pattern [here](example/gitops-diff.yaml).

## Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `version` | Version of ArgoCD Hydrate to install | No | `latest` |
| `token` | GitHub token for API requests | No | `''` |
| `arch` | Architecture to install (amd64, arm64) | No | Auto-detected |
| `os` | Operating system to install (linux, windows, darwin) | No | Auto-detected |

## Outputs

| Output | Description |
| --- | --- |
| `version` | The resolved version of ArgoCD Hydrate that was installed |
| `path` | Path where the binary was cached |

## How It Works

This action:

1. Determines the appropriate OS and architecture for your system
2. Downloads the ArgoCD Hydrate release archive from GitHub
3. Extracts the binary and caches it using `@actions/tool-cache`
4. Adds the binary to the PATH

## Development

To make changes to this action:

1. Modify the code in `src/index.js`
2. Install dependencies with `npm install`
3. Build the action with `npm run build`
4. Commit both source and built files

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
