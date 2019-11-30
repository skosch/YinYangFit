#!/usr/bin/env python

from flask import Flask, render_template, request, session
import json

# sys.path hack to allow us to import from ../engine
import sys, os
sys.path.insert(0, os.path.abspath('..'))
from engine import Engine

import matplotlib.pyplot as plt
from io import BytesIO
import base64

import numpy as np


#import argparse
#parser = argparse.ArgumentParser(description='A letterfitting tool inspired by biology.')
#parser.add_argument('font_path', type=str, help='Path to the input font file', default="/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf")
#args = parser.parse_args()
font_path = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
print("Loading font file:", font_path)
e = Engine(font_path)

app = Flask(__name__)

def convert_to_base64_pairimg(array, pair_image, cmap='RdBu'):
    plt.cla()
    plt.imshow(pair_image, cmap='gray')
    vm = max(np.max(array), -np.min(array))
    plt.imshow(array, cmap, vmin=-vm, vmax=vm, alpha=0.7)
    plt.colorbar()
    figfile = BytesIO()
    plt.savefig(figfile, format='png')
    plt.close("all")
    figfile.seek(0)  # rewind to beginning of file
    figdata_png = base64.b64encode(figfile.getvalue()).decode('utf8')
    return figdata_png


def convert_to_base64_sampletext(array, cmap='RdBu'):
    plt.cla()
    plt.imshow(array, cmap='gray')
    figfile = BytesIO()
    plt.savefig(figfile, format='png')
    plt.close("all")
    figfile.seek(0)  # rewind to beginning of file
    figdata_png = base64.b64encode(figfile.getvalue()).decode('utf8')
    return figdata_png

@app.route("/")
def hello():
    return render_template('base.html')

@app.route("/pair_preview", methods=["POST"])
def pair_preview():
    #e.simulate_edge_energy()
    #return json.dumps({'ok': True, 'preview_image': ''})
    data = request.get_json()
    parsed_params = json.loads(data['params'])

    lc = data["letterPair"][0]
    rc = data["letterPair"][1]
    sc_gl, sc_gr, pair_image = e.create_pair_image(lc, rc, parsed_params["distance"])
    diffs = e.process_pair(sc_gl, sc_gr, parsed_params)
    wdiffs = e.weight_diffs(diffs, parsed_params)
    print("Total for pair preview", np.sum(wdiffs[:, 0, :, :]))

    if parsed_params["scale"] == "all":
        preview_image = convert_to_base64_pairimg(np.sum(wdiffs[:, 0, :, :], (0)), pair_image)
    else:
        preview_image = convert_to_base64_pairimg(wdiffs[parsed_params["scale"], 0, :, :], pair_image)

    ret = {'ok': True, 'preview_image': preview_image}
    return json.dumps(ret)

@app.route("/text_preview", methods=["POST"])
def text_preview():
    data = request.get_json()
    parsed_params = json.loads(data['params'])

    preview_image = convert_to_base64_sampletext(e.render_sample_text(parsed_params["text"], parsed_params))
    return json.dumps({'ok': True, 'preview_image': preview_image})
