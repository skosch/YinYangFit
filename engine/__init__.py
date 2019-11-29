#!/usr/bin/env python

import argparse

from .font_loader import load_font
from .filter_bank import FilterBank
from .util import relu

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import root_scalar

all_lc_glyphs = "abcdefghijklmnopqrstuvwxyz"

class Engine:
    def __init__(self, file_name, size_factor=1.1, n_sizes=17, n_orientations=4, glyphs=all_lc_glyphs):
        (f, box_height, box_width) = load_font(file_name, size_factor)
        self.f = f
        self.box_height = box_height
        self.box_width = box_width

        self.filter_bank = FilterBank(n_sizes, n_orientations, box_height, box_width, 0, display_filters=False)
        self.single_glyph_widths = {}
        self.single_glyph_images = {}
        self.convolved_glyph_images = {}
        self.prerender_convolved_glyphs(glyphs)
        print("Engine loaded.")

    def prerender_convolved_glyphs(self, glyphs):
        for g in glyphs:
            rg = self.f.glyph(g)
            self.single_glyph_widths[g] = rg.ink_width
            self.single_glyph_images[g] = rg.as_matrix(normalize=True).with_padding_to_constant_box_width(self.box_width)
            self.convolved_glyph_images[g] = self.filter_bank.convolve(self.single_glyph_images[g])

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


    def process_image(self, sc_input, params):
        # Input: a complex image
        f_s = np.abs(sc_input) ** params['exponent']

        return f_s

    def process_pair(self, sc_lg, sc_rg, params):
        f_l = self.process_image(sc_lg, params)
        f_r = self.process_image(sc_rg, params)
        f_p = self.process_image(sc_lg + sc_rg, params)

        diffs = f_p - f_r - f_l
        return diffs

    def set_params(self, params):
        self.params = params

    def weight_diffs(self, diffs, params):
        gap_diffs = relu(diffs)
        blur_diffs = relu(-diffs)

        gap_weights = np.array(params['gap_weights'])[:, None, None, None]
        blur_weights = np.array(params['blur_weights'])[:, None, None, None]

        return gap_weights * gap_diffs - blur_weights * blur_diffs

    def compute_penalty(self, diffs, params):
        wdiffs = self.weight_diffs(diffs, params)
        return np.sum(wdiffs[:, 0, :, :])

    def get_penalty_at_dist(self, dist, lc, rc, params):
        sc_lg, sc_rg, pair_image = self.create_pair_image(lc, rc, int(np.round(dist)))
        diffs = self.process_pair(sc_lg, sc_rg, params)
        penalty = self.compute_penalty(diffs, params)
        return penalty

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
        #plot_at_dist(2, lc, rc)
        #plot_at_dist(5, lc, rc)
        #plot_at_dist(8, lc, rc)
        #plot_at_dist(12, lc, rc)
        opt_result = root_scalar(self.get_penalty_at_dist, args=(lc, rc, params), bracket=[1, 25], x0=5, method='brentq', xtol=0.1)
        if opt_result.converged:
            print("Best distance for", lc, rc, ":", opt_result.root, "after", opt_result.iterations)

            #plot_at_dist(opt_result.root, lc, rc)
            return int(np.round(opt_result.root))

    def render_sample_text(self, text, params):
        distance_dict = {}
        for i in range(len(text) - 1):
            lc = text[i]
            rc = text[i + 1]
            distance_dict[(lc, rc)] = self.estimate_best_distance(lc, rc, params) - self.f.minimum_ink_distance(lc, rc)
        return self.f.set_string(text, distance_dict)
