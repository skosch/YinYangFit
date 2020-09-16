#!/usr/bin/env python

import numpy as np
import matplotlib.pyplot as plt

import gputools

class RadialFilter:
    def __init__(self, n_scales, n_orientations, exponent, padding_factor, box_height, box_width):
        self.box_height = box_height
        self.box_width = box_width
        self.n_scales = n_scales
        self.n_orientations = n_orientations
        self.exponent = exponent
        self.padding_factor = padding_factor
        self.hh = self.box_height * self.padding_factor / 2
        self.ww = self.box_width * self.padding_factor / 2

        (f1, f2) = self.get_filters()
        print("Radial filters computed!")
        self.filter1_fft = np.tile(np.fft.fft2(np.fft.ifftshift(f1, [2, 3])), [n_scales, n_orientations, 1, 1])
        self.filter2_fft = np.tile(np.fft.fft2(np.fft.ifftshift(f2, [2, 3])), [n_scales, n_orientations, 1, 1])
        print("Radial filters fftized!")

    def get_filters(self):
        """Used by __init__ only."""

        u, v = np.mgrid[-self.hh:self.hh, -self.ww:self.ww].astype(np.float32)
        r = np.sqrt(u**2 + v**2)[None, None, :, :] / self.hh
        r[r == 0] = 0.5
        angle = np.arctan2(u, v)[None, None, :, :] # <b, d, s, o, c, h, w>
        angles = np.arange(self.n_orientations)[None, :, None, None].astype(np.float32) / self.n_orientations
        angle_mask_widths = 4.

        mask1 = (1/r) ** self.exponent
        mask2 = (1/r) ** (self.exponent + 1)

        # Uses von-Mises distribution (via Bessel function)
        bp_angle_masks = np.exp(-angle_mask_widths * np.cos(angle - np.pi - np.pi * angles)) / (2*np.pi*np.i0(angle_mask_widths))
        bn_angle_masks = np.exp(-angle_mask_widths * np.cos(angle - np.pi * angles)) / (2*np.pi*np.i0(angle_mask_widths))

        f1 = np.concatenate([mask1 * bp_angle_masks, mask1 * bn_angle_masks], axis=1)
        f2 = np.concatenate([mask2 * bp_angle_masks, mask2 * bn_angle_masks], axis=1)

        return (f1, f2)

    def convolve(self, convolved_glyph_image):
        # Convolved glyph image is a complex64 image of shape <s, o, h, w>. We will return a distance and a fullness image for each.
        abs_input = np.abs(convolved_glyph_image)
        
        padded_input = np.pad(abs_input, [[0, 0], [0, 0],
                            [int(np.ceil(self.hh)), int(self.hh)],
                            [int(np.ceil(self.ww)), int(self.ww)]])
        padded_input = np.tile(padded_input, [1, 2, 1, 1]) # double up the orientations
        # This runs out of memory!
        # We have 26 glyphs, and for each glyph we need n_scales * 2 * n_orientations * 3 * h * 3 * w = 14 * 8 * 9 * 90 * 150 = 108 megabytes. Should be no problem ...
        #print("Convolving glyph with the radial filters ...", padded_input.shape)
        #input_fft = np.fft.fft2(np.fft.ifftshift(padded_input, [2, 3]))
        #print("Input ffted.", input_fft.shape, self.filter1_fft.shape)
        #convolved_fft1 = input_fft * self.filter1_fft
        #convolved_fft2 = input_fft * self.filter2_fft
        #print("Input multiplied.")
        #filtered1 = np.fft.fftshift(np.fft.ifft2(convolved_fft1), [2, 3])
        #print("filtered1.")
        #filtered2 = np.fft.fftshift(np.fft.ifft2(convolved_fft2), [2, 3])
        #print("Convolution done for this glyph.")

        if True:
            padded_input1_ocl = gputools.OCLArray.from_array(np.fft.ifftshift(padded_input, (-2, -1)).astype(np.complex64))
            padded_input2_ocl = gputools.OCLArray.from_array(np.fft.ifftshift(padded_input, (-2, -1)).astype(np.complex64))

            #print("PADDED INPUT COL SIZE", padded_input_ocl.get().shape)

            # TODO MAKE GPU PLAN FIRST, and reuse it
            # TODO Make the broadcasting more efficient
            # TODO Reuse the filter bank across multiple letters.
            gputools.fft(padded_input1_ocl, axes=(-2, -1), inplace=True)
            gputools.fft(padded_input2_ocl, axes=(-2, -1), inplace=True)

            filter1_fft_ocl = gputools.OCLArray.from_array(self.filter1_fft)
            filter2_fft_ocl = gputools.OCLArray.from_array(self.filter2_fft)

            #print("FILTER BANK ", filter_bank_ocl_fft.get().shape)

            padded_input1_ocl *= filter1_fft_ocl
            padded_input2_ocl *= filter2_fft_ocl # in place

            gputools.fft(padded_input1_ocl, axes=(-2, -1), inplace=True, inverse=True)
            gputools.fft(padded_input2_ocl, axes=(-2, -1), inplace=True, inverse=True)

            filtered1 = np.fft.fftshift(padded_input1_ocl.get())
            filtered2 = np.fft.fftshift(padded_input2_ocl.get())
        
        return (
            filtered1[:, :, int(np.ceil(self.hh)):int(self.box_height + np.ceil(self.hh)),
                            int(np.ceil(self.ww)):int(self.box_width + np.ceil(self.ww))],
            filtered2[:, :, int(np.ceil(self.hh)):int(self.box_height + np.ceil(self.hh)),
                            int(np.ceil(self.ww)):int(self.box_width + np.ceil(self.ww))],
        )
