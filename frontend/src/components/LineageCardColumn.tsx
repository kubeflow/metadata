import grey from '@material-ui/core/colors/grey';
import React from 'react';
import {classes, stylesheet} from 'typestyle';
import {Artifact} from '../generated/src/apis/metadata/metadata_store_pb';
import {LineageCard} from './LineageCard';
import {px} from './LineageCss';
import {LineageCardType, LineageRow} from './LineageTypes';
import {EdgeCanvas} from './EdgeCanvas';

export interface CardDetails {
  title: string;
  elements: LineageRow[];
}

export interface LineageCardColumnProps {
  type: LineageCardType;
  title: string;
  cards: CardDetails[];
  cardWidth: number;
  edgeWidth: number;
  reverseBindings?: boolean;
  skipEdgeCanvas?: boolean;
  setLineageViewTarget?(artifact: Artifact): void
}

export class LineageCardColumn extends React.Component<LineageCardColumnProps> {
  public render(): JSX.Element | null {
    const {cardWidth, edgeWidth, type, title} = this.props;

    const css = stylesheet({
      mainColumn: {
        display: 'inline-block',
        justifyContent: 'center',
        minHeight: '100%',
        padding: `0 ${edgeWidth  / 2}px`,
        width: px(cardWidth),
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
        width: px(cardWidth),
      },
      columnHeader: {
        height: '40px',
        margin: '10px 0px',
        textAlign: 'left',
        width: px(cardWidth),
      }
    });

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
      cardWidth={this.props.cardWidth}
      title={det.title}
      type={this.props.type}
      addSpacer={isNotFirstEl}
      rows={det.elements}
      isTarget={/Target/i.test(this.props.title)}
      setLineageViewTarget={this.props.setLineageViewTarget}
    />;
  }
  private drawColumnContent(): JSX.Element {
    const {cards, cardWidth, edgeWidth, skipEdgeCanvas} = this.props;

    return <React.Fragment>
      {
        skipEdgeCanvas ? null :
          <EdgeCanvas
            cards={cards}
            cardWidth={cardWidth}
            edgeWidth={edgeWidth}
            reverseEdges={!!this.props.reverseBindings}
          />
      }
      {cards.map(this.jsxFromCardDetails.bind(this))}
    </React.Fragment>;
  }
}
