// Generate the Git icon SVG using Paper.js boolean operations.
//
// Prerequisites:
//   npm install --no-save paper paperjs-offset
//
// Source geometry (on a 58x58 grid with origin at 0,0):
//   - Rounded rectangle background: (0,0) 58x58, corner radius 5
//   - Main branch: vertical line x=40.5, y=-1..41, stroke-width 5
//   - Topic branch: diagonal (40.5,18) to (17.5,41), stroke-width 5
//   - Three circles at (40.5,18), (40.5,41), (17.5,41), all r=6
//
// The result is placed into a 92x92 viewBox via:
//   transform="scale(1.179487) translate(10 10) rotate(-45 29 29)"
// Design on 58x58, translate to center in 78x78, rotate -45 around
// the shape center, then scale by 92/78 to fill the 92x92 viewBox.

const paper = require('paper');
const { PaperOffset } = require('paperjs-offset');
const fs = require('fs');
const path = require('path');

paper.setup(new paper.Size(78, 78));

// Background: rounded rectangle
const bg = new paper.Path.Rectangle({
  point: [0, 0],
  size: [58, 58],
  radius: 5,
});

// Branch lines (expand strokes into filled outlines)
const mainBranch = new paper.Path.Line({ from: [40.5, -1], to: [40.5, 41] });
const mainExp = PaperOffset.offsetStroke(mainBranch, 2.5, { cap: 'butt' });
mainBranch.remove();

const topicBranch = new paper.Path.Line({ from: [40.5, 18], to: [17.5, 41] });
const topicExp = PaperOffset.offsetStroke(topicBranch, 2.5, { cap: 'butt' });
topicBranch.remove();

// Circles
const branchPoint = new paper.Path.Circle({ center: [40.5, 18], radius: 6 });
const mainStart   = new paper.Path.Circle({ center: [40.5, 41], radius: 6 });
const topicStart  = new paper.Path.Circle({ center: [17.5, 41], radius: 6 });

// Unite all graph elements
let graph = mainExp.unite(topicExp);
graph = graph.unite(branchPoint);
graph = graph.unite(mainStart);
graph = graph.unite(topicStart);

// Subtract graph from background
const icon = bg.subtract(graph);

const pathData = icon.pathData;

// 92/78 scales the 78x78 intermediate space to fill the 92x92 viewBox
const transform =
  `scale(${+(92 / 78).toFixed(6)}) translate(10 10) rotate(-45 29 29)`;

const colors = {
  '1788C': '#f03c2e',
  'Black': '#100f0d',
  'White': '#fff',
};

const outDir = path.join(__dirname, '../static/images/logos/downloads');

for (const [variant, fill] of Object.entries(colors)) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="92pt" height="92pt"` +
    ` viewBox="0 0 92 92"><path fill="${fill}"` +
    ` transform="${transform}" d="${pathData}"/></svg>`;

  const outPath = path.join(outDir, `Git-Icon-${variant}.svg`);
  fs.writeFileSync(outPath, svg);
  console.log(`Wrote ${outPath}`);
}
