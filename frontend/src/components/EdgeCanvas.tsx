import * as React from 'react';
import LineChart from 'react-svg-line-chart';
import {classes, stylesheet} from 'typestyle';
import {LineageCardType} from './LineageTypes';
import './LineChart.d.ts';
import {px} from '../Css';
import {CARD_WIDTH, EDGE_WIDTH} from "./LineageCss";

interface EdgeCanvasProps {
  cardArray: number[];
  reverseEdges: boolean;
  type: LineageCardType;
}

export const EdgeCanvas: React.FC<EdgeCanvasProps> = ({cardArray, reverseEdges}) => {
  let viewHeight = 1;

  const cardBodyHeight = 67;
  const cardContainerSpacerHeight = 24;
  const cardTitleHeight = 41;
  const cardTitleBorders = 2;
  const cardOffset = cardContainerSpacerHeight + cardTitleHeight + cardTitleBorders;

  const css = stylesheet({
    edgeCanvas: {
      border: 0,
      display: 'block',
      height: px(440),
      marginLeft: px(CARD_WIDTH),
      marginTop: px(74),
      overflow: 'visible',
      position: 'absolute',
      width: EDGE_WIDTH,
      zIndex: -1,
      '$nest': {
        svg: {
          display: 'block',
          overflow: 'visible',
          position: 'absolute',
        }
      }
    },
    edgeCanvasReverse: {
      marginLeft: 0,
      transform: 'translateX(-100%)',
    },
  });

  const lastNode = reverseEdges ? 'y1' : 'y4';
  const lastNodePositions = {
    y1: 0,
    y4: 0,
  };

  const edgeLines: JSX.Element[] = [];
  cardArray.forEach((rows, i) => {
    for (let j = 0; j < rows; j++) {
      const {y1, y4} = lastNodePositions;
      edgeLines.push(
        <LineChart
          key={`${i}-${j}`}
          data={[
            {x: 0, y: y1},
            {x: 30, y: y1},
            {x: EDGE_WIDTH - 30, y: y4},
            {x: EDGE_WIDTH, y: y4},
          ]}
          areaVisible={false}
          axisVisible={false}
          gridVisible={false}
          labelsVisible={false}
          pathColor={'#BDC1C6'}
          pathVisible={true}
          pathWidth={1}
          pathOpacity={1}
          pointsVisible={false}
          viewBoxHeight={viewHeight}
          viewBoxWidth={EDGE_WIDTH}
          pathSmoothing={0}
        />
      );
      viewHeight += cardBodyHeight;
      lastNodePositions[lastNode] += cardBodyHeight;
    }
    viewHeight += cardOffset;
    lastNodePositions[lastNode] += cardOffset;
  });

  const edgeCanvasClasses = classes(css.edgeCanvas, reverseEdges ? css.edgeCanvasReverse: '');
  return  <div className={edgeCanvasClasses}>{edgeLines}</div>
};
