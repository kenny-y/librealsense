#!/usr/bin/env node

// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by an Apache 2.0 license
// that can be found in the LICENSE file.

'use strict';

const rs2 = require('../index.js');

const colorizer = new rs2.Colorizer();
const pipeline = new rs2.Pipeline();
pipeline.start();

let counter = 0;
while (true) {
  const frameset = pipeline.waitForFrames();
  process.stdout.write(counter++ + ' ');
  if (!frameset) {
    console.log('frameset is undefined');
    break;
  }

  const depth = frameset.depthFrame;
  let depthRGB = null;
  if (depth) {
    depthRGB = colorizer.colorize(depth);
  }
  const color = frameset.colorFrame;

  if (depthRGB) depthRGB.destroy();
  if (depth) depth.destroy();
  if (color) color.destroy();

  frameset.destroy();
}

pipeline.stop();
pipeline.destroy();
rs2.cleanup();
