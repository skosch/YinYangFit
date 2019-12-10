#include <pyopencl-complex.h>

__kernel void vpak(__global cfloat_t*lg, __global cfloat_t*rg,
                   float const exponent, __global float*factor,
                   __global float*gap_weights, __global float*blur_weights,
                   __global float*dest,
                   int const n_scales, int const n_orientations, int const n_pixels
                   ) {

  int si = get_global_id(0);
  int oi = get_global_id(1);
  int yx = get_global_id(2);

  int i = (si * n_orientations * n_pixels) + (oi * n_pixels) + yx;

  float diff = (
                half_powr(factor[i] * cfloat_abs_squared(cfloat_add(lg[i], rg[i])), exponent/2.) -
                half_powr(factor[i] * cfloat_abs_squared(lg[i]), exponent/2.) -
                half_powr(factor[i] * cfloat_abs_squared(rg[i]), exponent/2.)
                );

  dest[i] = diff > 0 ? (1. + gap_weights[i]) * diff : (1. + blur_weights[i]) * diff;
}

__kernel void penalty_parallel(__global float *dest, // [n_scales, n_orientations, box_height * box_width * n_distances]
                               int n_scales,
                               int n_orientations,
                               int box_height,
                               int box_width,
                               int n_distances,
                               __global cfloat_t *sc_lg, // [n_scales, n_orientations, box_height * box_width]
                               __global cfloat_t *sc_rg, // [n_scales, n_orientations, box_height * box_width]
                               __constant int *shifts_l, // [n_distances]
                               __constant int *shifts_r, // [n_distances]
                               __global float *factor, // [n_scales, n_orientations]
                               __global float *beta, // [n_scales, n_orientations]
                               float exponent,
//                               __global float *gap_weights, // [n_scales, n_orientations]
                               __global float *blur_weight_exps, // [n_scales, n_orientations]
                               __global float *blur_weights) // [n_scales, n_orientations]
  {

  // sc_lg and sc_rg are reshaped to [n_scales, n_orientations, box_height * box_width * n_distances].
  // First, compute the indices in those flattened arrays.
  int si = get_global_id(0);
  int oi = get_global_id(1);
  int yxd = get_global_id(2);
  int _nd = convert_int(yxd / n_distances); // how many full sticks we have in total
  int y = convert_int(_nd / box_width); // how many full layers we have
  int x = _nd - (y * box_width); // how many full sticks we have on the non-full layer
  int di = yxd - (y * box_width * n_distances) - (x * n_distances);
  int gi = (si * (n_orientations * box_height * box_width * n_distances) +
            oi * (box_height * box_width * n_distances) +
            yxd);

  // Now, we want to get the value from the left glyph.
  //
  // TODO: if either out of bounds, vp should also = 0 always.
  // 
  int gi_shifted_x;
  int shifted_x = x - shifts_l[di];
  cfloat_t vl;
  if (shifted_x < 0 || shifted_x >= box_width) {
    vl = cfloat_new(0.0, 0.0);
  } else {
    gi_shifted_x = (si * (n_orientations * box_height * box_width) +
                    oi * (box_height * box_width) +
                    y * (box_width) +
                    shifted_x);
    vl = sc_lg[gi_shifted_x];
  }

  // Now, we want to get the value from the right glyph.
  shifted_x = x - shifts_r[di];
  cfloat_t vr;
  if (shifted_x < 0 || shifted_x >= box_width) {
    vr = cfloat_new(0.0, 0.0);
  } else {
    gi_shifted_x = (si * (n_orientations * box_height * box_width) +
                    oi * (box_height * box_width) +
                    y * (box_width) +
                    shifted_x);
    vr = sc_rg[gi_shifted_x];
  }

  // Now for the sum of the two values: (vp = value of pair)
  cfloat_t vp = cfloat_add(vl, vr);

  // Now compute the difference
  int soi = si * n_orientations + oi;

  // Now compute the exponentiated values
  float evp = half_powr(cfloat_abs_squared(vp), exponent/2.);
  float evl = half_powr(cfloat_abs_squared(vl), exponent/2.);
  float evr = half_powr(cfloat_abs_squared(vr), exponent/2.);

  // Now compute the hyperbolic ratio values
  float lvp = factor[soi] * evp; // / (beta[soi] + evp);
  float lvl = factor[soi] * evl; // / (beta[soi] + evl);
  float lvr = factor[soi] * evr; // / (beta[soi] + evr);

  // Now perform the orientation inhibition (TODO)

  float diff = (lvp - lvl - lvr);

  //dest[gi] = diff > 0 ? (1. + gap_weights[soi]) * diff : (1. + blur_weights[soi]) * diff;
  //dest[gi] = diff > 0 ? 0. : -diff; // half_powr(-blur_weights[soi] * diff, blur_weight_exps[soi]);
  dest[gi] = lvp;
}
