import React, {PureComponent} from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { appActions, IAppState } from "../reducers/AppReducer";

import "../style/TopBar.less";

interface ITopBarProps {
          app: IAppState;
};
class TopBar extends PureComponent<
  ITopBarProps & (typeof appActions)
  > {
    public render() {
      return (
        <div id="top-bar">
          {this.props.app.fontInfo.familyName} {this.props.app.fontInfo.styleName}
        </div>
    );
  }
};

export default connect(
  ({ app, }: any) => {
    return {
      app,
    };
  },
  dispatch => ({
    ...bindActionCreators(appActions, dispatch),
  })
)(TopBar);
