import * as React from 'react';
import {LineageCardType} from './LineageTypes';

import './EdgeCanvas.css';
import './LineChart.d.ts';
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
  colType: LineageCardType;
}

export class EdgeCanvas extends React.Component<EdgeCanvasProps, EdgeCanvasState> {
  private myWidth = 200;
  private defaultState = {
    edgeColor: '#BDC1C6',
    viewHeight: 1,
    viewWidth: this.myWidth,
    x1: 0,
    x2: 30,
    x3: this.myWidth-30,
    x4: this.myWidth,
    y1: 0,
    y4: 0,
  } as EdgeCanvasState;
  constructor(props: any) {
    super(props);
    Object.assign(this.defaultState, {
      colType: props.type,
    });
    this.state = Object.assign({}, this.defaultState);
  }

  public componentWillMount(): void {
    const ei = Object.assign({}, this.state, {edgeInfo: []}) as EdgeCanvasState;
    this.setState(ei);
  }

  public shouldComponentUpdate(nextProps: Readonly<EdgeCanvasProps>, nextState: Readonly<EdgeCanvasState>): boolean {
    return this.state.y1 !== nextState.y1 || this.state.y4 !== nextState.y4;
  }

  public drawEdges(cardStructure: number[], reverse: boolean): JSX.Element[] {
    const cardOffset = 24+41+2;
    const newState = Object.assign({}, this.defaultState) as EdgeCanvasState;
    const {x1, x2, x3, x4, edgeColor, viewWidth} = newState;
    const lastNode = reverse?'y1':'y4';
    const edgeInfo = [] as JSX.Element[];
    cardStructure.forEach((rows, i) => {
      for (let j = 0; j < rows; j++) {
        const {y1, y4, viewHeight} = newState;
        edgeInfo.push(
          <LineChart
            key={`${i}-${j}`}
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
            pathColor={edgeColor}
            pathVisible={true}
            pathWidth={1}
            pathOpacity={1}
            pointsVisible={false}
            viewBoxHeight={viewHeight}
            viewBoxWidth={viewWidth}
            pathSmoothing={0}
          />
        );
        newState.viewHeight += 67;
        newState[lastNode] += 67;
      }
      newState.viewHeight += cardOffset;
      newState[lastNode] += cardOffset;
    });
    this.setState(newState);
    return edgeInfo;
  }

  public render(): JSX.Element {
    const {cardArray, reverseEdges} = this.props;
    return <div className={`edgeCanvas kWKfgJ${reverseEdges?' reverse':''}`} style={{width: `${this.myWidth}px`}}>{this.drawEdges(cardArray, reverseEdges)}</div>;
  }
}
