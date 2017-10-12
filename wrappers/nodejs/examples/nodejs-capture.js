#!/usr/bin/env node

// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by an Apache 2.0 license
// that can be found in the LICENSE file.

'use strict';

const rs2 = require('../index.js');
const GLFWWindow = require('./glfw-window.js').GLFWWindow;
const glfw = require('./glfw-window.js').glfw;

// Open a GLFW window
const win = new GLFWWindow(1280, 720, 'Node.js Capture Example');
const colorizer = new rs2.Colorizer();
const pipeline = new rs2.Pipeline();
pipeline.start();

let depthData = new ArrayBuffer(2764800);
let colorData = new ArrayBuffer(2764800);
let depthView = new Uint8Array(depthData);
let colorView = new Uint8Array(colorData);

let frameset = new rs2.FrameSet();
let depthRGB = new rs2.Frame();

let counter = 0;
while (! win.shouldWindowClose()) {
  process.stdout.write(counter + 'W\n');
  if (! pipeline.waitForFrames(frameset)) {
    console.log('waitForFrames() failed!');
    continue;
  }
  process.stdout.write(counter++ + 'R\n');

  // const depth = null;
  const depth = frameset.depthFrame;
  if (depth && colorizer.colorize(depth, depthRGB)) {
    depthRGB.getData(depthData);
  }

  // const color = null;
  const color = frameset.colorFrame;
  if (color) color.getData(colorData);

  win.beginPaint();
  glfw.draw2x2Streams(
      win.window,
      2,
      depth ? depthView : null, 'rgb8', depth ? depthRGB.width : 0, depth ? depthRGB.height : 0,
      color ? colorView : null, 'rgb8', color ? color.width : 0, color ? color.height : 0,
      null, '', 0, 0,
      null, '', 0, 0);
  win.endPaint();

  frameset.dispose();
  console.log('');
}

pipeline.stop();
pipeline.destroy();
win.destroy();
rs2.cleanup();
