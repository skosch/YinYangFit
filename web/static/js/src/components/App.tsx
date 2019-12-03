import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { appActions, IAppState } from "../reducers/AppReducer";

import TopBar from "./TopBar";
import Preview from "./Preview";
import Controls from "./Controls";

import "../style/App.less";

interface IAppProps {
  app: IAppState;
}

class App extends PureComponent<IAppProps & typeof appActions> {
  componentDidMount() {
    fetch("/api/font_info", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(fontInfo => {
        this.props.updateFontInfo({
          boxHeight: fontInfo.box_height,
          boxWidth: fontInfo.box_width,
          nSizes: fontInfo.n_sizes,
          nOrientations: fontInfo.n_orientations,
          ascender: fontInfo.ascender,
          ascenderPx: fontInfo.ascenderPx,
          baselineRatio: fontInfo.baselineRatio,
          descender: fontInfo.descender,
          descenderPx: fontInfo.descenderPx,
          familyName: fontInfo.familyName,
          styleName: fontInfo.styleName,
          fileName: fontInfo.fileName,
          fullHeight: fontInfo.fullHeight,
          fullHeightPx: fontInfo.fullHeightPx,
          xHeight: fontInfo.xHeight,
          italicAngle: fontInfo.italicAngle
        });
      });
  }

  public render() {
    return (
      <div id="container">
        <TopBar />
        <Preview />
        <Controls />
      </div>
    );
  }
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
)(App);
