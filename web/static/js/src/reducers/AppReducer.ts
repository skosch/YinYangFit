import { createAction, createAsyncAction, createReducer } from 'typesafe-actions';

import update from 'immutability-helper';

interface IFontInfo {
  boxHeight: number;
  boxWidth: number;
  nSizes: number;
  nOrientations: number;
  ascender: number;
  ascenderPx: number;
  baselineRatio: number;
  descender: number;
  descenderPx: number;
  familyName: string;
  styleName: string;
  fileName: string;
  fullHeight: number;
  fullHeightPx: number;
  xHeight: number;
  italicAngle: number;
};

interface IAppState {
  fontInfo: IFontInfo;
  fontFilePath: string;
  fontLoadedStatus: string;
  fontName: string;
  height: number;
};

const defaultState: IAppState = {
  fontFilePath: "",
  fontLoadedStatus: "No file loaded",
  fontName: "",
  height: 89,
  fontInfo: {
    boxHeight: 0,
    boxWidth: 0,
    nSizes: 0,
    nOrientations: 0,
    ascender: 0,
    ascenderPx: 0,
    baselineRatio: 0,
    descender: 0,
    descenderPx: 0,
    familyName: "",
    styleName: "",
    fileName: "",
    fullHeight: 0,
    fullHeightPx: 0,
    xHeight: 0,
    italicAngle: 0,
  },
};

const appActions = {
  loadFont: createAction("app/LOAD_FONT")<string>(),
  updateFontInfo: createAction("app/UPDATE_FONT_INFO")<IFontInfo>(),
};

const AppReducer = createReducer(defaultState)
.handleAction(appActions.loadFont, (state: IAppState, {payload: fontFilePath}: {payload: string}) => update(state, {fontFilePath: {$set: fontFilePath}}))
.handleAction(appActions.updateFontInfo, (state: IAppState, {payload: fontInfo}: {payload: IFontInfo}) => update(state, {fontInfo: {$merge: fontInfo}}));

export {
  appActions,
  IAppState,
};

export default AppReducer;
