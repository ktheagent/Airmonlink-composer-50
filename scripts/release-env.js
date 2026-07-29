'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'release-metadata.json'), 'utf8'));

const values = {
  app_version: metadata.appVersion,
  build_number: String(metadata.buildNumber),
  build_version: metadata.buildVersion,
  product_slug: metadata.productSlug,
  setup_file: metadata.setupFile,
  portable_file: metadata.portableFile,
  install_directory: metadata.installDirectory,
  validation_artifact: `${metadata.productSlug}-Build${metadata.buildNumber}-Validation`,
  release_artifact: `${metadata.productSlug}-Build${metadata.buildNumber}-Windows`
};

function writeGithubOutput(file) {
  const payload = Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
  fs.appendFileSync(file, payload, 'utf8');
}

if (process.argv.includes('--github-output')) {
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is not available.');
  writeGithubOutput(process.env.GITHUB_OUTPUT);
}

process.stdout.write(`${JSON.stringify(values)}\n`);

module.exports = { values };
