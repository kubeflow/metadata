import * as React from 'react';
import './LineageCard.css';
import {LineageCardRow, LineageCardRowProps} from './LineageCardRow';
import {LineageRow, LineageCardType} from './LineageTypes';

interface LineageCardProps {
  title: string;
  type: LineageCardType;
  rows: LineageRow[];
  addSpacer: boolean;
  isTarget?: boolean;
  onArtifactCardClicked?(id: string): void
}

export class LineageCard extends React.Component<LineageCardProps> {
  public render(): JSX.Element {
    const {title, type, rows, addSpacer, isTarget} = this.props;

    const listCardRows = () => rows.map((r, i) => {
        const rowProps: LineageCardRowProps = {
          title: r.title,
          description: r.desc,
          leftAffordance: !!r.prev,
          rightAffordance: !!r.next,
          isLastRow: i === rows.length - 1,
          hideRadio: type === 'execution' || !!isTarget
        };
        const {onArtifactCardClicked} = this.props;
        if (onArtifactCardClicked) {
          rowProps.onArtifactCardClicked = onArtifactCardClicked
        }
        return React.createElement(LineageCardRow, rowProps);
      }
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
