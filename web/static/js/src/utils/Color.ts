import cwise from "cwise";
import ops from "ndarray-ops";
import lerp from "lerp";
import ndarray from "ndarray";

/* Code in this file adapted from:
 *
 * https://github.com/bpostlethwaite/colormap
 * Ben Postlethwaite
 * January 2013
 * License MIT
 *
 * and
 *
 * https://github.com/mikolalysenko/apply-colormap
 * Mikola Lysenko
 * September 2014
 * License MIT
 */

interface IScaleEntry {
    index: number;
    rgba: [number, number, number, number];
};

const createColormap = () => {
    const scale: IScaleEntry[] = [
        { index: 0, rgba: [178, 10, 28, 255] },
        { index: 0.4, rgba:  [178, 10, 28, 255]},
        { index: 0.5, rgba: [255, 255, 255, 255] },
        { index: 0.6, rgba: [5, 10, 172, 255] },
        { index: 1, rgba: [5, 10, 172, 255]}
    ];

  const nshades = 256;

  // map index points from 0..1 to 0..n-1
  const indices = scale.map(c => Math.round(c.index * nshades));
  const steps = scale.map(c => c.rgba);
  /*
   * map increasing linear values between indices to
   * linear steps in colorvalues
   */
  const colors: [number, number, number, number][] = [];
  for (let i = 0; i < indices.length - 1; ++i) {
    const nsteps = indices[i + 1] - indices[i];
    const fromrgba = steps[i];
    const torgba = steps[i + 1];

    for (let j = 0; j < nsteps; j++) {
      const amt = j / nsteps;
      colors.push([
        Math.round(lerp(fromrgba[0], torgba[0], amt)),
        Math.round(lerp(fromrgba[1], torgba[1], amt)),
        Math.round(lerp(fromrgba[2], torgba[2], amt)),
        lerp(fromrgba[3], torgba[3], amt)
      ]);
    }
  }

  //add 1 step as last value
  colors.push(scale[scale.length - 1].rgba);

  return colors;
}

const cmap = createColormap();


const doColoring = cwise({
  args: [
    "array",
    "array",
    "array",
    "array",
    "array",
    "scalar",
    "scalar",
    "scalar"
  ],
  body: function(out_r, out_g, out_b, out_a, inp, cmap, lo, hi) {
    var idx = (((inp - lo) * (cmap.length - 1)) / (hi - lo)) | 0;
    if (idx < 0) {
      idx = 0;
    }
    if (idx > cmap.length - 1) {
      idx = cmap.length - 1;
    }
    out_r = cmap[idx][0];
    out_g = cmap[idx][1];
    out_b = cmap[idx][2];
    out_a = cmap[idx][3];
  }
});

const alpha = new Array(256).fill(255);
for (let i = 0; i < 128; i++) {
  alpha[127 + i] = Math.sqrt(i / 128);
  alpha[127 - i] = Math.sqrt(i / 128);
}

export function applyColormap(array, options) {
  options = options || {};
  var lo = -Infinity;
  var hi = Infinity;
  var alpha = 255;
  if ("min" in options) {
    lo = +options.min;
  } else {
    lo = ops.inf(array);
  }
  if ("max" in options) {
    hi = +options.max;
  } else {
    hi = ops.sup(array);
  }
  var s = 4;
  var out = options.outBuffer || new Uint8Array(array.size * s);
  var out_shape = new Array(array.dimension + 1);
  var out_stride = new Array(array.dimension);
  for (var i = array.dimension - 1; i >= 0; --i) {
    out_stride[i] = s;
    out_shape[i] = array.shape[i];
    s *= array.shape[i];
  }
  out_shape[array.dimension] = 4;
  var out_colors = new Array(4);
  for (var i = 0; i < 4; ++i) {
    out_colors[i] = ndarray(out, array.shape, out_stride, i);
  }
  doColoring(
    out_colors[0],
    out_colors[1],
    out_colors[2],
    out_colors[3],
    array,
    cmap,
    lo,
    hi
  );
  return ndarray(out, out_shape);
}
