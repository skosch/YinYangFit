import { createAction, createReducer } from "typesafe-actions";
import update from "immutability-helper";

interface IControlsState {
  factor: number[];
  factorPoints: any[];
  gapWeights: number[];
  gapWeightsPoints: any[];
  blurWeights: number[];
  blurWeightsPoints: any[];
  blurWeightExps: number[];
  blurWeightExpsPoints: any[];
  exponent: number;
  target: number;
}

const defaultState: IControlsState = {
  factorPoints: [{x: 0, xLocked: true, safe: true, y: 0.2},
                 {x: 1.0, xLocked: true, safe: true, y: 0.2}],
  factor: [],
  betaPoints: [{x: 0, xLocked: true, safe: true, y: 0.2},
                 {x: 1.0, xLocked: true, safe: true, y: 0.2}],
  beta: [],
  gapWeightsPoints: [{x: 0, xLocked: true, safe: true, y: 0.2},
                 {x: 1.0, xLocked: true, safe: true, y: 0.2}],
  gapWeights: [],
  blurWeightsPoints: [{x: 0, xLocked: true, safe: true, y: 0.2},
                 {x: 1.0, xLocked: true, safe: true, y: 0.2}],
  blurWeights: [],
  blurWeightExpsPoints: [{x: 0, xLocked: true, safe: true, y: 0.2},
                 {x: 1.0, xLocked: true, safe: true, y: 0.2}],
  blurWeightExps: [],
  exponent: 2.5,
  target: 0.1,
};

const controlsActions = {
  updateParams: createAction("controls/UPDATE_PARAMS")<string>(),
  updateControlParam: createAction("controls/UPDATE_CONTROL_PARAM")<{key: string, csPoints: any[]; values: number[]}>()
};

const ControlsReducer = createReducer(
  defaultState
).handleAction(
  controlsActions.updateParams,
  (state: IControlsState, { payload: params }: { payload: any }) =>
    update(state, { $set: params })
).handleAction(
  controlsActions.updateControlParam,
  (state: IControlsState, {payload: {key, csPoints, values}}: {payload: any}) => {
    return update(state, {
      [key]: {$set: values},
      [key + "Points"]: {$set: csPoints},
    });
  }
);

export { controlsActions, IControlsState };

export default ControlsReducer;
