import { createAction, createReducer } from "typesafe-actions";
import update from "immutability-helper";

import {bufferFromBase64} from "../utils/Base64";

import { appActions } from "./AppReducer";

interface IPreviewState {
  fullPenaltyFields: {
    [pair: string]: Float32Array;
  };
  currentPenaltyFields: {
    [pair: string]: Float32Array;
  };
  bestDistances: {
    [pair: string]: number;
  };
  currentDistances: {
    [pair: string]: number;
  };
  currentScaleRange: [number, number];
  currentOrientations: number[];
  glyphImages: {
    [c: string]: {
      array: Float32Array;
      width: number;
    };
  };
  maxAbsVal: number;
  currentMaxAbsVal: number;
  sampleText: string;
  penaltyFieldsAlpha: number;
  sampleTextAlpha: number;
  zoomFactor: number;
  width: number; // note that height is fixed, based on the scaling factor. See AppReducer
}

const defaultState: IPreviewState = {
  fullPenaltyFields: {},
  currentPenaltyFields: {},
  bestDistances: {},
  currentDistances: {},
  currentOrientations: [0, 1, 2, 3],
  glyphImages: {},
  maxAbsVal: 0,
  currentMaxAbsVal: 0,
  sampleText: "ham",
  currentScaleRange: [0, 17],
  penaltyFieldsAlpha: 1.0,
  sampleTextAlpha: 0.5,
  zoomFactor: 1.0,
  width: 0
};

const previewActions = {
  updateBestDistancesAndFullPenaltyFieldsPreviewData: createAction(
    "preview/UPDATE_BEST_DISTANCES_AND_FULL_PENALTY_FIELDS_PREVIEW_DATA"
  )<any>(),
  updatePenaltyFieldsSubsetPreviewData: createAction(
    "preview/UPDATE_PENALTY_FIELDS_SUBSET_PREVIEW_DATA"
  )<any>(),
  updateSampleText: createAction("preview/UPDATE_SAMPLE_TEXT")<string>(),
  update: createAction("preview/UPDATE")<any>()
};

const te = new TextDecoder("utf-16");

const PreviewReducer = createReducer(defaultState)
  .handleAction(
    previewActions.updateBestDistancesAndFullPenaltyFieldsPreviewData,
    (state: IPreviewState, { payload: previewDataBuf }) => {
      const bestDistances = {};
      const fullPenaltyFields = {};
      let maxAbsVal = 0; // this will help us later in easily setting the bounds of the colorization

      let i = 0;
      while (i < previewDataBuf.byteLength) {
        const lc = te.decode(new Uint8Array(previewDataBuf.slice(i, i + 4)));
        const rc = te.decode(
          new Uint8Array(previewDataBuf.slice(i + 4, i + 8))
        );
        const bdhw = new Int32Array(previewDataBuf.slice(i + 8, i + 20));
        bestDistances[lc + rc] = bdhw[0];
        const height = bdhw[1];
        const width = bdhw[2];
        const arraySize = height * width * 4;
        const array = new Float32Array(
          previewDataBuf.slice(i + 20, i + 20 + arraySize)
        );

        for (let n of array) {
          if (n > maxAbsVal) {
            maxAbsVal = n;
          } else if (-n > maxAbsVal) {
            maxAbsVal = -n;
          }
        }
        fullPenaltyFields[lc + rc] = array;

        i += 20 + arraySize;
      }

      return update(state, {
        bestDistances: { $set: bestDistances },
        currentDistances: { $set: bestDistances },
        fullPenaltyFields: { $set: fullPenaltyFields },
        currentPenaltyFields: { $set: fullPenaltyFields },
        maxAbsVal: { $set: maxAbsVal },
        currentMaxAbsVal: { $set: maxAbsVal },
      });
    }
  )
  .handleAction(
    previewActions.updatePenaltyFieldsSubsetPreviewData,
    (state: IPreviewState, { payload: {previewDataBuf, currentScaleRange, currentOrientations, currentDistances }}) => {

      const currentPenaltyFields = {};
      let currentMaxAbsVal = 0;

      let i = 0;
      while (i < previewDataBuf.byteLength) {
        const lc = te.decode(new Uint8Array(previewDataBuf.slice(i, i + 4)));
        const rc = te.decode(
          new Uint8Array(previewDataBuf.slice(i + 4, i + 8))
        );
        const hw = new Int32Array(previewDataBuf.slice(i + 8, i + 16));
        const height = hw[0];
        const width = hw[1];
        const arraySize = height * width * 4;
        const array = new Float32Array(
          previewDataBuf.slice(i + 16, i + 16 + arraySize)
        );

        for (let n of array) {
          if (n > currentMaxAbsVal) {
            currentMaxAbsVal = n;
          } else if (-n > currentMaxAbsVal) {
            currentMaxAbsVal = -n;
          }
        }
        currentPenaltyFields[lc + rc] = array;

        i += 16 + arraySize;
      }

      return update(state, {
        currentPenaltyFields: { $set: currentPenaltyFields },
        currentScaleRange: {$set: currentScaleRange },
        currentOrientations: {$set: currentOrientations },
        currentDistances: {$set: currentDistances },
        currentMaxAbsVal: {$set: currentMaxAbsVal },
        loadingText: {$set: ""},
      });
    }
  )
  .handleAction(
    previewActions.updateSampleText,
    (state: IPreviewState, { payload: sampleText }: { payload: string }) =>
      update(state, { sampleText: { $set: sampleText } })
  )
  .handleAction(appActions.updateFileName, (state: IPreviewState) =>
    update(state, {
      $merge: {
        fullPenaltyFields: {},
        currentPenaltyFields: {},
        bestDistances: {},
        currentDistances: {},
        glyphImages: {},
        maxAbsVal: 0,
        currentScaleRange: [0, 17],
        penaltyFieldsAlpha: 1.0,
        sampleTextAlpha: 0.5,
        width: 0,
      }
    })
  )
  .handleAction(
    appActions.loadFontInfo,
    (state: IPreviewState, {payload: { fontInfo, glyphImagesRaw }}) => {
      const glyphImages = {};

      const glyphImagesBuf = bufferFromBase64(glyphImagesRaw);

      let i = 0;
      while (i < glyphImagesBuf.byteLength) {
        const c = te.decode(new Uint8Array(glyphImagesBuf.slice(i, i + 4)));
        const hw = new Int32Array(glyphImagesBuf.slice(i + 4, i + 12));
        const height = hw[0];
        const width = hw[1];
        const arraySize = height * width * 4;
        const array = new Float32Array(
          glyphImagesBuf.slice(i + 12, i + 12 + arraySize)
        );

        glyphImages[c] = {
          array,
          width
        };

        i += 12 + arraySize;
      }

      return update(state, { glyphImages: { $set: glyphImages }, loadingText: {$set: ""}});
    }
  )

  .handleAction(
    previewActions.update,
    (state: IPreviewState, { payload: updater }: { payload: any }) =>
      update(state, updater)
  );

export { previewActions, IPreviewState };

export default PreviewReducer;
