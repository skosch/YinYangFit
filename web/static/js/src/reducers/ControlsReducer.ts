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

const factors = [
  0.00467659,0.06577225,0.24097916,0.48909482,0.7240027,0.89074767 ,0.97817814,1.,0.97676164,0.9267816,0.8634805,0.79563844 ,0.7285213,0.66501266];

const defaultState: IControlsState = {
  factorPoints: [
    {x: 0./14., xLocked: true, safe: true, y: factors[0]},
    {x: 1./14., xLocked: true, safe: true, y: factors[1]},
    {x: 2./14., xLocked: true, safe: true, y: factors[2]},
    {x: 3./14., xLocked: true, safe: true, y: factors[3]},
    {x: 4./14., xLocked: true, safe: true, y: factors[4]},
    {x: 5./14., xLocked: true, safe: true, y: factors[5]},
    {x: 6./14., xLocked: true, safe: true, y: factors[6]},
    {x: 7./14., xLocked: true, safe: true, y: factors[7]},
    {x: 8./14., xLocked: true, safe: true, y: factors[8]},
    {x: 9./14., xLocked: true, safe: true, y: factors[9]},
    {x: 10./14., xLocked: true, safe: true, y: factors[10]},
    {x: 11./14., xLocked: true, safe: true, y: factors[11]},
    {x: 12./14., xLocked: true, safe: true, y: factors[12]},
    {x: 13./14., xLocked: true, safe: true, y: factors[13]},
  ],
  factor: factors,
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
