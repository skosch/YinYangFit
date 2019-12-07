import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { appActions, IAppState } from "../reducers/AppReducer";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";

import SizeIcon from "@material-ui/icons/FormatSize";

import "../style/TopBar.less";

interface ITopBarProps {
  app: IAppState;
}
class TopBar extends PureComponent<ITopBarProps & typeof appActions> {
  public render() {
    return (
      <AppBar position="static">
        <Toolbar variant="dense">
          <div id="top-bar-controls">
            <div>
              <input
                type="text"
                value={this.props.app.fontInfo.fileName}
                onChange={this.updateFileName}
              onDoubleClick={this.updateCrimson}
                onKeyDown={this.onFileNameKeyDown}
              />
              &emsp;
              {this.props.app.fontInfo.familyName}{" "}
              {this.props.app.fontInfo.styleName}
            </div>
            {this.props.app.fontInfo.sizeFactor > 0 ? (
              <div title="Font size" style={{ maxWidth: "8rem" }}>
                <SizeIcon />
                &emsp;
                <Slider
                  color="secondary"
                  value={this.props.app.fontInfo.sizeFactor}
                  onChangeCommitted={this.updateSizeFactor}
                  valueLabelDisplay="off"
                  min={0.1}
                  max={5.0}
                  step={0.01}
                />
              </div>
            ) : null}
            <div style={{ flex: "0 0" }}>
              {this.props.app.loadingText.length
                ? this.props.app.loadingText
                : "Done."}
            </div>
          </div>
        </Toolbar>
      </AppBar>
    );
  }

  private updateFileName = ev => {
    this.props.updateFileName(ev.currentTarget.value);
  };
  private updateCrimson = ev => {
    this.props.updateFileName("/home/sebastian/.fonts/CrimsonProS/CrimsonProS-Italic.otf");
  };

  private onFileNameKeyDown = ev => {
    if (ev.key === "Enter") {
      console.log("Loading font");
      this.loadFont({
        fileName: ev.currentTarget.value,
        sizeFactor: this.props.app.fontInfo.sizeFactor || 1.0
      });
    }
  };

  private updateSizeFactor = (ev, value) => {
    this.loadFont({
      fileName: this.props.app.fontInfo.fileName,
      sizeFactor: value,
    });
  }

  private loadFont = ({ fileName, sizeFactor }) => {
    this.props.setLoading("Rendering font ...");

    fetch("/api/load_font", {
      method: "POST",
      body: JSON.stringify({
        file_name: fileName,
        size_factor: sizeFactor,
        n_scales: 17,
        n_orientations: 4,
        glyphset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(fontInfo => {
        this.props.loadFontInfo({
          fontInfo: {
            boxHeight: fontInfo.box_height,
            boxWidth: fontInfo.box_width,
            sizeFactor: fontInfo.size_factor,
            nScales: fontInfo.n_scales,
            nOrientations: fontInfo.n_orientations,
            ascender: fontInfo.ascender,
            ascenderPx: fontInfo.ascender_px,
            baselineRatio: fontInfo.baseline_ratio,
            descender: fontInfo.descender,
            descenderPx: fontInfo.descender_px,
            familyName: fontInfo.family_name,
            styleName: fontInfo.style_name,
            fileName: fontInfo.file_name,
            fullHeight: fontInfo.full_height,
            fullHeightPx: fontInfo.full_height_px,
            xHeight: fontInfo.x_height,
            italicAngle: fontInfo.italic_angle
          },
          glyphImagesRaw: fontInfo.glyph_images
        });
      })
      .then(() => this.props.setLoading(""));
  };
}

export default connect(
  ({ app }: any) => {
    return {
      app
    };
  },
  dispatch => ({
    ...bindActionCreators(appActions, dispatch)
  })
)(TopBar);
