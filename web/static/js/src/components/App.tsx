import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { appActions, IAppState } from "../reducers/AppReducer";

import {
  createMuiTheme,
  makeStyles,
  ThemeProvider
} from "@material-ui/core/styles";

import purple from "@material-ui/core/colors/purple";
import green from "@material-ui/core/colors/green";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      light: "#4f5b62",
      main: "#263238",
      dark: "#000a12",
      contrastText: "#fff"
    },
    secondary: {
      light: "#4f5b62",
      main: "#fff",
      dark: "#000a12",
      contrastText: "#ccc"
    }
  }
});

import TopBar from "./TopBar";
import Preview from "./Preview";
import Controls from "./Controls";

import "../style/App.less";

interface IAppProps {
  app: IAppState;
}

class App extends PureComponent<IAppProps & typeof appActions> {
  componentDidMount() {
    this.props.setLoading("Getting font data ...");
    fetch("/api/font_info", {
      method: "GET",
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
            nSizes: fontInfo.n_sizes,
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
  }

  public render() {
    return (
      <ThemeProvider theme={theme}>
        <div id="container">
          <TopBar />
          <Preview />
          <Controls />
        </div>
      </ThemeProvider>
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
