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

let counter = 0;
while (! win.shouldWindowClose()) {
  const frameset = pipeline.waitForFrames();
  process.stdout.write(counter++ + ' ');

  const depth = frameset.depthFrame;
  const depthRGB = colorizer.colorize(depth);
  const color = frameset.colorFrame;

  if (depthRGB) {
    depthRGB.getData(depthData);
  }

  if (color) {
    color.getData(colorData);
  }

  win.beginPaint();
  glfw.draw2x2Streams(
      win.window,
      2, // two channels
      depthRGB ? depthView : null,
      'rgb8',
      depthRGB ? depthRGB.width : 0,
      depthRGB ? depthRGB.height : 0,
      color ? colorView : null,
      'rgb8',
      color ? color.width : 0,
      color ? color.height : 0,
      null, '', 0, 0,
      null, '', 0, 0);
  win.endPaint();

  if (depth) depth.destroy();
  if (depthRGB) depthRGB.destroy();
  if (color) color.destroy();

  frameset.destroy();
}
pipeline.stop();
pipeline.destroy();
win.destroy();
rs2.cleanup();
