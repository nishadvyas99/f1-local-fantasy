// backend/services/fetchGrid.js
const { spawn } = require('child_process');
const path = require('path');

function fetchStartingGrid(season, gpName) {
  return new Promise((resolve, reject) => {
    // Path to your Python script
    const script = path.join(__dirname, '../scripts/race_info.py');
    // Path to the venv’s python
    const python = path.join(__dirname, '../scripts/venv/bin/python3');

    const proc = spawn(python, [script, season, gpName]);

    let out = '';
    let err = '';
    proc.stdout.on('data', chunk => out += chunk);
    proc.stderr.on('data', chunk => err += chunk);

    proc.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Python exited ${code}: ${err}`));
      }
      try {
        const data = JSON.parse(out);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = { fetchStartingGrid };