import * as React from 'react';
import {blue, grey} from '@material-ui/core/colors';
import {LineageCardRow} from './LineageCardRow';
import {LineageRow, LineageCardType} from './LineageTypes';
import {Artifact} from "../generated/src/apis/metadata/metadata_store_pb";
import {classes, stylesheet} from "typestyle";
import {px} from '../Css';
import {CSSProperties} from "typestyle/lib/types";
import {CARD_WIDTH} from "./LineageCss";

const CARD_RADIUS = 6;

const cardTitleBase: CSSProperties = {
  borderTopLeftRadius: '4px',
  borderTopRightRadius: '4px',
  height: '40px',
};

const css = stylesheet({
  addSpacer: {
    marginTop: '24px',
  },
  cardContainer: {
    background: 'white',
    border: `1px solid ${grey[300]}`,
    borderRadius: px(CARD_RADIUS),
    width: px(CARD_WIDTH),
    $nest: {
      h3: {
        color: blue[600],
        fontFamily: 'PublicSans-Medium',
        fontSize: '10px',
        letterSpacing: '0.8px',
        lineHeight: '42px',
        paddingLeft: '20px',
        textAlign: 'left',
        textTransform: 'uppercase',
      }
    }
  },
  cardTitle: {
    ...cardTitleBase,
    borderBottom: `1px solid ${grey[200]}`,
  },
  execution: {
    borderRadius: px(CARD_RADIUS),
    background: '#F8FBFF',
    border: '1px solid #CCE4FF',
  },
  executionCardTitle: {
    ...cardTitleBase,
    borderBottom: '1px solid transparent',
  },
  target: {
    border: `2px solid ${blue[500]}`,
  }
});

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
    const isExecution = type === 'execution';

    const listCardRows = () => rows.map((r, i) =>
      <LineageCardRow
        key={i}
        resource={r.resource}
        leftAffordance={!!r.prev}
        rightAffordance={!!r.next}
        isLastRow={i === rows.length-1}
        hideRadio={isExecution || !!isTarget}
        setLineageViewTarget={setLineageViewTarget}
      />
    );

    const cardContainerClasses =
      classes(
        css.cardContainer,
        css[type], // css.execution
        addSpacer ? css.addSpacer : '',
        isTarget ? css.target : ''
      );

    return (
      <div className={cardContainerClasses}>
        <div className={classes(isExecution ? css.executionCardTitle : css.cardTitle)}>
          <h3>{title}</h3>
        </div>
        <div className='cardBody'>{listCardRows()}</div>
      </div>
    );
  }
}
