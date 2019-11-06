import * as React from 'react';
import './LineageCard.css';
import {CardRow} from './LineageCardRow';
import {LineageRow, LineageCardType} from './LineageTypes';

interface LineageCardProps {
  title: string;
  type: LineageCardType;
  rows: LineageRow[];
  addSpacer: boolean;
  isTarget?: boolean;
}

export class LineageCard extends React.Component<LineageCardProps> {
  public render(): JSX.Element {
    const {title, type, rows, addSpacer, isTarget} = this.props;

    const listCardRows = () => rows.map((r, i) => 
      <CardRow
        key={i}
        artiName={r.title}
        artiDescription={r.desc}
        leftAffordance={false}
        rightAffordance={true}
        lastRowState={i === rows.length-1}
        hideRadio={false}
      />
    );

    return (
      <div className={`cardContainer ${type}${addSpacer ? ' addSpacer' : ''}${isTarget ? ' target':''}`}>
        <div className='cardTitle'>
          <h3>{title}</h3>
        </div>

        <div className='cardBody'>{listCardRows()}</div>
      </div>
    );
  }
}
