#!/usr/bin/env node

// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by an Apache 2.0 license
// that can be found in the LICENSE file.

'use strict';

const rs2 = require('../index.js');
const GLFWWindow = require('./glfw-window.js').GLFWWindow;
const glfw = require('./glfw-window.js').glfw;

// A GLFW Window to display the captured image
const win = new GLFWWindow(1280, 720, 'Node.js Capture Example');

// Colorizer is used to map distance in depth image into different colors
const colorizer = new rs2.Colorizer();

// The main work pipeline of camera
const pipeline = new rs2.Pipeline();

// Start the camera
pipeline.start();

let depthBuf = new ArrayBuffer(2764800);
let colorBuf = new ArrayBuffer(2764800);
let depthView = new Uint8Array(depthBuf);
let colorView = new Uint8Array(colorBuf);

let frameset = new rs2.FrameSet();
let depthRGB = new rs2.Frame();

let counter = 0;
while (! win.shouldWindowClose()) {
  if (! pipeline.waitForFrames(frameset)) {
    // Failed to capture frames
    //  e.g. Camera is unplugged (plug in the camera again can resume the pipeline)
    console.log('waitForFrames() failed...');
    continue;
  }

  // Fetch the depth image frame
  const depth = frameset.depthFrame;
  // Build the color map
  if (depth && colorizer.colorize(depth, depthRGB)) {
    // Write to ArrayBuffer
    depthRGB.getData(depthBuf);
  }

  // Fetch the color image frame
  const color = frameset.colorFrame;
  // Write to ArrayBuffer
  if (color) color.getData(colorBuf);

  // Paint the images to GLFW window
  win.beginPaint();
  glfw.draw2x2Streams(
      win.window,
      2,
      depth ? depthView : null, 'rgb8', depth ? depthRGB.width : 0, depth ? depthRGB.height : 0,
      color ? colorView : null, 'rgb8', color ? color.width : 0, color ? color.height : 0,
      null, '', 0, 0,
      null, '', 0, 0);
  win.endPaint();
}

pipeline.stop();

frameset.destroy();
depthRGB.destroy();
pipeline.destroy();
win.destroy();

rs2.cleanup();
