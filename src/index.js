const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const github = require('@actions/github');
const path = require('path');
const os = require('os');

async function run() {
  try {
    // Get inputs
    const version = core.getInput('version');
    let inputOs = core.getInput('os');
    let inputArch = core.getInput('arch');

    // Determine OS if not specified
    if (!inputOs) {
      const platform = process.platform;
      if (platform === 'win32') {
        inputOs = 'windows';
      } else if (platform === 'darwin') {
        inputOs = 'darwin';
      } else {
        inputOs = 'linux';
      }
    }

    // Determine architecture if not specified
    if (!inputArch) {
      const arch = process.arch;
      if (arch === 'x64') {
        inputArch = 'amd64';
      } else if (arch === 'arm64') {
        inputArch = 'arm64';
      } else {
        throw new Error(`Unsupported architecture: ${arch}`);
      }
    }

    core.info(`Setting up ArgoCD Hydrate for ${inputOs}/${inputArch}`);

    // Get the actual version if 'latest' is specified
    let resolvedVersion = version;
    if (version === 'latest') {
      core.info('Getting latest version...');
      const token = core.getInput('token');

      try {
        // Try to get the latest version via the GitHub API
        let latestVersion;

        if (token) {
          core.info('Using GitHub token to authenticate API request');
          const octokit = github.getOctokit(token);
          const { data: release } = await octokit.rest.repos.getLatestRelease({
            owner: 'kazysgurskas',
            repo: 'argocd-hydrate'
          });
          latestVersion = release.tag_name;
        } else {
          core.info('No GitHub token provided, making unauthenticated API request');
          // Fallback to unauthenticated API request
          const response = await fetch('https://api.github.com/repos/kazysgurskas/argocd-hydrate/releases/latest');

          if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          latestVersion = data.tag_name;
        }

        resolvedVersion = latestVersion;
        core.info(`Latest version found: ${resolvedVersion}`);
      } catch (error) {
        core.warning(`Could not determine latest version: ${error.message}`);
        core.info('Falling back to v0.1.0');
        resolvedVersion = 'v0.1.0'; // Fallback to a known version
      }
    }

    // Remove 'v' prefix if present
    if (resolvedVersion.startsWith('v')) {
      resolvedVersion = resolvedVersion.substring(1);
    }

    core.info(`Using version: ${resolvedVersion}`);

    // Determine the file extension for the binary
    const ext = inputOs === 'windows' ? '.exe' : '';

    // Create the download URL for the archive
    const fileName = `argocd-hydrate-v${resolvedVersion}-${inputOs}-${inputArch}`;
    const archiveFile = `${fileName}.tar.gz`;
    const downloadUrl = `https://github.com/kazysgurskas/argocd-hydrate/releases/download/v${resolvedVersion}/${archiveFile}`;

    core.info(`Downloading from: ${downloadUrl}`);

    // Download the archive
    const archivePath = await tc.downloadTool(downloadUrl);
    core.info(`Downloaded to: ${archivePath}`);

    // Extract the archive
    const extractedPath = await tc.extractTar(archivePath);
    core.info(`Extracted to: ${extractedPath}`);

    // Path to the binary in the extracted archive
    const binPath = path.join(extractedPath, 'argocd-hydrate');

    // Cache the tool
    const cachedPath = await tc.cacheFile(
      binPath,
      `argocd-hydrate${ext}`,
      'argocd-hydrate',
      resolvedVersion
    );

    core.info(`Cached at: ${cachedPath}`);

    // Add the tool to the path
    core.addPath(cachedPath);

    core.info(`Successfully installed ArgoCD Hydrate v${resolvedVersion}`);
    core.setOutput('version', resolvedVersion);
    core.setOutput('path', cachedPath);

  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

run();
