#!/usr/bin/env python

from tensorfont import Font

def load_font(file_name, size_factor):
    f = Font(file_name, 34 * size_factor)
    box_height = f.full_height_px
    box_width = int(222 * size_factor)
    box_width += (box_width + 1) % 2

    return (f, box_height, box_width)
