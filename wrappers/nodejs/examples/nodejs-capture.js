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

while (! win.shouldWindowClose()) {
  const frameset = pipeline.waitForFrames();
  if (! frameset) {
    // Failed to capture frames
    //  e.g. Camera is unplugged (plug in the camera again can resume the pipeline)
    console.log('waitForFrames() didn\'t get any data...');
    continue;
  }

  if (!frameset.depthFrame || !frameset.colorFrame) {
    continue;
  }

  // Build the color map
  const depthMap = colorizer.colorize(frameset.depthFrame);
  if (depthMap) {
    // Paint the images to GLFW window
    win.beginPaint();
    const color = frameset.colorFrame;
    glfw.draw2x2Streams(win.window, 2,
        depthMap.data, 'rgb8', depthMap.width, depthMap.height,
        color.data, 'rgb8', color.width, color.height);
    win.endPaint();
  }
}

win.destroy();

pipeline.stop();
rs2.cleanup();
