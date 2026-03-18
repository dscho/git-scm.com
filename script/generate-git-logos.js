// Generate Git-Icon-*.{svg,png} and Git-Logo-*.{svg,png} using Paper.js
// boolean operations to produce a single closed path from design
// primitives, then rasterize the SVGs to PNG via resvg.
//
// Prerequisites:
//   npm install --no-save paper paperjs-offset @resvg/resvg-js
//
// Icon source geometry (on a 58x58 grid with origin at 0,0):
//   - Rounded rectangle background: (0,0) 58x58, corner radius 5
//   - Main branch: vertical line x=40.5, y=-1..41, stroke-width 5
//   - Topic branch: diagonal (40.5,18) to (17.5,41), stroke-width 5
//   - Three circles at (40.5,18), (40.5,41), (17.5,41), all r=6
//
// The result is placed into a 92x92 viewBox via:
//   transform="scale(1.179487) translate(10 10) rotate(-45 29 29)"
// Design on 58x58, translate to center in 78x78, rotate -45 around
// the shape center, then scale by 92/78 to fill the 92x92 viewBox.
//
// The Logo files combine the generated icon path with the existing
// "git" text glyph outlines (g, i, t).

const paper = require('paper');
const { PaperOffset } = require('paperjs-offset');
const { Resvg } = require('@resvg/resvg-js');
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

const iconPathData = icon.pathData;

// 92/78 scales the 78x78 intermediate space to fill the 92x92 viewBox
const transform =
  `scale(${+(92 / 78).toFixed(6)}) translate(10 10) rotate(-45 29 29)`;

const outDir = path.join(__dirname, '../static/images/logos/downloads');

const orange = '#f03c2e';
const brown  = '#362701';
const black  = '#100f0d';
const white  = '#fff';

// Render an SVG string to PNG at 300 DPI via resvg.
// Icons (92pt x 92pt) render to 383x383; Logos need fitTo since the
// width attribute uses unitless px that resvg does not scale by DPI.
function renderPng(svgString, fitTo) {
  const opts = fitTo ? { fitTo } : { dpi: 300 };
  const resvg = new Resvg(svgString, opts);
  return resvg.render().asPng();
}

// --- Icon files (icon only, 92x92) ---

for (const [variant, fill] of [['1788C', orange], ['Black', black], ['White', white]]) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="92pt" height="92pt"` +
    ` viewBox="0 0 92 92"><path fill="${fill}"` +
    ` transform="${transform}" d="${iconPathData}"/></svg>`;

  const svgPath = path.join(outDir, `Git-Icon-${variant}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`Wrote ${svgPath}`);

  const pngPath = path.join(outDir, `Git-Icon-${variant}.png`);
  fs.writeFileSync(pngPath, renderPng(svg));
  console.log(`Wrote ${pngPath}`);
}

// --- Logo files (icon + "git" text glyphs, 219x92) ---

// Text glyph paths extracted from the original Logo SVGs.  These are
// font outlines for the letters "g", "i", and "t" and are carried
// forward unchanged.
const gGlyph =
  'M130.871 31.836c-4.785 0-8.351 2.352-8.351 8.008 0 4.261 2.347 ' +
  '7.222 8.093 7.222 4.871 0 8.18-2.867 8.18-7.398 0-5.133-2.961-' +
  '7.832-7.922-7.832Zm-9.57 39.95c-1.133 1.39-2.262 2.87-2.262 ' +
  '4.612 0 3.48 4.434 4.524 10.527 4.524 5.051 0 11.926-.352 ' +
  '11.926-5.043 0-2.793-3.308-2.965-7.488-3.227Zm25.761-39.688c1.563 ' +
  '2.004 3.22 4.789 3.22 8.793 0 9.656-7.571 15.316-18.536 ' +
  '15.316-2.789 0-5.312-.348-6.879-.785l-2.87 4.613 8.526.52c15.059.96 ' +
  '23.934 1.398 23.934 12.968 0 10.008-8.789 15.665-23.934 ' +
  '15.665-15.75 0-21.757-4.004-21.757-10.88 0-3.917 1.742-6 ' +
  '4.789-8.878-2.875-1.211-3.828-3.387-3.828-5.739 0-1.914.953-3.656 ' +
  '2.523-5.312 1.566-1.652 3.305-3.305 5.395-5.219-4.262-2.09-7.485-' +
  '6.617-7.485-13.058 0-10.008 6.613-16.88 19.93-16.88 3.742 0 ' +
  '6.004.344 8.008.872h16.972v7.394l-8.007.61';

const iGlyph =
  'M170.379 16.281c-4.961 0-7.832-2.87-7.832-7.836 0-4.957 2.871-' +
  '7.656 7.832-7.656 5.05 0 7.922 2.7 7.922 7.656 0 4.965-2.871 ' +
  '7.836-7.922 7.836Zm-11.227 52.305V61.71l4.438-.606c1.219-.175 ' +
  '1.394-.437 1.394-1.746V33.773c0-.953-.261-1.566-1.132-1.824l-4.7-' +
  '1.656.957-7.047h18.016V59.36c0 1.399.086 1.57 1.395 1.746l4.437' +
  '.606v6.875h-24.805';

const tGlyph =
  'M218.371 65.21c-3.742 1.825-9.223 3.481-14.187 3.481-10.356 ' +
  '0-14.27-4.175-14.27-14.015V31.879c0-.524 0-.871-.7-.871h-6.093v-' +
  '7.746c7.664-.871 10.707-4.703 11.664-14.188h8.27v12.36c0 .609 0 ' +
  '.87.695.87h12.27v8.704h-12.965v20.797c0 5.136 1.218 7.136 5.918 ' +
  '7.136 2.437 0 4.96-.609 7.047-1.39l2.351 7.66';

function logoSvg(textFill, iconFill) {
  const iconPath =
    `<path fill="${iconFill}"` +
    ` transform="${transform}" d="${iconPathData}"/>`;
  const textPaths =
    `<path fill="${textFill}" d="${gGlyph}"/>` +
    `<path fill="${textFill}" d="${iGlyph}"/>` +
    `<path fill="${textFill}" d="${tGlyph}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="292" height="92pt"` +
    ` viewBox="0 0 219 92">${textPaths}${iconPath}</svg>`
  );
}

const logoVariants = {
  '1788C':  { text: orange, icon: orange },
  '2Color': { text: brown,  icon: orange },
  'Black':  { text: black,  icon: black },
  'White':  { text: white,  icon: white },
};

for (const [variant, { text, icon: iconFill }] of Object.entries(logoVariants)) {
  const svg = logoSvg(text, iconFill);
  const svgPath = path.join(outDir, `Git-Logo-${variant}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`Wrote ${svgPath}`);

  // Logo height="92pt" at 300 DPI = 383px; fitTo by height so the
  // unitless width scales proportionally via the viewBox aspect ratio.
  const pngPath = path.join(outDir, `Git-Logo-${variant}.png`);
  fs.writeFileSync(pngPath, renderPng(svg, { mode: 'height', value: 383 }));
  console.log(`Wrote ${pngPath}`);
}
