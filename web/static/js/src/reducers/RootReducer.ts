import {combineReducers} from "redux";

import AppReducer from "./AppReducer";
import PreviewReducer from "./PreviewReducer";
import ControlsReducer from "./ControlsReducer";

export default combineReducers({
  app: AppReducer,
  preview: PreviewReducer,
  controls: ControlsReducer,
});
