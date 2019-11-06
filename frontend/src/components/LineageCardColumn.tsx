import React from 'react';
import {LineageCardType, LineageRow} from './LineageTypes';

import {LineageCard} from './LineageCard';
import {EdgeCanvas} from './EdgeCanvas';
import './LineageCardColumn.css';

// Todo: Replace this with the actual interface / class used by the APIs
export interface CardDetails {
  title: string;
  elements: LineageRow[];
}

export interface LineageCardColumnProps {
  type: LineageCardType;
  title: string;
  cards: CardDetails[];
}

export class LineageCardColumn extends React.Component<LineageCardColumnProps> {
  public render(): JSX.Element | null {
    const {type, title} = this.props;

    return (
      <div className={`mainColumn ${type}`}>
        <div className='columnHeader'>
          <h2>{title}</h2>
        </div>
        <div className='columnBody'>
          {this.drawColumns()}
        </div>
      </div>
    );
  }
  private jsxFromCardDetails(det: CardDetails, i: number): JSX.Element {
    const isNotFirstEl = i > 0;
    return <LineageCard
      title={det.title}
      type={this.props.type}
      addSpacer={isNotFirstEl}
      rows={det.elements}
      isTarget={/Target/i.test(this.props.title)} />;
  }
  private drawColumns(): JSX.Element {
    const {type, cards} = this.props;
    const cardSkeleton = cards.map(c => c.elements.length);

    return <div>
      <EdgeCanvas
        type={type}
        cardArray={cardSkeleton}
        reverseEdges={false} />
      {cards.map(this.jsxFromCardDetails)}
    </div>;
  }
}
