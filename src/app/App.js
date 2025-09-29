import React, {useCallback, useEffect, useRef, useState} from 'react';
import chroma from 'chroma-js';

import '../styles/App.scss';
import {clampFloat, getCanvasCoords, getNextLocation} from './utils';
import {ColourStyle} from './ColourStyle';

const PATTERN_MODES = ['dots', 'lines', 'hybrid'];

const pickOne = (items) => items[Math.floor(Math.random() * items.length)];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const createPatternConfig = () => {
  const varietyLevel = Math.floor(Math.random() * 3) + 1;
  const modePool = varietyLevel === 1 ? ['dots'] : varietyLevel === 2 ? ['dots', 'lines'] : PATTERN_MODES;
  const mode = pickOne(modePool);
  const thetaIncr = clampFloat(randomBetween(0.012, varietyLevel === 3 ? 0.14 : 0.085), 0.01, 0.16);
  const pointRadius = clampFloat(randomBetween(4.5, 25) * (mode === 'dots' ? 1.2 : mode === 'hybrid' ? 1 : 0.75), 3, 32);
  const strokeWidth = clampFloat(randomBetween(0.45, 2.2) * (mode === 'lines' ? 1.6 : mode === 'hybrid' ? 1.1 : 0.75), 0.4, 4);
  const fillAlpha = clampFloat(randomBetween(0.28, 0.85), 0.22, 0.95);
  const lineAlpha = clampFloat(randomBetween(0.32, 0.88), 0.25, 0.95);
  const composite = pickOne(['source-over', 'lighter', 'screen', 'overlay']);
  const shadowBlur = clampFloat(randomBetween(6, 24) * (varietyLevel === 3 ? 1.4 : 1), 4, 36);
  const shadowFade = Math.random() > 0.45;
  const scaleMode = Math.random() > 0.5 ? 'lch' : 'lab';

  return {
    varietyLevel,
    mode,
    thetaIncr,
    pointRadius,
    strokeWidth,
    fillAlpha,
    lineAlpha,
    composite,
    shadowBlur,
    shadowFade,
    scaleMode
  };
};

function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const animationRef = useRef(null);
  const spiroRef = useRef({});
  const prevPointRef = useRef(null);
  const startRef = useRef();
  const cancelledRef = useRef(false);
  const timeElapsedRef = useRef(false);

  const [colours, setColours] = useState(() => [chroma.random(), chroma.random()]);
  const [patternConfig, setPatternConfig] = useState(() => createPatternConfig());
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720
  }));

  const reset = useCallback(() => {
    setColours([chroma.random(), chroma.random()]);
    setPatternConfig(createPatternConfig());
    cancelledRef.current = true;
  }, []);

  useEffect(() => {
    function handleResize() {
      setDimensions({width: window.innerWidth, height: window.innerHeight});
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initSpiro = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    const {width, height} = dimensions;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const base = Math.min(width, height);
    const R = clampFloat(base * 0.45, Math.max(140, base * 0.32), base * 0.7);
    const seed = Math.random();
    const seedB = Math.random();
    let r = clampFloat(R * seed, Math.max(90, R * 0.35), Math.max(120, R - 60));
    if (R - r < 40) {
      r = Math.max(60, R - 80);
    }
    const d = clampFloat(R * seedB, R * 0.25, R * 0.9);
    const diff = clampFloat(R - r, R * 0.08, R * 0.95);
    const ratio = clampFloat(diff / r, 0.198, 5);

    const scaler = chroma.scale(colours).domain([-1, 1]).mode(patternConfig.scaleMode);

    spiroRef.current = {
      width,
      height,
      diff,
      ratio,
      d,
      theta: 0,
      thetaIncr: patternConfig.thetaIncr,
      mode: patternConfig.mode,
      pointRadius: patternConfig.pointRadius,
      strokeWidth: patternConfig.strokeWidth,
      fillAlpha: patternConfig.fillAlpha,
      lineAlpha: patternConfig.lineAlpha,
      composite: patternConfig.composite,
      shadowBlur: patternConfig.shadowBlur,
      shadowFade: patternConfig.shadowFade,
      scaler
    };

    ctx.globalCompositeOperation = spiroRef.current.composite;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = spiroRef.current.shadowBlur;
    ctx.shadowColor = scaler(0).alpha(0.55).css();

    prevPointRef.current = null;
    startRef.current = undefined;
    cancelledRef.current = false;
    timeElapsedRef.current = false;

    animationRef.current = window.requestAnimationFrame(drawStep);
  }, [colours, dimensions, patternConfig]);

  const drawStep = useCallback((timestamp) => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }

    const ctx = ctxRef.current;
    if (!ctx || !spiroRef.current) {
      return;
    }

    if (startRef.current === undefined) {
      startRef.current = timestamp;
    }

    const {
      width,
      height,
      diff,
      ratio,
      d,
      theta,
      thetaIncr,
      scaler,
      mode,
      pointRadius,
      strokeWidth,
      fillAlpha,
      lineAlpha,
      shadowBlur,
      shadowFade
    } = spiroRef.current;

    const euclid = getNextLocation(diff, ratio, d, theta);
    const point = getCanvasCoords(width, height, euclid.xTheta, euclid.yTheta);

    const sine = Math.sin(theta);
    const absSine = Math.abs(sine);
    const cosine = Math.cos(theta);
    const baseFill = scaler(sine);
    const baseStroke = scaler(cosine);
    const fillColour = baseFill.alpha(fillAlpha).css();
    const strokeColour = baseStroke.alpha(lineAlpha).css();

    if (shadowFade) {
      ctx.shadowBlur = shadowBlur * (0.4 + absSine);
      ctx.shadowColor = scaler(absSine * 0.5).alpha(0.55).css();
    }

    switch (mode) {
      case 'lines':
        if (prevPointRef.current) {
          ctx.beginPath();
          ctx.moveTo(prevPointRef.current.x, prevPointRef.current.y);
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = strokeColour;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }
        break;
      case 'hybrid':
        if (prevPointRef.current && absSine > 0.18) {
          ctx.beginPath();
          ctx.moveTo(prevPointRef.current.x, prevPointRef.current.y);
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = baseStroke.alpha(Math.min(1, lineAlpha + 0.15)).css();
          ctx.lineWidth = strokeWidth * 0.75;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = fillColour;
        ctx.arc(point.x, point.y, clampFloat(pointRadius * (0.4 + absSine), 2, pointRadius), 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        ctx.beginPath();
        ctx.fillStyle = fillColour;
        ctx.arc(point.x, point.y, clampFloat(pointRadius * (0.3 + absSine), 2, pointRadius), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = baseStroke.alpha(Math.min(1, lineAlpha + 0.1)).css();
        ctx.lineWidth = strokeWidth * 0.6;
        ctx.stroke();
        break;
    }

    prevPointRef.current = point;
    spiroRef.current.theta = theta + thetaIncr;

    if (timestamp - startRef.current < 120000) {
      animationRef.current = window.requestAnimationFrame(drawStep);
    } else {
      timeElapsedRef.current = true;
    }
  }, []);

  useEffect(() => {
    initSpiro();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initSpiro, drawStep]);

  return (
    <div className={'App'}>
      <ColourStyle colours={colours} height={dimensions.height}/>
      <section className={'hero'}>
        <canvas
          aria-hidden={'true'}
          className={'hero__canvas'}
          onClick={reset}
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
        />
        <div className={'hero__content'}>
          <h1>Colab.Codes</h1>
          <h2>Software Engineering</h2>
          <h2 className={'calligraphy sub-heading'}>&amp; Beautiful Loops</h2>
          <p>
            My name is Alex Wakeman and I&apos;m the director and senior engineer for Colab.Codes Ltd.
          </p>
          <p>
            Having worked with multi-national companies and the UK government on multiple projects, Colab.Codes has experience
            on time critical and highly complex projects — with a proven track record for delivery.
          </p>
          <ul>
            <li>
              <a href={'https://linkedin.com/in/alexwakeman/'} target={'_blank'} rel="noopener noreferrer">LinkedIn</a>
            </li>
            <li>
              <a href={'https://github.com/alexwakeman'} target={'_blank'} rel="noopener noreferrer">GitHub</a>
            </li>
            <li>
              <a href={'mailto:alex@colab.codes'}>Email</a>
            </li>
          </ul>
          <div className={'hero__cta'}>
            <p className={'update'}>
              <span className={'bold'}>Try different patterns and colours...</span><br />
              <span>
                <button className={'refresh-btn'} type={'button'} onClick={reset}>
                  CHANGE IT UP! <span role={'img'} aria-label={'Hamburger'}>&#x1F354;</span>
                </button>
              </span>
            </p>
          </div>
          <p>
            The animated pattern is generated using a random seed and the equation for <a href={'https://en.wikipedia.org/wiki/Hypocycloid'} rel="noopener noreferrer" target={'blank'}>Hypocycloids found on Wikipedia.</a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
