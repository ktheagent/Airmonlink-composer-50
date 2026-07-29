'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const mode = process.argv[2];
const configs = {
  browser: {
    source: path.join(__dirname, 'browser-smoke.js'),
    generated: path.join(__dirname, '.browser-smoke-build50.generated.js'),
    report: path.join(root, 'validation', 'browser-smoke.json')
  },
  viewport: {
    source: path.join(__dirname, 'viewport-matrix.js'),
    generated: path.join(__dirname, '.viewport-matrix-build50.generated.js'),
    report: path.join(root, 'validation', 'build50-viewport-matrix.json')
  }
};

if (!configs[mode]) {
  console.error('Usage: node scripts/build50-browser-validation.js <browser|viewport>');
  process.exit(2);
}

const config = configs[mode];
const timeoutMs = Number(process.env.BUILD50_BROWSER_TIMEOUT_MS || 14 * 60 * 1000);
const pollMs = 500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function prepareHarness() {
  let source = fs.readFileSync(config.source, 'utf8');
  source = source
    .split('Build 43').join('Build 50 regression')
    .split('build43').join('build50')
    .split('BUILD43').join('BUILD50');
  fs.writeFileSync(config.generated, source, 'utf8');
  fs.rmSync(config.report, { force: true });
}

function terminateTree(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, 'SIGTERM');
      setTimeout(() => {
        try { process.kill(-child.pid, 'SIGKILL'); } catch (_) {}
      }, 2500).unref();
    }
  } catch (_) {
    try { child.kill('SIGKILL'); } catch (_) {}
  }
}

function validateReport(report) {
  if (!report || report.status !== 'PASS') {
    throw new Error(`${mode} validation report did not pass: ${JSON.stringify(report)}`);
  }
  if (mode === 'browser') {
    if (!Array.isArray(report.checks) || report.checks.length === 0) {
      throw new Error('Browser validation report contains no checks.');
    }
    const failed = report.checks.filter(item => item.status !== 'PASS');
    if (failed.length) throw new Error(`Browser validation recorded failures: ${JSON.stringify(failed)}`);
  } else {
    if (!Array.isArray(report.scenarios) || report.scenarios.length !== 4) {
      throw new Error('Viewport validation did not record the four required scenarios.');
    }
    const failed = report.scenarios.flatMap(item => item.checks || []).filter(item => item.status !== 'PASS');
    if (failed.length || report.passed !== report.checks) {
      throw new Error(`Viewport validation recorded failures: ${JSON.stringify(failed)}`);
    }
  }
}

async function main() {
  prepareHarness();
  const child = spawn(process.execPath, [config.generated], {
    cwd: root,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    env: process.env
  });
  const started = Date.now();

  try {
    while (Date.now() - started < timeoutMs) {
      if (fs.existsSync(config.report)) {
        let report;
        try {
          report = JSON.parse(fs.readFileSync(config.report, 'utf8'));
        } catch (_) {
          await sleep(pollMs);
          continue;
        }
        if (report.status === 'FAIL') {
          terminateTree(child);
          validateReport(report);
        }
        if (report.status === 'PASS') {
          validateReport(report);
          terminateTree(child);
          console.log(`Build 50 ${mode} validation supervisor confirmed PASS.`);
          return;
        }
      }
      if (child.exitCode !== null && !fs.existsSync(config.report)) {
        throw new Error(`${mode} validation exited with code ${child.exitCode} before writing a report.`);
      }
      await sleep(pollMs);
    }
    throw new Error(`${mode} validation exceeded the bounded ${timeoutMs} ms runtime.`);
  } finally {
    terminateTree(child);
    fs.rmSync(config.generated, { force: true });
  }
}

main().catch(error => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
