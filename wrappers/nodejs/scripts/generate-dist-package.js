/* License: Apache 2.0. See LICENSE file in root directory.
   Copyright(c) 2017 Intel Corporation. All Rights Reserved. */

// Purpose: pack librealsense dir & wrappers/nodejs dir into npm package

const {exec} = require('child_process');
const package = require('../package.json');
const jf = require('jsonfile');

function genDistPackage() {
  genPackageJson().then(() => {
    callDistScript();
  });
}

function genPackageJson() {
  return new Promise((resolve, reject) => {
    exec('cp -f ./package.json scripts/npm_dist/package.json', (error, stdout, stderr) => {
      if (error) {
        console.log('fail to generate package.json, error:', error);
        reject(error);
      }

      let distPackage = require('../scripts/npm_dist/package.json');
      distPackage.scripts['preinstall'] = 'node scripts/npm_dist/build-librealsense.js';
      jf.writeFileSync('./scripts/npm_dist/package.json', distPackage, {spaces: 2});
      resolve();
    });
  });
}

function callDistScript() {
  const fileName = 'librealsense.' + package.version + '.tar.gz';
  const child = exec('./scripts/npm_dist/gen-dist.sh ' + fileName, (error, stdout, stderr) => {
    if (error) {
      console.log('fail to generate dist package, error:', error);
      throw error;
    }

    if (stdout)
      process.stdout.write(stdout);
    if (stderr)
      process.stderr.write(stderr);
  });
}

genDistPackage();
