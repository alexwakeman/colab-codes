import React, {createRef, useEffect} from 'react';
import './App.scss';
import {colours} from './config';
import {clamp} from './utils';

function App() {
  const seed = Math.random();
  const seedB = Math.random();
  const canvasRef = createRef();
  const width = Math.round((window.innerWidth / 4) * 3);
  const height = window.innerHeight;
  const R = Math.round(width / 2) / 2;
  const r = clamp(R  * seed, 60, 400);
  const d = clamp(R * seedB, 30, 350);
  const diff = R - r;
  const ratio = diff / r;
  const thetaIncr = clamp(seed, 0.08, 0.19)
  let theta = 0.0;
  let start, ctx;

  const colorIndex = clamp(Math.floor(seed * colours.length), 0, colours.length - 1);
  const colourSet = colours[colorIndex];
  let diffRed = Math.abs(colourSet.end.r - colourSet.start.r);
  let diffGreen = Math.abs(colourSet.end.g - colourSet.start.g);
  let diffBlue = Math.abs(colourSet.end.b - colourSet.start.b);

  useEffect(() => {
    initSpiro(canvasRef.current);
  });



  function initSpiro(canvas) {
    ctx = canvas.getContext('2d');
    const nextEuclid = getNextLocation(theta);
    const nextCanvas = getCanvasCoords(nextEuclid.xTheta, nextEuclid.yTheta);
    ctx.strokeStyle = `rgb(${colourSet.start.r}, ${colourSet.start.g}, ${colourSet.start.b})`;
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
    const fadeAmountA = Math.cos(theta);
    const fadeAmountB = Math.abs(Math.sin(theta));

    diffRed = Math.round((diffRed * fadeAmountA) + colourSet.start.r);
    diffGreen = Math.round((diffGreen * fadeAmountA) + colourSet.start.g);
    diffBlue = Math.round((diffBlue * fadeAmountA) + colourSet.start.b);

    ctx.fillStyle = `rgb(${diffRed},${diffGreen},${diffBlue})`;

    ctx.beginPath();
    ctx.arc(nextCanvas.x, nextCanvas.y, clamp(fadeAmountB * 20, 3, 20), 0, 2 * Math.PI);
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

  return (
    <div className={`App ${colourSet.name}`}>
      <div className={'outer'}>
        <div className={'flex'}>
          <div className={'content left'}>
            <h1>Colab.Codes</h1>
            <h2>Software Engineering & Beautiful Loops</h2>
            <p>
              My name is Alex Wakeman and I'm the director and senior engineer for Colab.Codes Ltd.
              I offer software development services through my Personal Service Company.
            </p>
            <p>
              Having worked for multi-national banks and the UK government on multiple projects, I have experience
              on time critical and highly complex projects - and a proven track record for delivery.
            </p>
          </div>
          <div className={'content right'}>
            <canvas id={'canvas'} ref={canvasRef} width={width} height={height}/>
          </div>
        </div>

      </div>

    </div>
  );
}

export default App;
