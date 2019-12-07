import React, { PureComponent } from "react";
import { CanvasSpliner } from "CanvasSpliner";

interface ICanvasSplinerComponentProps {
  height: number;
  width: number;
  nPoints: number;
  csPoints: any[];
  yMin: number;
  yMax: number;
}

export default class CanvasSplinerComponent extends PureComponent<
  ICanvasSplinerComponentProps
> {
  constructor(props) {
    super(props);
    this.csdivRef = React.createRef<HTMLDivElement>();
    this.cs = null;
  }
  //private this.csdivRef: any
  //private this.cs: any


  componentDidMount = () => {
    this.cs = new CanvasSpliner(
      this.csdivRef.current,
      this.props.height || 300,
      this.props.width || 300
    );
    for (let p of this.props.csPoints) {
      //const yScaled = (p.y - Math.log(this.props.yMin)) / (Math.log(this.props.yMax) - Math.log(this.props.yMin))
      this.cs.add({...p});
    }

    this.cs.on("releasePoint", () => {
      const currentPoints = [];
      for (let i = 0; i < this.cs._pointCollection.getNumberOfPoints(); i++) {
        currentPoints.push(this.cs._pointCollection.getPoint(i));
      }
      const currentValues = [];
      for (let i = 0; i < this.props.nPoints; i++) {
        const yScaled = this.cs.getValue(i / this.props.nPoints);
        const yRaw = Math.exp(yScaled * (Math.log(this.props.yMax) - Math.log(this.props.yMin)) + Math.log(this.props.yMin));
        currentValues.push(yRaw);
      }
      this.props.onChange(currentPoints, currentValues);
    })
  };

  public render() {
    return (<div className="cs-container">
      <span>{this.props.title}</span>
      <div ref={this.csdivRef}></div>
    </div>);
  }
}
