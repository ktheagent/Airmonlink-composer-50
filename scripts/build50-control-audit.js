'use strict';

const fs = require('node:fs');
const path = require('node:path');
const registry = require('../src/composer3/functional-command-registry');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src/composer3/index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/composer3/app.js'), 'utf8');
const traceabilityPath = path.join(root, 'docs/CONTROL-ENGINE-TRACEABILITY.csv');
const reportPath = path.join(root, 'docs/BUILD50-CONTROL-AUDIT.json');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted && character === '"' && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some(cell => cell.length)) rows.push(row);
      row = [];
      value = '';
    } else value += character;
  }
  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const commandIds = [...new Set([...html.matchAll(/data-command="([^"]+)"/g)].map(match => match[1]))];
const executeCases = new Set([...app.matchAll(/case '([^']+)'/g)].map(match => match[1]));
const missingRegistry = commandIds.filter(id => !registry.COMMANDS[id]);
const missingExecution = commandIds.filter(id => !executeCases.has(id));
const enabled = commandIds.filter(id => registry.COMMANDS[id]?.status === registry.STATUS.VERIFIED);
const deferred = commandIds.filter(id => registry.COMMANDS[id]?.status !== registry.STATUS.VERIFIED);
const exposedIncomplete = deferred.filter(id => {
  const result = registry.evaluate(id, { state: () => ({ score: {}, activePartId: 'part-1', selectedEvents: [] }) });
  return result.visible || result.enabled;
});

const traceability = parseCsv(fs.readFileSync(traceabilityPath, 'utf8'));
const build50Headers = [
  'Build 50 status',
  'Build 50 production visibility',
  'Build 50 execution path',
  'Build 50 automated evidence',
  'Build 50 release evidence'
];
const existingStart = traceability[0].indexOf(build50Headers[0]);
if (existingStart >= 0) traceability.forEach(row => row.splice(existingStart, build50Headers.length));
traceability[0].push(...build50Headers);

for (const row of traceability.slice(1)) {
  const id = String(row[0] || '').replace(/^data-command:/, '');
  const command = registry.COMMANDS[id];
  if (!command) {
    row.push('UNREGISTERED', 'HIDDEN', 'MISSING', 'scripts/build50-control-audit.js', 'Fails Build 50 control gate');
    continue;
  }
  const production = command.status === registry.STATUS.VERIFIED;
  row.push(
    command.status,
    production ? 'VISIBLE WHEN CONTEXT SATISFIED' : 'HIDDEN',
    executeCases.has(id) ? `execute('${id}')` : 'MISSING',
    'test/build50-functional-release-candidate.test.js; scripts/build50-control-audit.js',
    production
      ? 'Source and automated control wiring verified; Windows/manual interaction remains pending'
      : command.reason
  );
}

const report = {
  schemaVersion: 1,
  buildNumber: 50,
  version: '1.3.0',
  generatedAt: new Date().toISOString(),
  totals: {
    controls: commandIds.length,
    registered: commandIds.length - missingRegistry.length,
    productionEnabled: enabled.length,
    centrallyHidden: deferred.length
  },
  gates: {
    everyControlRegistered: missingRegistry.length === 0,
    everyControlHasExecutionPath: missingExecution.length === 0,
    noIncompleteControlExposed: exposedIncomplete.length === 0
  },
  missingRegistry,
  missingExecution,
  exposedIncomplete,
  productionCommands: enabled,
  deferredCommands: deferred.map(id => ({ id, status: registry.COMMANDS[id].status, reason: registry.COMMANDS[id].reason })),
  windowsPackaging: {
    unpackedApplicationCreated: true,
    installerCreated: false,
    portableCreated: false,
    evidence: 'electron-builder created release/win-unpacked and entered NSIS generation.',
    blocker: 'NSIS/portable generation stopped at spawn wine ENOENT; Windows execution verification is unavailable.'
  },
  releaseStatus: 'IMPLEMENTED BUT NOT VERIFIED',
  releaseBlockers: [
    'Chromium is unavailable, so browser smoke and viewport matrix validation cannot run.',
    'Windows x64 unpacked application was created, but installer/portable generation requires Wine and all artifacts remain unverified on Windows.',
    'Physical printing, MIDI hardware, accessibility assistive-technology, and real-user workflows require external hardware or manual evidence.',
    'Three consecutive whole-system audit cycles have not passed.'
  ]
};

if (!report.gates.everyControlRegistered || !report.gates.everyControlHasExecutionPath || !report.gates.noIncompleteControlExposed) {
  throw new Error(`Build 50 control audit failed: ${JSON.stringify(report.gates)}`);
}

fs.writeFileSync(traceabilityPath, `${traceability.map(row => row.map(csvCell).join(',')).join('\n')}\n`);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report.totals)}\n`);
