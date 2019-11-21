import * as React from 'react';
import {DEFAULT_LINEAGE_CARD_TYPE, LineageCardType} from './LineageTypes';

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
  edgeInfo: JSX.Element[]
}

export class EdgeCanvas extends React.Component<EdgeCanvasProps, EdgeCanvasState> {
  private myWidth = 200;
  private defaultState: EdgeCanvasState = {
    colType: DEFAULT_LINEAGE_CARD_TYPE,
    edgeColor: '#BDC1C6',
    edgeInfo: [],
    viewHeight: 1,
    viewWidth: this.myWidth,
    x1: 0,
    x2: 30,
    x3: this.myWidth-30,
    x4: this.myWidth,
    y1: 0,
    y4: 0,
  };
  constructor(props: EdgeCanvasProps) {
    super(props);
    this.state = this.buildInitialState(props.type);
    this.drawEdges = this.drawEdges.bind(this)
  }

  componentDidMount(): void {
    const {cardArray, reverseEdges} = this.props;
    this.drawEdges(cardArray, reverseEdges);
  }

  public drawEdges(cardStructure: number[], reverse: boolean) {
    const cardContainerSpacerHeight = 24;
    const cardTitleHeight = 41;
    const cardTitleBorders = 2;
    // Top of the first card in the row
    const cardOffset = cardContainerSpacerHeight + cardTitleHeight + cardTitleBorders;
    const newState = this.buildInitialState(this.props.type);
    const {x1, x2, x3, x4, edgeColor, viewWidth} = newState;
    const lastNode = reverse ? 'y1' : 'y4';
    cardStructure.forEach((rows, i) => {
      for (let j = 0; j < rows; j++) {
        const {y1, y4, viewHeight} = newState;
        newState.edgeInfo.push(
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
  }

  public render(): JSX.Element {
    const {reverseEdges} = this.props;
    return <div className={`edgeCanvas kWKfgJ${reverseEdges?' reverse':''}`} style={{width: `${this.myWidth}px`}}>{this.state.edgeInfo}</div>;
  }

  private buildInitialState(type: LineageCardType): EdgeCanvasState {
    return Object.assign({}, this.defaultState, {colType: type});
  }
}
