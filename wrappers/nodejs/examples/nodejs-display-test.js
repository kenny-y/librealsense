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

let counter = 0;
while (! win.shouldWindowClose()) {
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

  let data = null;
  let width = 0;
  let height = 0;
  const target = depthRGB;
  if (target) {
    data = target.getData();
    width = target.width;
    height = target.height;
  }
  // var size = glfw.GetFramebufferSize(win.window_);
  // glfw.drawImage2D(0, 0, size.width, size.height,
  //   'rgb8', data, width, height);
  // glfw.SwapBuffers(win.window_);
  // glfw.PollEvents();

  var wsize = glfw.GetFramebufferSize(win.window_);
  glfw.testScene(wsize.width, wsize.height);
  glfw.SwapBuffers(win.window_);
  glfw.PollEvents();

  // win.beginPaint();
  // glfw.draw2x2Streams(
  //     win.window,
  //     2, // two channels
  //     depthRGB ? depthRGB.getData() : null,
  //     'rgb8',
  //     depthRGB ? depthRGB.width : 0,
  //     depthRGB ? depthRGB.height : 0,
  //     color ? color.getData() : null,
  //     'rgb8',
  //     color ? color.width : 0,
  //     color ? color.height : 0,
  //     null, '', 0, 0,
  //     null, '', 0, 0);
  // win.endPaint();

  if (depthRGB) depthRGB.destroy();
  if (depth) depth.destroy();
  if (color) color.destroy();

  frameset.destroy();
}
pipeline.stop();
pipeline.destroy();
win.destroy();
rs2.cleanup();
