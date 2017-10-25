#!/usr/bin/env node

// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by an Apache 2.0 license
// that can be found in the LICENSE file.

'use strict';

const rs2 = require('../index.js');
const GLFWWindow = require('./glfw-window.js').GLFWWindow;
const glfw = require('./glfw-window.js').glfw;

function drawPointcloud(win, color, points) {
  win.beginPaint();
  if (points.vertices && points.textureCoordinates ) {
    let count = points.size;
    if (color) {
      glfw.drawDepthAndColorAsPointCloud(
          win.window,
          new Uint8Array(points.vertices.buffer),
          count,
          new Uint8Array(points.textureCoordinates.buffer),
          color.data,
          color.width,
          color.height,
          'rgb8');
    }
  }
  win.endPaint();
}

// Open a GLFW window
const win = new GLFWWindow(1280, 720, 'Node.js Pointcloud Example');
const pc = new rs2.Pointcloud();
const pipe = new rs2.Pipeline();

pipe.start();

while (! win.shouldWindowClose()) {
  const frameSet = pipe.waitForFrames();
  if (! frameSet) {
    // Failed to capture frames
    //  e.g. Camera is unplugged (plug in the camera again can resume the pipeline)
    console.log('waitForFrames() didn\'t get any data...');
    continue;
  }

  if (frameSet.depthFrame) {
    const pointsFrame = pc.calculate(frameSet.depthFrame);
    if (pointsFrame) {
      if (frameSet.colorFrame) pc.mapTo(frameSet.colorFrame);
      drawPointcloud(win, frameSet.colorFrame, pointsFrame);
    }
  }
}

pc.destroy();
pipe.stop();
pipe.destroy();
win.destroy();
rs2.cleanup();
