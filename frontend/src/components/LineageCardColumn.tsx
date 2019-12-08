import React from 'react';
import {classes, stylesheet} from 'typestyle';
import {px} from '../Css';
import {Artifact} from '../generated/src/apis/metadata/metadata_store_pb';
import {LineageCard} from './LineageCard';
import {LineageCardType, LineageRow} from './LineageTypes';
import {EdgeCanvas} from './EdgeCanvas';
import grey from '@material-ui/core/colors/grey';
import {CARD_WIDTH, EDGE_WIDTH} from './LineageCss';

const css = stylesheet({
  mainColumn: {
    display: 'inline-block',
    justifyContent: 'center',
    minHeight: '100%',
    padding: `0 ${EDGE_WIDTH  / 2}px`,
    width: px(CARD_WIDTH),
    $nest: {
      h2: {
        color: grey[600],
        fontFamily: 'PublicSans-Regular',
        fontSize: '12px',
        letterSpacing: '0.5px',
        lineHeight: '40px',
        textAlign: 'left',
        textTransform: 'capitalize'
      }
    }
  },
  columnBody: {
    width: px(CARD_WIDTH),
  },
  columnHeader: {
    height: '40px',
    margin: '10px 0px',
    textAlign: 'left',
    width: px(CARD_WIDTH),
  }
});

// Todo: Replace this with the actual interface / class used by the APIs
export interface CardDetails {
  title: string;
  elements: LineageRow[];
}

export interface LineageCardColumnProps {
  type: LineageCardType;
  title: string;
  cards: CardDetails[];
  reverseBindings?: boolean;
  setLineageViewTarget?(artifact: Artifact): void
}

export class LineageCardColumn extends React.Component<LineageCardColumnProps> {
  public render(): JSX.Element | null {
    const {type, title} = this.props;

    return (
      <div className={classes(css.mainColumn, type)}>
        <div className={classes(css.columnHeader)}>
          <h2>{title}</h2>
        </div>
        <div className={classes(css.columnBody)}>
          {this.drawColumnContent()}
        </div>
      </div>
    );
  }
  private jsxFromCardDetails(det: CardDetails, i: number): JSX.Element {
    const isNotFirstEl = i > 0;
    return <LineageCard
      key={i}
      title={det.title}
      type={this.props.type}
      addSpacer={isNotFirstEl}
      rows={det.elements}
      isTarget={/Target/i.test(this.props.title)}
      setLineageViewTarget={this.props.setLineageViewTarget}
    />;
  }
  private drawColumnContent(): JSX.Element {
    const {type, cards} = this.props;
    const cardSkeleton = cards.map(c => c.elements.length);

    return <React.Fragment>
      <EdgeCanvas
        type={type}
        cardArray={cardSkeleton}
        reverseEdges={!!this.props.reverseBindings} />
      {cards.map(this.jsxFromCardDetails.bind(this))}
    </React.Fragment>;
  }
}
