import * as React from 'react';
import './LineageCard.css';
import {LineageCardRow} from './LineageCardRow';
import {LineageRow, LineageCardType} from './LineageTypes';
import {Artifact} from "../generated/src/apis/metadata/metadata_store_pb";

interface LineageCardProps {
  title: string;
  type: LineageCardType;
  rows: LineageRow[];
  addSpacer: boolean;
  isTarget?: boolean;
  setLineageViewTarget?(artifact: Artifact): void
}

export class LineageCard extends React.Component<LineageCardProps> {
  public render(): JSX.Element {
    const {title, type, rows, addSpacer, isTarget, setLineageViewTarget} = this.props;

    const listCardRows = () => rows.map((r, i) =>
      <LineageCardRow
        key={i}
        artifact={r.artifact}
        title={r.title}
        description={r.desc}
        leftAffordance={!!r.prev}
        rightAffordance={!!r.next}
        isLastRow={i === rows.length-1}
        hideRadio={type === 'execution' || !!isTarget}
        setLineageViewTarget={setLineageViewTarget}
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
