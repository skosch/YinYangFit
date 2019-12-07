import React, {PureComponent} from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { appActions, IAppState } from "../reducers/AppReducer";
import { controlsActions, IControlsState } from "../reducers/ControlsReducer";
import { previewActions, IPreviewState } from "../reducers/PreviewReducer";

import Button from '@material-ui/core/Button';

import CanvasSpliner from "./CanvasSpliner";

import "../style/Controls.less";

interface IControlsProps {
  app: IAppState;
  preview: IPreviewState;
  previewActions: (typeof previewActions);
  controls: IControlsState;
};
class Controls extends PureComponent<
  IControlsProps & (typeof controlsActions)
  > {
    public render() {

      return (
        <div id="controls">
          <div className="spliners">
            <CanvasSpliner
              csPoints={this.props.controls.factorPoints}
              nPoints={this.props.app.fontInfo.nScales}
              yMin={0.1}
              yMax={1000.}
              onChange={(cp, yv) => this.updateParam("factor", cp, yv)}
              title="Factor"
            />
            <CanvasSpliner
              csPoints={this.props.controls.betaPoints}
              nPoints={this.props.app.fontInfo.nScales}
              yMin={0.1}
              yMax={1000.}
              onChange={(cp, yv) => this.updateParam("beta", cp, yv)}
              title="Beta"
            />
            <CanvasSpliner
              csPoints={this.props.controls.gapWeightsPoints}
              nPoints={this.props.app.fontInfo.nScales}
              yMin={0.1}
              yMax={5000.}
              onChange={(cp, yv) => this.updateParam("gapWeights", cp, yv)}
              title="Gap weights"
            />
            <CanvasSpliner
              csPoints={this.props.controls.blurWeightsPoints}
              nPoints={this.props.app.fontInfo.nScales}
              yMin={0.1}
              yMax={5000.}
              onChange={(cp, yv) => this.updateParam("blurWeights", cp, yv)}
              title="Blur weights"
            />
          </div>
          <textarea
            onChange={this.updateParams}
            rows={30} cols={60}
            value={JSON.stringify(this.props.controls, null, 2)}
          /><br/>
          <Button color="primary" onClick={this.updatePreview}>Sampletext preview</Button>
        </div>
      );
    }

    private updateParams = (ev: any) => {
      try {
        this.props.updateParams(JSON.parse(ev.target.value));
      } catch (e) {
        console.log("Could not update params:", e);
      }
    }

    private updateParam = (key, csPoints, values) => {
      this.props.updateControlParam({key, csPoints, values});
    }

    private updatePreview = () => {
      fetch("/api/best_distances_and_full_penalty_fields", {
        method: "POST",
        body: JSON.stringify({
          params: {
            ...this.props.controls,
            sampleText: this.props.preview.sampleText,
          }
        }),
        headers: {
          'Accept': 'application/octet-stream',
          'Content-Type': 'application/json'
        },
      }).then(res => res.arrayBuffer()).then(this.props.previewActions.updateBestDistancesAndFullPenaltyFieldsPreviewData).catch(e => console.log(e));
    }
};

export default connect(
  ({ app, preview, controls }: any) => {
    return {
      app,
      preview,
      controls,
    };
  },
  dispatch => ({
    ...bindActionCreators(controlsActions, dispatch),
    previewActions: bindActionCreators(previewActions, dispatch),
  })
)(Controls);

