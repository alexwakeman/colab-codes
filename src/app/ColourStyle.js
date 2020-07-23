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
            height: 100%;
          }
          .outer {
            height: calc(${height}px);
          }
          @media only screen and (max-width: 600px) {
              .outer {
                height: calc(${height}px + 100%);
              }
          }    
          a {
            color: ${textCol};
          }
          .refresh-btn {
              box-shadow:inset 0px 1px 0px 0px #fff6af;
              background:linear-gradient(to bottom, ${bg2} 5%, ${bg1} 100%);
              background-color:${bg2};
              border-radius:6px;
              border:1px solid #fff;
              display:inline-block;
              cursor:pointer;
              color:${textCol};
              font-family:Arial;
              font-size:15px;
              font-weight:bold;
              padding:6px 24px;
              text-decoration:none;
              text-shadow:0px 1px 0px #ffee66;
            }
          .refresh-btn:hover {
              background:linear-gradient(to bottom, ${bg1} 5%, ${bg2} 100%);
              background-color:${bg1};
          }
          .refresh-btn:active {
              position:relative;
              top:1px;
          }
          `}
        </style>
    );
}