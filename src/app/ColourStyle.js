import React from 'react';
import chroma from 'chroma-js';

export function ColourStyle({colourA , colourB} ) {
    let textCol, bg1, bg2;

    if (!colourA) {
        return null;
    }

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
    );
}