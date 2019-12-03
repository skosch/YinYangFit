import React, {PureComponent} from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { appActions, IAppState } from "../reducers/AppReducer";
import { controlsActions, IControlsState } from "../reducers/ControlsReducer";
import { previewActions, IPreviewState } from "../reducers/PreviewReducer";

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
          <textarea
            onChange={this.updateParams}
            rows={30} cols={60}
            value={JSON.stringify(this.props.controls, null, 2)}
          /><br/>
          <button onClick={this.updateGlyphs}>Update glyphs</button>
          <button onClick={this.updatePreview}>Sampletext preview</button>
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

    private updateGlyphs = () => {
      fetch("/api/glyph_images", {
        method: "POST",
        body: JSON.stringify({
          chars: this.props.preview.sampleText,
        }),
        headers: {
          'Accept': 'application/octet-stream',
          'Content-Type': 'application/json'
        },
      }).then(res => res.arrayBuffer()).then(this.props.previewActions.updateGlyphImages).catch(e => console.log(e));
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

