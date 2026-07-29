'use strict';
const fs=require('fs');
const w=fs.readFileSync('.github/workflows/windows-build.yml','utf8');
const errors=[];
for(const token of [
'name: Build Windows Release',
'validate:',
'build-windows:',
'Export authoritative Build 50 metadata',
'Version consistency gate',
'Validate workflow YAML',
'Verify Windows release files',
'Silent install and bounded startup smoke',
'Upload Windows release',
'if-no-files-found: error'
]) if(!w.includes(token)) errors.push(`missing ${token}`);
if(/Build43|build43|BUILD43|1\.2\.3\.43|Airmonlink-Composer-1\.2\.3-Build43|AirmonlinkComposerBuild43/i.test(w)) errors.push('stale Build 43 identity');
if(/continue-on-error:\s*true/i.test(w)) errors.push('continue-on-error is forbidden');
for(const variable of ['APP_VERSION','BUILD_NUMBER','BUILD_VERSION','PRODUCT_SLUG','SETUP_FILE','PORTABLE_FILE','INSTALL_DIRECTORY']) if(!w.includes(variable)) errors.push(`missing metadata variable ${variable}`);
if(errors.length){console.error('Workflow validation FAILED:\n- '+errors.join('\n- '));process.exit(1)}
console.log('Workflow validation PASS');
