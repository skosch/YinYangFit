#!/usr/bin/env python

import numpy as np
import matplotlib.pyplot as plt

class FilterBank:
    def __init__(self, n_scales, n_orientations, box_height, box_width, skip_scales, display_filters=False):
        self.box_height = box_height
        self.box_width = box_width
        self.n_scales = n_scales
        self.n_orientations = n_orientations
        self.skip_scales = skip_scales

        self.filter_bank = np.zeros((n_scales, n_orientations, box_height, box_width)).astype(np.complex64)

        if display_filters:
            sizediv = 60
            fig, ax = plt.subplots(nrows=n_scales*2, ncols=n_orientations, gridspec_kw = {'wspace':0, 'hspace':0}, figsize=(box_width * n_orientations / sizediv, box_height * n_scales * 2 / sizediv))

        for s in range(n_scales):
            sigma = self.sigma(s)
            for o in range(n_orientations):
                single_filter = self.get_filter(sigma, o) / sigma
                if display_filters:
                        ax[s*2,   o].imshow(np.real(np.fft.ifft2(single_filter)), cmap="inferno")
                        ax[s*2, o].set_aspect("auto")
                        ax[s*2, o].set_yticklabels([])
                        ax[s*2+1, o].imshow(np.imag(np.fft.ifft2(single_filter)), cmap="inferno")
                        ax[s*2+1, o].set_aspect("auto")
                        ax[s*2+1, o].set_yticklabels([])
                self.filter_bank[s, o, :, :] = single_filter

        if display_filters:
                plt.show()

    def sigma(self, si):
        min_sigma = 1.5
        max_sigma = self.box_width / 9.
        sigma = (max_sigma - min_sigma) * (si + self.skip_scales)**2 / (self.n_scales - 1)**2 + min_sigma
        return sigma

    def rotated_mgrid(self, oi):
        """Used by __init__ only. Generates a meshgrid and rotate it by RotRad radians."""
        rotation = np.array([[ np.cos(np.pi*oi/self.n_orientations), np.sin(np.pi*oi/self.n_orientations)],
                        [-np.sin(np.pi*oi/self.n_orientations), np.cos(np.pi*oi/self.n_orientations)]])
        hh = self.box_height / 2
        bw = self.box_width / 2
        y, x = np.mgrid[-hh:hh, -bw:bw]
        y += 0 if self.box_height % 2 == 0 else 0.5
        x += 0 if self.box_width % 2 == 0 else 0.5
        return np.einsum('ji, mni -> jmn', rotation, np.dstack([x, y]))

    def get_filter(self, sigma, theta):
        """Used by __init__ only. Generates a filter based on derivatives of Gaussians"""
        x, y = self.rotated_mgrid(theta)

        # To minimize ringing etc., we create the filter as is, then run it through the DFT.
        s1 = sigma
        d1_space = -np.exp(-(x**2+y**2)/(2*s1**2))*x/(2*np.pi*s1**4) 
        d1 = np.fft.fft2(d1_space + 1j * np.zeros_like(d1_space)) #, [box_height, box_width]) 

        # Second derivative:
        s2 = sigma
        d2_space = np.exp(-(x**2+y**2)/(2*s2**2))/(2*np.pi*s2**4) - np.exp(-(x**2+y**2)/(2*s2**2))*x**2/(2*np.pi*s2**6)
        d2 = sigma**1.5 * np.fft.fft2(d2_space + 1j * np.zeros_like(d2_space)) #, [box_height, box_width])

        # Filter is complex(-d2,d1)
        return 1j * (d2 + 1j * d1) * sigma

    def convolve(self, input_image):
        """
        Input image should have dimensions <h, w> or <s, o, h, w> or <b, s, o, h, w, d>.
        Filter bank should have dimensions <s, o, h, w>
        """
        if len(input_image.shape) == 2:
            bdsohw_input_image = input_image[None, None, None, None, :, :]
        elif len(input_image.shape) == 4:
            bdsohw_input_image = input_image[None, None, :, :, :, :]
        elif len(input_image.shape) == 6:
             bdsohw_input_image = np.einsum("bsohwd->bdsohw", input_image)

        input_in_freqdomain = np.fft.fft2(bdsohw_input_image + 1j * np.zeros_like(bdsohw_input_image))

        result = (np.fft.ifft2(input_in_freqdomain * self.filter_bank[None, None, :, :, :, :]))

        if len(input_image.shape) == 2:
            return np.fft.fftshift(result[0, 0, :, :, :, :], axes=[-2, -1]) # Return <s, o, h, w>
        elif len(input_image.shape) == 4:
            return np.fft.fftshift(result[0, 0, :, :, :, :], axes=[-2, -1]) # Return <s, o, h, w>
        elif len(input_image.shape) == 6:
            return np.einsum("bdsohw->bsohwd", np.fft.fftshift(result, axes=[-2, -1])) # Return <b, s, o, h, w, d>
