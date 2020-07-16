import React, {createRef, useEffect} from 'react';
import chroma from 'chroma-js';

import './App.scss';
import {clamp} from './utils';

function App() {
  const seed = Math.random();
  const seedB = Math.random();
  const canvasRef = createRef();
  let height = window.innerHeight;
  let width = Math.round((window.innerWidth / 4) * 3);
  let R = Math.round(width / 2) / 2;


  if (width <= 600) {
    R = Math.round(height / 2) / 2;
    width = window.innerWidth;
    height = 600;
  }

  const r = clamp(R  * seed, 120, 400);
  const d = clamp(R * seedB, 75, 650);
  const diff = R - r;
  const ratio = diff / r;
  const thetaIncr = clamp(seed, 0.1, 0.59)
  let theta = 0.0;
  let start, ctx;

  const colourA = chroma.random();
  const colourB = chroma.random();
  const scaler = chroma.scale([colourA, colourB]).domain([-1,1]).mode('lch');

  useEffect(() => {
    initSpiro(canvasRef.current);
  });

  function initSpiro(canvas) {
    ctx = canvas.getContext('2d');
    const nextEuclid = getNextLocation(theta);
    const nextCanvas = getCanvasCoords(nextEuclid.xTheta, nextEuclid.yTheta);

    ctx.moveTo(nextCanvas.x, nextCanvas.y);
    window.requestAnimationFrame(drawStep);
  }

  function drawStep(timestamp) {
    if (start === undefined) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const nextEuclid = getNextLocation(theta);
    const nextCanvas = getCanvasCoords(nextEuclid.xTheta, nextEuclid.yTheta);
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
      window.requestAnimationFrame(drawStep);
    }
  }

  function getNextLocation(theta)  {
    const xTheta = (diff * Math.cos(theta)) + (d *  Math.cos(ratio  * theta));
    const yTheta = (diff * Math.sin(theta)) + (d *  Math.sin(ratio  * theta));
    return  {
      xTheta,
      yTheta
    }
  }

  function getCanvasCoords(x, y) {
    /* Returns the canvas coords for given euclidean X, Y */
    const zeroX = Math.floor(width / 2);
    const zeroY = Math.floor(height / 2);
    return {
      x: zeroX + x,
      y: zeroY + y
    }
  }

  function renderStyles() {
    let textCol, bg1, bg2;
    if (colourA.luminance() > colourB.luminance()) {
      textCol = chroma(colourA).set('lab.l', '*1.8');
      bg1 = chroma(colourB).set('lab.l', '*0.4');
      bg2 = chroma(colourA).set('lab.l', '*0.5');
    } else {
      textCol = chroma(colourB).set('lab.l', '*1.8');
      bg1 = chroma(colourA).set('lab.l', '*0.4');
      bg2 = chroma(colourB).set('lab.l', '*0.5');
    }

    return (
        <style type={'text/css'}>
          {`.outer {
            background: ${bg1};
            background: -moz-linear-gradient(top, ${bg1} 0%, ${bg2} 100%);
            background: -webkit-linear-gradient(top, ${bg1} 0%, ${bg2} 100%);
            background: linear-gradient(to bottom, ${bg1} 0%, ${bg2} 100%);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=${bg1}, endColorstr=${bg2}, GradientType=0);
            color: ${textCol}; 
          }
          a {
            color: ${textCol};
          }
          `}
        </style>
    )
  }

  return (
    <div className={`App`}>
      {renderStyles()}
      <div className={'outer'}>
        <div className={'flex'}>
          <div className={'content left'}>
            <h1>Colab.Codes</h1>
            <h2>Software Engineering & Beautiful Loops</h2>
            <p>
              My name is Alex Wakeman and I'm the director and senior engineer for Colab.Codes Ltd.
              I offer software development services through my Personal Service Company, based in London, UK.
            </p>
            <p>
              Having worked with multi-national companies and the UK government on multiple projects, I have experience
              on time critical and highly complex projects - and a proven track record for delivery.
            </p>
            <p>
              <a href={'https://linkedin.com/in/alexwakeman/'} target={'_blank'} rel="noopener noreferrer">LinkedIn</a><br/>
              <a href={'https://github.com/alexwakeman'} target={'_blank'} rel="noopener noreferrer">GitHub</a><br/>
            </p>
            <p>
              &gt;&gt; <a href={'./'}>Refresh Page</a> : )
            </p>
          </div>
          <div className={'content right'} onClick={() => window.location.reload()}>
            <canvas id={'canvas'} ref={canvasRef} width={width} height={height}/>
          </div>
        </div>

      </div>

    </div>
  );
}

export default App;
