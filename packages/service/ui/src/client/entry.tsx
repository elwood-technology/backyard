import './style.css';
import * as process from 'process';

import { Canvas } from './containers';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = require('buffer');

import React from 'react';
import { render } from 'react-dom';

render(<Canvas />, createRoot());

function createRoot(): Element {
  const root = document.querySelector('#root') || document.createElement('div');
  root.id = 'root';
  document.querySelector('body')?.appendChild(root);

  return root;
}
