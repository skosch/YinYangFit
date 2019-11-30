#!/usr/bin/env python

import argparse

from .font_loader import load_font
from .filter_bank import FilterBank
from .util import relu

import time

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import root_scalar

import reikna.cluda as cluda
api = cluda.ocl_api()

all_lc_glyphs = "abcdefghijklmnopqrstuvwxyz"

class Engine:
    def __init__(self, file_name, size_factor=1.1, n_sizes=17, n_orientations=4, glyphs=all_lc_glyphs):
        (f, box_height, box_width) = load_font(file_name, size_factor)
        self.f = f
        self.box_height = box_height
        self.box_width = box_width
        self.n_sizes = n_sizes
        self.n_orientations = n_orientations
        self.set_up_gpu_processor_kernel()

        self.filter_bank = FilterBank(n_sizes, n_orientations, box_height, box_width, 0, display_filters=False)
        self.single_glyph_widths = {}
        self.single_glyph_images = {}
        self.convolved_glyph_images = {}
        self.prerender_convolved_glyphs(glyphs)
        print("Engine loaded.")

    def set_up_gpu_processor_kernel(self):
        self.thr = api.Thread.create()
        program = self.thr.compile(
            """
            #include <pyopencl-complex.h>
            KERNEL
            void complex_abs(GLOBAL_MEM float*dest, GLOBAL_MEM cfloat_t*lg, GLOBAL_MEM cfloat_t*rg, float exponent, float factor) {
              const SIZE_T i = get_global_id(0);

              dest[i] = (
                half_powr(factor * cfloat_abs_squared(cfloat_add(lg[i], rg[i])), exponent/2.) -
                half_powr(factor * cfloat_abs_squared(lg[i]), exponent/2.) -
                half_powr(factor * cfloat_abs_squared(rg[i]), exponent/2.)
              );
            }""")
        self.complex_abs = program.complex_abs

    def prerender_convolved_glyphs(self, glyphs):
        for g in glyphs:
            rg = self.f.glyph(g)
            self.single_glyph_widths[g] = rg.ink_width
            self.single_glyph_images[g] = rg.as_matrix(normalize=True).with_padding_to_constant_box_width(self.box_width)
            self.convolved_glyph_images[g] = self.filter_bank.convolve(self.single_glyph_images[g]).astype(np.complex64)

    def create_pair_image(self, lc, rc, distance, display_pair=False):
        # This should just take the pre-convolved images and shift them.
        total_width_at_minimum_ink_distance = self.single_glyph_widths[lc] + self.single_glyph_widths[rc] - self.f.minimum_ink_distance(lc, rc)

        lshift = np.ceil(distance / 2)
        rshift = np.floor(distance / 2)

        total_ink_width = self.single_glyph_widths[lc] + self.single_glyph_widths[rc]
        ink_width_left = np.floor(total_ink_width / 4)
        ink_width_right = np.ceil(total_ink_width / 4)

        left_translation = (-(np.ceil(total_width_at_minimum_ink_distance/2) + lshift) - (-ink_width_left)).astype(np.int32)
        right_translation = ((np.floor(total_width_at_minimum_ink_distance/2) + rshift) - ink_width_right).astype(np.int32)

        sc_lg = np.pad(self.convolved_glyph_images[lc][:, :, :, -left_translation:], [[0, 0], [0, 0], [0, 0], [0, -left_translation]])
        sc_rg = np.pad(self.convolved_glyph_images[rc][:, :, :, :-right_translation], [[0, 0], [0, 0], [0, 0], [right_translation, 0]])

        s_lg = np.pad(self.single_glyph_images[lc][:, -left_translation:], [[0, 0], [0, -left_translation]])
        s_rg = np.pad(self.single_glyph_images[rc][:, :-right_translation], [[0, 0], [right_translation, 0]])

        return (sc_lg, sc_rg, s_lg + s_rg)

    def process_image(self, sc_input, params, outim):

        return f_s

    def process_pair(self, sc_lg, sc_rg, params):
        outim = np.empty_like(sc_lg)
        t0 = time.time()
        #f_l = self.process_image(sc_lg, params, outim)
        #f_r = self.process_image(sc_rg, params, outim)
        #f_p = self.process_image(sc_lg + sc_rg, params, outim)

        # Input: a complex image
        sc_lg_dev = self.thr.to_device(sc_lg)
        sc_rg_dev = self.thr.to_device(sc_rg)
        exponent = np.float32(params['exponent'])
        factor = np.float32(params['factor']) # / (params['beta'] ** params['exponent'] + np.abs(sc_input) ** params['exponent'])
        dest_dev = self.thr.array(sc_lg.shape, dtype=np.float32)
        N = 4 * sc_lg_dev.shape[0] * sc_lg_dev.shape[1] * sc_lg_dev.shape[2] * sc_lg_dev.shape[3]
        self.complex_abs(dest_dev, sc_lg_dev, sc_rg_dev, exponent, factor, global_size=N)
        diffs = dest_dev.get()

        t1 = time.time()

        return diffs

    def set_params(self, params):
        self.params = params

    def weight_diffs(self, diffs, params):
        gap_diffs = relu(diffs)
        blur_diffs = relu(-diffs)

        gap_weights = np.array(params['gap_weights'])[:, None, None, None]
        blur_weights = np.array(params['blur_weights'])[:, None, None, None]
        gap_weights_sq = np.array(params['gap_weights_sq'])[:, None, None, None]
        blur_weights_sq = np.array(params['blur_weights_sq'])[:, None, None, None]

        return gap_weights * gap_diffs + gap_weights_sq * gap_diffs**2 - blur_weights * blur_diffs - blur_weights_sq * blur_diffs**2

    def compute_penalty(self, diffs, params):
        wdiffs = self.weight_diffs(diffs, params)
        return np.sum(wdiffs[:, 0, :, :])

    def get_penalty_at_dist(self, dist, lc, rc, params):
        sc_lg, sc_rg, pair_image = self.create_pair_image(lc, rc, int(np.round(dist)))
        diffs = self.process_pair(sc_lg, sc_rg, params)
        penalty = self.compute_penalty(diffs, params)
        return penalty

    def simulate_edge_energy(self):
        ds = range(self.box_width // 3)
        n_d = len(ds)
        ws = [self.box_width // 5]
        n_w = len(ws) #self.box_width // 6
        gapgain = np.zeros((self.n_sizes, n_d, n_w))
        blurloss = np.zeros((self.n_sizes, n_d, n_w))

        for id, d in enumerate(ds):
            for iw, w in enumerate(ws):
                left_test_image = np.zeros((self.box_height, self.box_width))
                right_test_image = np.zeros((self.box_height, self.box_width))
                pair_test_image = np.zeros((self.box_height, self.box_width))
                bcl = self.box_width // 2 - w // 2 - d // 2 # center of bar on lfet
                bcr = int(np.ceil((self.box_width + d + w) / 2)) # center of bar on lfet
                hwl = (w // 2)
                hwr = int(np.ceil(w / 2))
                left_test_image[:, bcl-hwl:bcl+hwr] = 1.
                right_test_image[:, bcr-hwl:bcr+hwr] = 1.
                pair_test_image = left_test_image + right_test_image

                convolved_left_test_image = self.filter_bank.convolve(left_test_image)
                convolved_right_test_image = self.filter_bank.convolve(right_test_image)
                convolved_pair_test_image = self.filter_bank.convolve(pair_test_image)
                for si in range(self.n_sizes):
                    cl_abs = np.abs(convolved_left_test_image[si, 0, :, :])**2 / (.01+np.abs(convolved_left_test_image[si, 0, :, :])**2)
                    cr_abs = np.abs(convolved_right_test_image[si, 0, :, :])**2 / (.01+np.abs(convolved_right_test_image[si, 0, :, :])**2)
                    cp_abs = np.abs(convolved_pair_test_image[si, 0, :, :])**2 / (.01+np.abs(convolved_pair_test_image[si, 0, :, :])**2)
                    diffs = cp_abs - cl_abs - cr_abs
                    gapgain[si, id, iw] = np.sum(relu(diffs))
                    blurloss[si, id, iw] = np.sum(relu(-diffs))

        # Now we want to plot this stuff.
        # First, for the gapgain.
        # At every scale, the gapgain depends on d
        plt.plot(gapgain[:, :, -1].T)
        plt.plot(blurloss[:, :, -1].T, linestyle='dotted')
        plt.show()
        return True


    def plot_at_dist(self, dist, lc, rc, params):
        sc_lg, sc_rg, pair_image = self.create_pair_image(lc, rc, int(np.round(dist)))
        diffs = self.process_pair(sc_lg, sc_rg, params)
        wdiffs = self.weight_diffs(diffs, params)
        plt.imshow(gls + grs, cmap='gray')
        total = np.sum(wdiffs[:, 0, :, :], (0))
        vm = max(np.max(total), -np.min(total))
        plt.imshow(total, vmin=-vm, vmax=vm, cmap="RdBu", alpha=0.7)
        plt.colorbar()
        plt.show()

    def estimate_best_distance(self, lc, rc, params):
        try:
            opt_result = root_scalar(self.get_penalty_at_dist, args=(lc, rc, params), bracket=[1, 50], x0=5, method='toms748', xtol=0.9)
            if opt_result.converged:
                print("Best distance for", lc, rc, ":", opt_result.root, "after", opt_result.iterations)

                #plot_at_dist(opt_result.root, lc, rc)
                return int(np.round(opt_result.root))
            else:
                print("No optimality")
                return 0
        except:
            print("Couldn't solve for", lc, rc, ". Values at 0 and b are:")
            print(self.get_penalty_at_dist(1, lc, rc, pparams))
            print(self.get_penalty_at_dist(50, lc, rc, pparams))
            return 0

    def render_sample_text(self, text, params):
        distance_dict = {}
        params['factor'] = np.array(params['factor'])[:, None, None, None]
        params['beta'] = np.array(params['beta'])[:, None, None, None]
        for i in range(len(text) - 1):
            lc = text[i]
            rc = text[i + 1]
            distance_dict[(lc, rc)] = self.estimate_best_distance(lc, rc, params) - self.f.minimum_ink_distance(lc, rc)
        return self.f.set_string(text, distance_dict)


    # Okay, how can we make this faster?
    # We need it to be real-time speed.
