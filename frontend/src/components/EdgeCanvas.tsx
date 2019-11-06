import * as React from 'react';
import {LineageCardType} from './LineageTypes';

import './EdgeCanvas.css';
import LineChart from 'react-svg-line-chart';

interface EdgeCanvasProps {
  cardArray: number[];
  reverseEdges: boolean;
  type: LineageCardType;
}

interface EdgeCanvasState {
  viewHeight: number;
  viewWidth: number;
  x1: number;
  x2: number;
  x3: number;
  x4: number;
  y1: number;
  y4: number;
  edgeColor: string;
  edgeInfo: JSX.Element[];
  colType: LineageCardType;
  reRender: boolean;
}

export class EdgeCanvas extends React.Component<EdgeCanvasProps, EdgeCanvasState> {
  constructor(props: any) {
    super(props);
    this.state = {
      colType: props.type,
      edgeColor: '#BDC1C6',
      edgeInfo: [],
      reRender: false,
      viewHeight: 1,
      viewWidth: 160,
      x1: 0,
      x2: 30,
      x3: 130,
      x4: 160,
      y1: 0,
      y4: 0,
    } as EdgeCanvasState;
  }

  public componentWillMount(): void {
    const ei = Object.assign({}, this.state, {edgeInfo: []}) as EdgeCanvasState;
    this.setState(ei);
  }

  public shouldComponentUpdate(nextProps: Readonly<EdgeCanvasProps>, nextState: Readonly<EdgeCanvasState>): boolean { 
    return nextState.reRender;
  }

  public drawEdges = (cardStructure: number[], reverse: boolean) => {
    const cardOffset = 64;
    const {x1, x2, x3, x4, y1, y4} = this.state;
    const newState = Object.assign({}, this.state) as EdgeCanvasState;
    const lastNode = reverse?'y1':'y4';

    cardStructure.forEach(rows => {
      for (let j = 0; j < rows; j++) {
        this.state.edgeInfo.push(
          <LineChart
            data={[
              {x: x1, y: y1},
              {x: x2, y: y1},
              {x: x3, y: y4},
              {x: x4, y: y4},
            ]}
            areaVisible={false}
            axisVisible={false}
            gridVisible={false}
            labelsVisible={false}
            pathColor={this.state.edgeColor}
            pathVisible={true}
            pathWidth={1}
            pathOpacity={1}
            pointsVisible={false}
            viewBoxHeight={this.state.viewHeight}
            viewBoxWidth={this.state.viewWidth}
            pathSmoothing={0}
          />
        );
        newState.viewHeight += 54;
        newState[lastNode] += 55;
      }
      newState.viewHeight += cardOffset;
      newState[lastNode] += cardOffset;
    });
    newState.reRender = false;
    this.setState(newState);
    return this.state.edgeInfo;
  };

  public render(): JSX.Element {
    return <div className='edgeCanvas kWKfgJ'>{this.drawEdges(this.props.cardArray, this.props.reverseEdges)}</div>;
  }
}
