import { createAction, createAsyncAction, createReducer } from 'typesafe-actions';

import update from 'immutability-helper';

interface IFontInfo {
  boxHeight: number;
  boxWidth: number;
  sizeFactor: number;
  nScales: number;
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
  fontLoadedStatus: string;
  fontName: string;
  height: number;
  loadingText: string;
};

const emptyFontInfo = {
    boxHeight: 0,
    boxWidth: 0,
    nScales: 0,
    sizeFactor: 0,
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
};

const defaultState: IAppState = {
  fontLoadedStatus: "No file loaded",
  fontName: "",
  height: 171,
  fontInfo: emptyFontInfo,
  loadingText: "",
};

const appActions = {
  updateFileName: createAction("app/UPDATE_FILE_NAME")<string>(),
  loadFontInfo: createAction("app/UPDATE_FONT_INFO")<{fontInfo: IFontInfo, glyphImagesRaw: any}>(),
  setLoading: createAction("app/SET_LOADING")<string>(),
};

const AppReducer = createReducer(defaultState)
      .handleAction(appActions.updateFileName, (state: IAppState, {payload: fileName}: {payload: string}) => update(state, {fontInfo: {$set: update(emptyFontInfo, {
                                                                                                                              fileName: {$set: fileName}})}}))
      .handleAction(appActions.loadFontInfo, (state: IAppState, {payload: {fontInfo, glyphImagesRaw}}: {payload: any}) => update(state, {fontInfo: {$merge: fontInfo},
                                                                                                                                         height: {$set: fontInfo.boxHeight}}))
      .handleAction(appActions.setLoading, (state: IAppState, {payload: loadingText}: {payload: string}) => update(state, {loadingText: {$set: loadingText}}));

export {
  appActions,
  IAppState,
};

export default AppReducer;
