/* License: Apache 2.0. See LICENSE file in root directory.
   Copyright(c) 2017 Intel Corporation. All Rights Reserved. */

// Purpose: build native librealsense

const {exec} = require('child_process');
const os = require('os');

function buildNativeLib() {
  console.log('Building librealsense C++ API. It takes time...');

  if (os.type() == 'Windows_NT') {
    buildNativeLibWindows();
  } else {
    buildNativeLibLinux();
  }
}

function buildNativeLibLinux() {
  const child = exec('./scripts/npm_dist/build-dist.sh',
                     (error, stdout, stderr) => {
    if (error) {
      console.log('Failed to build librealsense, error:', error);
      throw error;
    }

    if (stdout)
      process.stdout.write(stdout);
    if (stderr)
      process.stderr.write(stderr);
  });
}

function buildNativeLibWindows() {
  const cmakeGenPlatform = process.arch;
  const msBuildPlatform = process.arch=='ia32'?'Win32':process.arch;

  const child = exec('cmd /c .\\scripts\\npm_dist\\build-dist.bat '
                     + cmakeGenPlatform + ' ' + msBuildPlatform,
                     (error, stdout, stderr) => {
    if (error) {
      console.log('Failed to build librealsense, error:', error);
      throw error;
    }

    if (stdout)
      process.stdout.write(stdout);
    if (stderr)
      process.stderr.write(stderr);
  });
}

buildNativeLib();
