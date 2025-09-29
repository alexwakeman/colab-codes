import React from 'react';
import chroma from 'chroma-js';

export function ColourStyle({colours, height} ) {
    let textCol, bg1, bg2;

    if (!colours || !Array.isArray(colours) || colours.length !== 2) {
        return null;
    }

    const colourA = colours[0];
    const colourB = colours[1];

    if (colourA.luminance() > colourB.luminance()) {
        textCol = chroma(colourA).set('lab.l', '*1.8');
        bg1 = chroma(colourB).set('lab.l', '*0.32');
        bg2 = chroma(colourA).set('lab.l', '*0.58');
    } else {
        textCol = chroma(colourB).set('lab.l', '*1.8');
        bg1 = chroma(colourA).set('lab.l', '*0.32');
        bg2 = chroma(colourB).set('lab.l', '*0.58');
    }

    return (
        <style type={'text/css'}>
            {`:root {
            --hero-text: ${textCol};
            --hero-bg-1: ${bg1};
            --hero-bg-2: ${bg2};
            --hero-height: ${height}px;
          }
          body {
            background: linear-gradient(180deg, ${bg1} 0%, ${bg2} 100%);
            color: var(--hero-text);
          }
          .hero {
            color: var(--hero-text);
            background: radial-gradient(circle at top, ${chroma(bg2).alpha(0.45)} 0%, ${chroma(bg1).alpha(0.92)} 45%, ${bg1} 100%);
          }
          .hero::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, ${chroma(bg1).alpha(0.78)} 0%, ${chroma(bg2).alpha(0.62)} 100%);
            opacity: 0.78;
            pointer-events: none;
            mix-blend-mode: screen;
            z-index: 0;
          }
          .hero__content,
          .hero__content a,
          .hero__cta .update {
            color: var(--hero-text);
          }
          a {
            color: var(--hero-text);
            text-decoration: none;
          }
          a:hover,
          a:focus {
            text-decoration: underline;
          }
          .refresh-btn {
              display:inline-flex;
              align-items:center;
              gap: 6px;
              cursor:pointer;
              color:var(--hero-text);
              font-family:'Roboto Lt', sans-serif;
              font-size:1rem;
              font-weight:600;
              padding:12px 30px;
              border-radius:999px;
              border:1px solid ${chroma(textCol).alpha(0.35)};
              background:linear-gradient(120deg, ${chroma(bg2).brighten(0.4).alpha(0.85)} 0%, ${chroma(bg1).alpha(0.9)} 100%);
              box-shadow:0 12px 30px ${chroma(bg1).alpha(0.45)};
              transition: transform 160ms ease, box-shadow 160ms ease;
          }
          .refresh-btn:hover {
              transform: translateY(-2px) scale(1.01);
              box-shadow:0 18px 36px ${chroma(bg2).alpha(0.45)};
          }
          .refresh-btn:active {
              transform: translateY(0);
          }
          `}
        </style>
    );
}