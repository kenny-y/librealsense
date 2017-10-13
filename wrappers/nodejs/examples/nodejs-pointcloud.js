#!/usr/bin/env node

// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by an Apache 2.0 license
// that can be found in the LICENSE file.

'use strict';

const rs2 = require('../index.js');
const GLFWWindow = require('./glfw-window.js').GLFWWindow;
const glfw = require('./glfw-window.js').glfw;

let colorData = new ArrayBuffer(2764800);
let verticesData = new ArrayBuffer(11059200);
let textureData = new ArrayBuffer(7372800);

let colorView = new Uint8Array(colorData);
let verticesView = new Uint8Array(verticesData);
let textureView = new Uint8Array(textureData);

function drawPointcloud2(win, color, points) {
  if (points.writeVertices(verticesData)
      && points.writeTextureCoordinates(textureData) ) {
    let count = points.size;
    if (color) {
      color.getData(colorData);
    }
    let colorWidth = color?color.width:0;
    let colorHeight = color?color.height:0;
    win.beginPaint();
    glfw.drawDepthAndColorAsPointCloud(
        win.window,
        verticesView,
        count,
        textureView,
        color ? colorView : null,
        colorWidth,
        colorHeight,
        'rgb8');
    win.endPaint();
  }
}

// Open a GLFW window
const win = new GLFWWindow(1280, 720, 'Node.js Pointcloud Example');
const pc = new rs2.Pointcloud();
const pipe = new rs2.Pipeline();

pipe.start();

let frameSet = new rs2.FrameSet();

let counter = 0;
while (! win.shouldWindowClose()) {
  if (! pipe.waitForFrames(frameSet)) {
    // Failed to capture frames
    //  e.g. Camera is unplugged (plug in the camera again can resume the pipeline)
    console.log('waitForFrames() didn\'t get any data...');
    continue;
  }

  let points;
  let color = frameSet.colorFrame;
  let depth = frameSet.depthFrame;

  if (depth) points = pc.calculate(depth);
  if (color) pc.mapTo(color);
  if (points) drawPointcloud2(win, color, points);

  if (points) points.destroy();
}

pc.destroy();
pipe.stop();
pipe.destroy();
win.destroy();

rs2.cleanup();
