import {Artifact} from 'frontend';
import {blue, grey} from '@material-ui/core/colors';
import * as React from 'react';
import {classes, stylesheet} from 'typestyle';
import {CSSProperties} from 'typestyle/lib/types';
import {LineageCardRow} from './LineageCardRow';
import {LineageRow, LineageCardType} from './LineageTypes';
import {CARD_SPACER_HEIGHT, px} from './LineageCss';

const CARD_RADIUS = 6;
const CARD_TITLE_BASE_HEIGHT = 40;
const CARD_TITLE_BORDER_BOTTOM_HEIGHT = 1;
export const CARD_TITLE_HEIGHT = CARD_TITLE_BASE_HEIGHT + CARD_TITLE_BORDER_BOTTOM_HEIGHT;

const cardTitleBase: CSSProperties = {
  borderTopLeftRadius: '4px',
  borderTopRightRadius: '4px',
  height: px(CARD_TITLE_BASE_HEIGHT),
};

interface LineageCardProps {
  cardWidth: number,
  title: string;
  type: LineageCardType;
  rows: LineageRow[];
  addSpacer: boolean;
  isTarget?: boolean;
  setLineageViewTarget?(artifact: Artifact): void
}

export class LineageCard extends React.Component<LineageCardProps> {
  public render(): JSX.Element {
    const {cardWidth, title, type, rows, addSpacer, isTarget, setLineageViewTarget} = this.props;
    const isExecution = type === 'execution';

    const css = stylesheet({
      addSpacer: {
        marginTop: px(CARD_SPACER_HEIGHT),
      },
      cardContainer: {
        background: 'white',
        border: `1px solid ${grey[300]}`,
        borderRadius: px(CARD_RADIUS),
        width: px(cardWidth),
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
        borderBottom: `${px(CARD_TITLE_BORDER_BOTTOM_HEIGHT)} solid ${grey[200]}`,
      },
      execution: {
        borderRadius: px(CARD_RADIUS),
        background: '#F8FBFF',
        border: '1px solid #CCE4FF',
      },
      executionCardTitle: {
        ...cardTitleBase,
        borderBottom: `${px(CARD_TITLE_BORDER_BOTTOM_HEIGHT)} solid transparent`,
      },
      target: {
        border: `2px solid ${blue[500]}`,
      }
    });

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
