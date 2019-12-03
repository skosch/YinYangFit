#!/usr/bin/env python

from flask import Flask, render_template, request, session, make_response
import json

# sys.path hack to allow us to import from ../engine
import sys, os
sys.path.insert(0, os.path.abspath('..'))
from engine import Engine

import numpy as np

#import argparse
#parser = argparse.ArgumentParser(description='A letterfitting tool inspired by biology.')
#parser.add_argument('font_path', type=str, help='Path to the input font file', default="/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf")
#args = parser.parse_args()
font_path = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
print("Loading font file:", font_path)
e = Engine(font_path)

app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('base.html')

@app.route("/api/font_info")
def font_info():
    return json.dumps(e.font_info())

@app.route("/api/render_preview", methods=["POST"])
def render_preview():
    data = request.get_json()['params']
    preview_data = e.render_sample_text(data["sampleText"], data)
    # TODO: use protobuf for this, so we don't have to encode and decode everything always
    return json.dumps(preview_data)

@app.route("/api/glyph_images", methods=["POST"])
def glyph_images():
    chars = request.get_json()['chars']
    response = make_response(e.get_glyph_images(chars))
    response.headers.set('Content-Type', 'application/octet-stream')
    return response

@app.route("/api/best_distances_and_full_penalty_fields", methods=["POST"])
def best_distances_and_full_penalty_fields():
    params = request.get_json()['params']
    response = make_response(e.get_best_distances_and_full_penalty_fields(params))
    response.headers.set('Content-Type', 'application/octet-stream')
    return response

@app.route("/api/penalty_fields_subset", methods=["POST"])
def penalty_fields_subset():
    params = request.get_json()['params']
    response = make_response(e.get_penalty_fields_subset(params))
    response.headers.set('Content-Type', 'application/octet-stream')
    return response
