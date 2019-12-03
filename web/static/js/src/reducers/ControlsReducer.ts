import { createAction, createReducer } from "typesafe-actions";
import update from "immutability-helper";

interface IControlsState {
  factor: number[];
  gapWeights: number[];
  blurWeights: number[];
  exponent: number;
}

const defaultState: IControlsState = {
  factor: [1, 1, 1, 1, 1, 1, 5, 10, 10, 10, 5, 2, 3, 10, 10, 10, 10],
  gapWeights: [0, 0, 0, 0, 0, 10, 10, 10, 150, 200, 200, 110, 10, 0, 0, 0, 0],
  blurWeights: [
    100,
    100,
    100,
    100,
    100,
    100,
    100,
    50,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ],
  exponent: 2
};

const controlsActions = {
  updateParams: createAction("controls/UPDATE_PARAMS")<string>()
};

const ControlsReducer = createReducer(
  defaultState
).handleAction(
  controlsActions.updateParams,
  (state: IControlsState, { payload: params }: { payload: any }) =>
    update(state, { $set: params })
);

export { controlsActions, IControlsState };

export default ControlsReducer;
