import React, { PureComponent } from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { IAppState, appActions } from "../reducers/AppReducer";
import { previewActions, IPreviewState } from "../reducers/PreviewReducer";

import ndarray from "ndarray";
import ndarrayOps from "ndarray-ops";
import pool from "typedarray-pool";

import { applyColormap } from "../utils/Color";

import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";

import "../style/Preview.less";

interface IPreviewProps {
  app: IAppState;
  appActions: typeof appActions;
  preview: IPreviewState;
}
class Preview extends PureComponent<IPreviewProps & typeof previewActions> {
  private previewCanvasRef;
  private ctx;

  constructor(props) {
    super(props);
    this.previewCanvasRef = React.createRef<HTMLCanvasElement>();
  }

  componentDidMount() {
    this.ctx = this.previewCanvasRef.current.getContext("2d");
  }

  componentDidUpdate(prevProps) {
    this.repaintPreviewCanvas();
  }

  public render() {
    return (
      <div id="preview">
        <div id="preview-controls">
          <div>
            <input
              id="sample-text-input"
              value={this.props.preview.sampleText}
              onChange={this.updateSampleText}
              onKeyDown={this.onSampleTextKeyDown}
              type="text"
            />
          </div>
          <div>
            Penalty fields alpha:
            <Slider
              value={this.props.preview.penaltyFieldsAlpha}
              onChange={this.updatePenaltyFieldsAlpha}
              valueLabelDisplay="auto"
              min={0}
              max={1.0}
              step={0.01}
            />
          </div>
          <div>
            Sample text alpha:
            <Slider
              value={this.props.preview.sampleTextAlpha}
              onChange={this.updateSampleTextAlpha}
              valueLabelDisplay="auto"
              min={0}
              max={1.0}
              step={0.01}
            />
          </div>
          <div>
            Zoom:
            <Slider
              value={this.props.preview.zoomFactor}
              onChange={this.updateZoomFactor}
              valueLabelDisplay="auto"
              min={1.0}
              max={10.0}
              step={0.01}
            />
          </div>
          {this.hasFreshPaint() ? (
            <div>
              Displayed scales:
              <Slider
                value={this.props.preview.currentScaleRange}
                onChangeCommitted={this.updateCurrentScaleRangeAndRerender}
                onChange={this.updateCurrentScaleRange}
                valueLabelDisplay="auto"
                min={0}
                max={17}
                step={1}
              />
            </div>
          ) : null}
        </div>

        <canvas
          id="preview-canvas"
          style={{transform: `scale(${this.props.preview.zoomFactor})`}}
          height={200}
          width={800}
          ref={this.previewCanvasRef}
        ></canvas>
      </div>
    );
  }

  private hasFreshPaint = () => {
    for (let i = 0; i < this.props.preview.sampleText.length - 1; i++) {
      const lc = this.props.preview.sampleText[i];
      const rc = this.props.preview.sampleText[i + 1];
      if (
        !this.props.preview.bestDistances.hasOwnProperty(lc + rc) ||
        !this.props.preview.currentPenaltyFields.hasOwnProperty(lc + rc)
      ) {
        return false;
      }
    }
    return true;
  };

  private updateSampleText = ev => {
    this.props.updateSampleText(ev.currentTarget.value);
  };

  private onSampleTextKeyDown = ev => {
    if (ev.key === "Enter") {
      this.props.appActions.setLoading("Optimizing distances ...");
      fetch("/api/best_distances_and_full_penalty_fields", {
        method: "POST",
        body: JSON.stringify({
          params: {
            ...this.props.controls,
            sampleText: this.props.preview.sampleText
          }
        }),
        headers: {
          Accept: "application/octet-stream",
          "Content-Type": "application/json"
        }
      })
        .then(res => res.arrayBuffer())
        .then(this.props.updateBestDistancesAndFullPenaltyFieldsPreviewData)
        .catch(e => console.log(e));
    }
  };

  private updatePenaltyFieldsAlpha = (ev, value) => {
    this.props.update({ penaltyFieldsAlpha: { $set: value } });
  };
  private updateSampleTextAlpha = (ev, value) => {
    this.props.update({ sampleTextAlpha: { $set: value } });
  };
  private updateZoomFactor = (ev, value) => {
    this.props.update({ zoomFactor: { $set: value } });
  };

  private updateCurrentScaleRange = (ev, value) => {
    this.props.update({ currentScaleRange: { $set: value } });
  };

  private updateCurrentScaleRangeAndRerender = (ev, value) => {
    this.fetchSubsetPreviewDataAndUpdate({ currentScaleRange: value });
  };

  private fetchSubsetPreviewDataAndUpdate = updatedValues => {
    const params = {
      currentScaleRange: this.props.preview.currentScaleRange,
      currentOrientations: this.props.preview.currentOrientations,
      currentDistances: this.props.preview.currentDistances,
      ...updatedValues
    };
    const currentScales = [
      ...Array(params.currentScaleRange[1] - params.currentScaleRange[0]).keys()
    ].map(x => x + params.currentScaleRange[0]);

    this.props.appActions.setLoading("Rendering ...");
    fetch("/api/penalty_fields_subset", {
      method: "POST",
      body: JSON.stringify({
        params: {
          ...this.props.controls,
          ...this.props.preview,
          ...params,
          currentScales,
          sampleText: this.props.preview.sampleText
        }
      }),
      headers: {
        Accept: "application/octet-stream",
        "Content-Type": "application/json"
      }
    })
      .then(res => res.arrayBuffer())
      .then(previewDataBuf => {
        this.props.updatePenaltyFieldsSubsetPreviewData({
          previewDataBuf,
          ...params
        });
      })
      .catch(e => console.log(e));
  };

  private repaintPreviewCanvas = () => {
    if (
      !this.props.preview.currentPenaltyFields[
        this.props.preview.sampleText.slice(0, 2)
      ]
    ) {
      return;
    }

    const {
      totalWidth,
      penaltyFieldPositions,
      penaltyFieldWidths,
      glyphPositions
    } = this.getPositionsAndWidth();

      const canvas = this.previewCanvasRef.current;
      this.ctx = canvas.getContext('2d');
      canvas.width = totalWidth;
      canvas.height = this.props.app.height;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    const outArray = ndarray(
      new Float32Array(totalWidth * this.props.app.height),
      [this.props.app.height, totalWidth]
    );

    for (let i = 0; i < this.props.preview.sampleText.length - 1; i++) {
      const lc = this.props.preview.sampleText[i];
      const rc = this.props.preview.sampleText[i + 1];
      if (this.props.preview.currentPenaltyFields.hasOwnProperty(lc + rc)) {
        const field = ndarray(
          this.props.preview.currentPenaltyFields[lc + rc],
          [this.props.app.height, penaltyFieldWidths[i]]
        );

        for (let y = 0; y < this.props.app.height; y++) {
          for (let x = 0; x < penaltyFieldWidths[i]; x++) {
            outArray.set(
              y,
              x + penaltyFieldPositions[i],
              field.get(y, x) + outArray.get(y, x + penaltyFieldPositions[i])
            );
          }
        }
      }
    }

    // apply alpha
    ndarrayOps.mulseq(outArray, this.props.preview.penaltyFieldsAlpha);

    // now, colorize the outArray
    const colorizedArray = applyColormap(outArray, {
      min: -this.props.preview.currentMaxAbsVal,
      max: +this.props.preview.currentMaxAbsVal
    });

    for (let i = 0; i < this.props.preview.sampleText.length; i++) {
      const c = this.props.preview.sampleText[i];
      const glyphArray = ndarray(this.props.preview.glyphImages[c].array, [
        this.props.app.height,
        this.props.preview.glyphImages[c].width
      ]);
      const glyphPosition = glyphPositions[i];
      for (let y = 0; y < this.props.app.height; y++) {
        for (let x = 0; x < this.props.preview.glyphImages[c].width; x++) {
          const currentR = colorizedArray.get(y, glyphPosition + x, 0);
          const currentG = colorizedArray.get(y, glyphPosition + x, 1);
          const currentB = colorizedArray.get(y, glyphPosition + x, 2);

          const glyphiness = glyphArray.get(y, x); // 1. for glyph active, 0 for not active
          // if the glyph is not active, we want no change,
          // if the glyph is active, we want a darkening between current and zero
          const newR =
            (currentR * (1 - this.props.preview.sampleTextAlpha * glyphiness)) |
            0;
          const newG =
            (currentG * (1 - this.props.preview.sampleTextAlpha * glyphiness)) |
            0;
          const newB =
            (currentB * (1 - this.props.preview.sampleTextAlpha * glyphiness)) |
            0;
          colorizedArray.set(y, glyphPosition + x, 0, newR);
          colorizedArray.set(y, glyphPosition + x, 1, newG);
          colorizedArray.set(y, glyphPosition + x, 2, newB);
        }
      }
    }

    // now, paint any glyphs on top, at some alpha value (TODO)
    const imageData = new ImageData(
      new Uint8ClampedArray(colorizedArray.data.buffer),
      totalWidth,
      this.props.app.height
    );
    this.ctx.putImageData(imageData, 0, 0);
  };

  private getPositionsAndWidth = () => {
    // This function renders the images to the canvas.
    // The main challenge lies in calculating the distances.
    let glyphPositions: number[] = [0];
    let penaltyFieldPositions: number[] = [];
    let penaltyFieldWidths: number[] = [];
    let totalWidth = 0;

    // First, place all of the glyphs. This is easy, because we know their widths and distances.
    // We will pretend, for now, that the first glyph starts at X = 0 (initial value of glyphPositions).
    for (let i = 1; i < this.props.preview.sampleText.length; i++) {
      const lc = this.props.preview.sampleText[i - 1];
      const rc = this.props.preview.sampleText[i];
      glyphPositions[i] =
        glyphPositions[i - 1] +
        this.props.preview.glyphImages[lc].width +
        (this.props.preview.currentDistances[lc + rc] || 0);
    }

    // Then, place all of the penalty field images.
    for (let i = 0; i < this.props.preview.sampleText.length - 1; i++) {
      const lc = this.props.preview.sampleText[i];
      const rc = this.props.preview.sampleText[i + 1];

      const glyphPairAtDistanceWidth =
        this.props.preview.glyphImages[lc].width +
        (this.props.preview.currentDistances[lc + rc] || 0) +
        this.props.preview.glyphImages[rc].width;

      if (this.props.preview.currentPenaltyFields.hasOwnProperty(lc + rc)) {
        const fieldWidth =
          this.props.preview.currentPenaltyFields[lc + rc].length /
          this.props.app.height;

        const glyphPairMarginLeft = Math.floor(
          (fieldWidth - glyphPairAtDistanceWidth) / 2
        );

        penaltyFieldWidths[i] = fieldWidth;
        penaltyFieldPositions[i] = glyphPositions[i] - glyphPairMarginLeft;
        totalWidth = penaltyFieldPositions[i] + fieldWidth;
      } else {
        penaltyFieldWidths[i] = this.props.app.fontInfo.boxWidth;
        penaltyFieldPositions[i] = glyphPositions[i];
        totalWidth =
          penaltyFieldPositions[i] +
          this.props.preview.glyphImages[lc].width +
          this.props.preview.glyphImages[rc].width;
      }
    }

    // now we just have to shift everything over by penaltyFieldPositions[0], to correct for the
    // first glyphPairLeftMargin (doesn't start at X = 0 after all!)
    const adjustmentShift = penaltyFieldPositions[0];
    for (let i = 0; i < this.props.preview.sampleText.length; i++) {
      penaltyFieldPositions[i] -= adjustmentShift; // creates one extra NaN at the end but whatever
      glyphPositions[i] -= adjustmentShift;
    }
    totalWidth -= adjustmentShift;

    // now just return the result
    return {
      totalWidth,
      penaltyFieldPositions,
      glyphPositions,
      penaltyFieldWidths
    };
  };
}

export default connect(
  ({ app, preview, controls }: any) => {
    return {
      app,
      preview,
      controls
    };
  },
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
    ...bindActionCreators(previewActions, dispatch)
  })
)(Preview);
