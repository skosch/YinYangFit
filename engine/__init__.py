#!/usr/bin/env python

import argparse

from .font_loader import load_font
from .filter_bank import FilterBank
from .util import relu

import time
import os
import io
script_dir = os.path.dirname(os.path.abspath(__file__))

from tqdm import tqdm

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
import base64

import pyopencl as cl

kernels_file_path = os.path.join(script_dir, "kernels.cl")
print("Loading OpenCL kernel file at", kernels_file_path)

all_lc_glyphs = "abcdefghijklmnopqrstuvwxyz"

class Engine:
    def __init__(self, file_name, size_factor=2.1, n_scales=17, n_orientations=4, glyphset=all_lc_glyphs):
        self.single_glyph_widths = {}
        self.single_glyph_images = {}
        self.convolved_glyph_images = {}
        self.set_up_gpu_processor_kernel()

        self.load_font_file(file_name, size_factor)
        self.load_filter_bank_and_convolve_glyphs(n_scales, n_orientations, glyphset)
        print("Engine loaded.")

    def load_font_file(self, file_name, size_factor):
        (f, box_height, box_width) = load_font(file_name, size_factor)
        self.f = f
        self.file_name = file_name
        self.size_factor = size_factor
        self.box_height = box_height
        self.box_width = box_width
        print("Font loaded.")

    def load_filter_bank_and_convolve_glyphs(self, n_scales, n_orientations, glyphset):
        self.filter_bank = FilterBank(n_scales, n_orientations, self.box_height, self.box_width, 0, display_filters=False)
        self.glyphset = glyphset
        self.n_scales = n_scales
        self.n_orientations = n_orientations
        print("Convolving glyphs ...")
        for g in tqdm(glyphset):
            rg = self.f.glyph(g)
            self.single_glyph_widths[g] = rg.ink_width
            self.single_glyph_images[g] = rg.as_matrix(normalize=True).with_padding_to_constant_box_width(self.box_width)
            self.convolved_glyph_images[g] = self.filter_bank.convolve(self.single_glyph_images[g]).astype(np.complex64)
        print("Filter bank loaded and glyphs convolved.")

    def font_info(self):
        """
        For convenience. Used by the web interface to display info about the loaded font,
        adjust the height of the preview canvas, etc.
        """
        font_info = {
            "size_factor": self.size_factor,
            "box_height": self.box_height,
            "box_width": self.box_width,
            "n_scales": self.n_scales,
            "n_orientations": self.n_orientations,
            "ascender": self.f.ascender,
            "ascender_px": self.f.ascender_px,
            "baseline_ratio": self.f.baseline_ratio,
            "descender": self.f.descender,
            "descender_px": self.f.descender_px,
            "family_name": self.f.face.family_name.decode("utf-8"),
            "style_name": self.f.face.style_name.decode("utf-8"),
            "file_name": self.file_name,
            "full_height": self.f.full_height,
            "full_height_px": self.f.full_height_px,
            "xheight": self.f.get_xheight(),
            "italic_angle": self.f.italic_angle,
            "glyph_images": self.get_glyph_images(self.glyphset)
        }
        return font_info


    def get_glyph_images(self, glyphset):
        bytes_writer = io.BytesIO()

        # We're using the following encoding:
        # 4 bytes character (utf-16)
        # 4 bytes height (int32)
        # 4 bytes width (int32)
        # (height * width * 4) bytes penalty_fields (float32)

        for c in glyphset:
            rg = self.f.glyph(c)
            bytes_writer.write(c.encode("utf-16")) # utf-16 means always use 4 bytes (2 for BOM, then 2 for the character)
            bytes_writer.write(np.int32(self.box_height).tobytes()) # height
            bytes_writer.write(np.int32(rg.ink_width).tobytes()) # width
            bytes_writer.write(rg.as_matrix(normalize=True).astype(np.float32).tobytes())

        binary_images = bytes_writer.getvalue()
        binary_as_string = base64.b64encode(binary_images).decode("utf-8")
        return binary_as_string

    def set_up_gpu_processor_kernel(self):
        self.ctx = cl.create_some_context(False)      # Create a context with your device
        #now create a command queue in the context
        self.queue = cl.CommandQueue(self.ctx)
        print("Compiling GPU kernel ...")
        self.vp = cl.Program(self.ctx, open(kernels_file_path).read()).build()
        print("Compiled:", self.vp)


    def create_pair_image_distances(self, lc, rc, distances):
        # This should just take the pre-convolved images and shift them.
        total_width_at_minimum_ink_distance = self.single_glyph_widths[lc] + self.single_glyph_widths[rc] - self.f.minimum_ink_distance(lc, rc)
        total_width_at_desired_distances = total_width_at_minimum_ink_distance + distances

        left_shifts = -np.ceil((total_width_at_desired_distances - self.single_glyph_widths[lc]) / 2).astype(np.int32)
        right_shifts = np.floor((total_width_at_desired_distances - self.single_glyph_widths[rc]) / 2).astype(np.int32)

        return left_shifts, right_shifts

    def render_penalty_fields(self, lc, rc, params, distances):
        # Renders the penalty field for a certain set of sizes and orientations (or all), and returns the diffs
        # TODO: get distances from params

        sc_lg = self.convolved_glyph_images[lc].reshape([self.n_scales, self.n_orientations, self.box_height * self.box_width])
        sc_rg = self.convolved_glyph_images[rc].reshape([self.n_scales, self.n_orientations, self.box_height * self.box_width])
        shifts_l, shifts_r = self.create_pair_image_distances(lc, rc, distances)

        sc_lg_dev = cl.Buffer(self.ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR, hostbuf=sc_lg)
        sc_rg_dev = cl.Buffer(self.ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR, hostbuf=sc_rg)
        shifts_l_dev = cl.Buffer(self.ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR, hostbuf=shifts_l)
        shifts_r_dev = cl.Buffer(self.ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR, hostbuf=shifts_r)
        factor_dev = cl.Buffer(self.ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR, hostbuf=params['factor'])
        gap_weights_dev = cl.Buffer(self.ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR, hostbuf=params['gap_weights'])
        blur_weights_dev = cl.Buffer(self.ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR, hostbuf=params['blur_weights'])

        # create output buffer
        diffs = np.ones((self.n_scales, self.n_orientations, self.box_height * self.box_width * len(distances)), dtype=np.float32)
        dest_dev = cl.Buffer(self.ctx, cl.mem_flags.WRITE_ONLY, diffs.nbytes)

        self.vp.penalty_parallel(self.queue, diffs.shape, None,
                                 dest_dev,
                                 np.int32(self.n_scales),
                                 np.int32(self.n_orientations),
                                 np.int32(self.box_height),
                                 np.int32(self.box_width),
                                 np.int32(len(distances)),
                                 sc_lg_dev,
                                 sc_rg_dev,
                                 shifts_l_dev,
                                 shifts_r_dev,
                                 factor_dev,
                                 np.float32(params['exponent']),
                                 gap_weights_dev,
                                 blur_weights_dev)

        # Get result back
        cl.enqueue_copy(self.queue, diffs, dest_dev)
        penalty_field = np.reshape(diffs, (self.n_scales, self.n_orientations, self.box_height, self.box_width, len(distances))).astype(np.float32)

        return penalty_field

    def get_penalty_fields_subset(self, params):
        # Generate the fields for just a single distance, and a subset of sizes and orientations.
        params = self.prepare_params(params)

        fb = flatbuffers.Builder()


        rendered_pairs = {} # Just so we don't do work more than once

        text = params["sampleText"]
        for i in tqdm(range(len(text) - 1)):
            lc = text[i]
            rc = text[i + 1]
            if (lc + rc) not in rendered_pairs:
                rendered_pairs[(lc + rc)] = True
                penalty_fields = self.render_penalty_fields(lc, rc, params, np.array([params['distance']]).astype(np.int32))

                protobuf_output.penalty_fields[(lc + rc)] = np.sum(penalty_fields[:, :, :, :, 0], (0, 1)).astype(np.float32).tobytes()
                protobuf_output.best_distances[(lc + rc)] = int(0) # This should just be ignored in the browser.

        return protobuf_output.SerializeToString()


    def get_best_distances_and_full_penalty_fields(self, params):
        # Generate the fields for a whole set of distances, then find the best distance, and return it all.
        distances = np.arange(20).astype(np.int32) # TODO: get from params
        params = self.prepare_params(params)

        rendered_fields = {}

        bytes_writer = io.BytesIO()

        # We're using the following encoding:
        # 4 bytes first character
        # 4 bytes second character
        # 4 bytes best distance (int32)
        # 4 bytes height (int32)
        # 4 bytes width (int32)
        # (height * width * 4) bytes penalty_fields (float32)

        text = params["sampleText"]
        for i in tqdm(range(len(text) - 1)):
            lc = text[i]
            rc = text[i + 1]
            if (lc + rc) not in rendered_fields:
                rendered_fields[(lc + rc)] = True
                np_penalty_fields = self.render_penalty_fields(lc, rc, params, distances)
                # Find the zero crossing
                # TODO: there's probably a better way than to do argmin(abs(x)) -- summing and root finding could be done on GPU?
                best_distance_index = np.argmin(np.abs(np.sum(np_penalty_fields, (0, 1, 2, 3))))

                bytes_writer.write(lc.encode("utf-16")) # utf-16 means always use 4 bytes (2 for BOM, then 2 for the character)
                bytes_writer.write(rc.encode("utf-16")) # Can't use utf32 becaues not supported by browsers
                bytes_writer.write(np.int32(distances[best_distance_index] - self.f.minimum_ink_distance(lc, rc)).tobytes())
                bytes_writer.write(np.int32(np_penalty_fields.shape[2]).tobytes()) # height
                bytes_writer.write(np.int32(np_penalty_fields.shape[3]).tobytes()) # height
                bytes_writer.write(np.sum(np_penalty_fields[:, :, :, :, best_distance_index], (0, 1)).astype(np.float32).tobytes())

        return bytes_writer.getvalue()


    def prepare_params(self, params):
        params['factor'] = np.tile(np.array(params['factor'])[:, None].astype(np.float32), [1, self.n_orientations])
        #params['beta'] = np.array(params['beta'])[:, None]
        params['gap_weights'] = np.tile(np.array(params['gapWeights'])[:, None].astype(np.float32), [1, self.n_orientations])
        params['blur_weights'] = np.tile(np.array(params['blurWeights'])[:, None].astype(np.float32), [1, self.n_orientations])
        #params['gap_weights_sq'] = np.array(params['gap_weights_sq'])[:, None].astype(np.float32)
        #params['blur_weights_sq'] = np.array(params['blur_weights_sq'])[:, None].astype(np.float32)
        return params

