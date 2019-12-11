import * as React from 'react';
import LineChart from 'react-svg-line-chart';
import {classes, stylesheet} from 'typestyle';
import {CARD_SPACER_HEIGHT, px} from './LineageCss';
import './LineChart.d.ts';
import {CARD_TITLE_HEIGHT} from "./LineageCard";
import {CardDetails} from "./LineageCardColumn";

interface EdgeCanvasProps {
  // An array describing the shape of the column of cards, where each number represents a card, and
  // its represents the number of rows in the card.
  cards: CardDetails[];

  // If true edges are drawn from right to left.
  reverseEdges: boolean;

  cardWidth: number;
  edgeWidth: number;
}

/**
 * Canvas that draws the lines connecting the edges of a list of vertically stacked cards in one
 * <LineageCardColumn /> to the topmost <LineageCard /> in an adjacent <LineageCardColumn />.
 *
 * The adjacent column is assumed to be to right of the connecting cards unless `reverseEdges`
 * is set to true.
 */
export const EdgeCanvas: React.FC<EdgeCanvasProps> = (props) => {
  const {cards, cardWidth, edgeWidth, reverseEdges} = props;

  let viewHeight = 1;

  const cardBodyHeight = 66;
  const cardContainerBorders = 2;
  const cardOffset = CARD_SPACER_HEIGHT + CARD_TITLE_HEIGHT + cardContainerBorders;

  const css = stylesheet({
    edgeCanvas: {
      border: 0,
      display: 'block',
      marginLeft: px(cardWidth),
      marginTop: px(CARD_TITLE_HEIGHT + cardBodyHeight / 2),
      overflow: 'visible',
      position: 'absolute',
      width: edgeWidth,
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
  cards.forEach((card, i) => {
    for (let j = 0; j < card.elements.length; j++) {
      const element = card.elements[j];
      if (!element.next) {
        continue;
      }
      const {y1, y4} = lastNodePositions;
      edgeLines.push(
        <LineChart
          key={`${i}-${j}`}
          data={[
            {x: 0, y: y1},
            {x: 30, y: y1},
            {x: edgeWidth - 30, y: y4},
            {x: edgeWidth, y: y4},
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
          viewBoxWidth={edgeWidth}
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
