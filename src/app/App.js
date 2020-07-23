import React, {createRef, useEffect, useRef, useState} from 'react';
import chroma from 'chroma-js';

import '../styles/App.scss';
import {clamp, clampFloat, getCanvasCoords, getNextLocation} from './utils';
import {ColourStyle} from './ColourStyle';

function App() {
  let canvas, seed, seedB, R, r, d, diff, ratio, thetaIncr,
      theta, start, ctx, scaler, nextEuclid, nextCanvas, animId;
  const canvasRef = createRef();
  const [colours, setColours] = useState([chroma.random(), chroma.random()]);
  const widthRef = useRef(Math.round((window.innerWidth / 3) * 2));
  const heightRef = useRef(window.innerHeight);
  const cancelled = useRef(false);
  const timeElapsed = useRef(false);

  responsiveSizing();

  useEffect(() => {
    initSpiro();
  });

  function isCancelled() {
    return cancelled.current;
  }

  function reset() {
    setColours([chroma.random(), chroma.random()])
    cancelled.current = true;
  }

  function responsiveSizing() {
    R = (Math.round(widthRef.current / 2) / 3) * 1.9;
    if (widthRef.current <= 600) {
      R = Math.round(widthRef.current / 2);
      widthRef.current = window.innerWidth
      heightRef.current = 600;
    }
  }

  function initSpiro() {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    seed = Math.random();
    seedB = Math.random();
    r = clamp(R  * seed, 120, 400);
    if (R - r < 50) {
      r = R - 100;
    }
    d = clamp(R * seedB, 70, 320);
    diff = clampFloat(R - r, 10, 400);
    ratio = clampFloat(diff / r, 0.198, 4.7);
    thetaIncr = 0.05;
    theta = 0.0;
    scaler = chroma.scale(colours).domain([-1,1]).mode('lch');
    nextEuclid = getNextLocation(theta);
    nextCanvas = getCanvasCoords(nextEuclid.xTheta, nextEuclid.yTheta);
    ctx.moveTo(nextCanvas.x, nextCanvas.y);

    console.log(`seed = ${seed}, seedB = ${seedB}, R = ${R}, r = ${r}, d = ${d}, diff = ${diff}, ratio = ${ratio}, thetaIncr = ${thetaIncr}`);
    start = undefined;

    window.requestAnimationFrame(drawStep);
  }

  function drawStep(timestamp) {
    if (isCancelled()) {
      cancelled.current = false;
      if (!timeElapsed.current) {
        cancelAnimationFrame(animId);
        return;
      } else {
        timeElapsed.current = false;
      }
    }
    if (start === undefined) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const nextEuclid = getNextLocation(diff, ratio, d, theta);
    const nextCanvas = getCanvasCoords(widthRef.current, heightRef.current, nextEuclid.xTheta, nextEuclid.yTheta);
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

    if (elapsed < 60000) {
      theta += thetaIncr;
      animId = window.requestAnimationFrame(drawStep);
    } else {
      timeElapsed.current = true;
    }
  }

  return (
    <div className={`App`}>
      <ColourStyle colours={colours} height={heightRef.current}/>
      <div className={'outer'}>
        <div className={'flex'}>
          <div className={'content left'}>
            <h1>Colab.Codes</h1>
            <h2>Software Engineering</h2>
            <h2 className={'calligraphy sub-heading'}>&amp; Beautiful Loops</h2>
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
            </ul>
            <p className={'update'}>
              <span className={'bold'}>Try different patterns and colours...</span><br />
              <span>
                <button className={'refresh-btn'} type={'button'} onClick={() => reset()}>CHANGE IT UP! <span role='img' aria-label={'Hamburger'}>&#x1F354;</span></button>
              </span>
            </p>
            <p>
              The animated pattern is generated using a random seed and the equation for <a href={'https://en.wikipedia.org/wiki/Hypocycloid'} rel="noopener noreferrer" target={'blank'}>Hypocycloids found on Wikipedia.</a>
            </p>
          </div>
          <div className={'content right'} onClick={() => reset()}>
            <canvas id={'canvas'} ref={canvasRef} width={widthRef.current} height={heightRef.current}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
