// End of the tiny journey: words on the closed shutters, and a small enamel sign to look again.

import { rect, line, INK, resetSeed } from '../scenes/draw.js';

export function buildLookAgain(root, onPress) {
  resetSeed(91);
  root.innerHTML = `
    <g id="look-again" class="look-again" role="button" tabindex="0" aria-label="Look again">
      ${line([[800, 872], [752, 896]], { sw: 1.6 })}${line([[800, 872], [848, 896]], { sw: 1.6 })}
      <circle cx="800" cy="870" r="4" fill="#1d1a1c"/>
      <g class="swing">
        ${rect(694, 894, 212, 70, { fill: '#f3e2bd', sw: 2.4 })}
        ${rect(701, 900, 198, 58, { stroke: '#9b2b1e', sw: 1.2, off: 0, amp: 0.8 })}
        <text x="800" y="922" text-anchor="middle" font-family="'Baloo Tamma 2',sans-serif" font-weight="600" font-size="15" fill="#2a1a12">Want to look again?</text>
        <text x="800" y="947" text-anchor="middle" font-family="'Rozha One','Baloo Tamma 2',serif" font-size="21" fill="#9b2b1e" letter-spacing="2">LOOK AGAIN</text>
      </g>
    </g>`;
  const btn = root.querySelector('#look-again');
  btn.addEventListener('click', onPress);
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onPress(); } });
  return {
    show() { btn.classList.add('on'); },
    hide() { btn.classList.remove('on'); },
  };
}
