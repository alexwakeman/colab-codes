import React, {createRef, useEffect, useState} from 'react';
import chroma from 'chroma-js';

import '../styles/App.scss';
import {clamp, getCanvasCoords, getNextLocation} from './utils';
import {ColourStyle} from './ColourStyle';

function App() {
  let canvas, seed, seedB, R, r, d, diff, ratio, thetaIncr,
      theta, start, ctx, scaler, nextEuclid, nextCanvas, animId;
  const canvasRef = createRef();
  const [colourA, setColourA] = useState(chroma.random());
  const [colourB, setColourB] = useState(chroma.random());
  const [width, setWidth] = useState(Math.round((window.innerWidth / 4) * 3));
  const [height, setHeight] = useState(window.innerHeight);
  let cancelled;

  useEffect(() => {
    initSpiro();
  });

  function isCancelled() {
    return cancelled;
  }

  function reset() {
    cancelled = true;
    cancelAnimationFrame(animId);
    setColourA(chroma.random());
    setColourB(chroma.random());
    initSpiro();
  }

  function responsiveSizing() {
    R = Math.round(width / 2) / 2;
    if (width <= 600) {
      R = Math.round(height / 2) / 2;
      setWidth(window.innerWidth);
      setHeight(600);
    }
  }

  function initSpiro() {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    seed = Math.random();
    seedB = Math.random();

    responsiveSizing();

    if (animId) {
      cancelAnimationFrame(animId);
    }

    r = clamp(R  * seed, 120, 400);
    d = clamp(R * seedB, 75, 650);
    diff = R - r;
    ratio = diff / r;
    thetaIncr = clamp(seed, 0.1, 0.59)
    theta = 0.0;
    scaler = chroma.scale([colourA, colourB]).domain([-1,1]).mode('lch');
    nextEuclid = getNextLocation(theta);
    nextCanvas = getCanvasCoords(nextEuclid.xTheta, nextEuclid.yTheta);

    ctx.moveTo(nextCanvas.x, nextCanvas.y);
    window.requestAnimationFrame(drawStep);
  }

  function drawStep(timestamp) {
    if (start === undefined) {
      start = timestamp;
    }
    if (isCancelled()) {
      cancelAnimationFrame(animId);
      return;
    }
    const elapsed = timestamp - start;
    const nextEuclid = getNextLocation(diff, ratio, d, theta);
    const nextCanvas = getCanvasCoords(width, height, nextEuclid.xTheta, nextEuclid.yTheta);
    const gradientA = Math.sin(theta);
    const gradientB = Math.abs(Math.sin(theta));
    const gradientC = Math.cos(theta);
    const fillColour = scaler(gradientA);
    const strokeColour = scaler(gradientC).set('lab.l', '*1.5');

    ctx.strokeStyle = `${strokeColour}`;
    ctx.fillStyle = `${fillColour}`;

    ctx.beginPath();
    ctx.arc(nextCanvas.x, nextCanvas.y, clamp(gradientB * 20, 3, 20), 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    if (elapsed < 120000) {
      theta += thetaIncr;
      animId = window.requestAnimationFrame(drawStep);
    }
  }

  return (
    <div className={`App`}>
      <ColourStyle colourA={colourA} colourB={colourB}/>
      <div className={'outer'}>
        <div className={'flex'}>
          <div className={'content left'}>
            <h1>Colab.Codes</h1>
            <h2>Software Engineering & Beautiful Loops</h2>
            <p>
              My name is Alex Wakeman and I'm the director and senior engineer for Colab.Codes Ltd.
            </p>
            <p>
              Having worked with multi-national companies and the UK government on multiple projects, Colab.Codes has experience
              on time critical and highly complex projects - with a proven track record for delivery.
            </p>
            <ul>
              <li>
                <a href={'https://linkedin.com/in/alexwakeman/'} target={'_blank'} rel="noopener noreferrer">LinkedIn</a><br/>
              </li>
              <li>
                <a href={'https://github.com/alexwakeman'} target={'_blank'} rel="noopener noreferrer">GitHub</a><br/>
              </li>
              <li>
                <a href={'mailto:alex@colab.codes'}>Email</a><br/>
              </li>
              <li>
                <button type={'button'} onClick={() => reset()}>Refresh <span role='img' aria-label={'Hamburger'}>&#x1F354;</span></button>
              </li>
            </ul>
            <p>
              The animated pattern is generated using a random seed and the equation for
              <a href={'https://en.wikipedia.org/wiki/Hypocycloid'} rel="noopener noreferrer" target={'blank'}> Hypocycloids found on Wikipedia.</a>
            </p>
          </div>
          <div className={'content right'} onClick={() => reset()}>
            <canvas id={'canvas'} ref={canvasRef} width={width} height={height}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
