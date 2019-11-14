import * as React from 'react';
import grey from '@material-ui/core/colors/grey';
import Button from "@material-ui/core/Button";
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import ReplayIcon from '@material-ui/icons/Replay';
import {classes, stylesheet} from "typestyle";
import {color, commonCss, fonts, padding} from "../Css";

const baseBreadcrumb = {
    fontFamily: fonts.secondary,
    fontWeight: 500,
};

const actionBarCss = stylesheet({
    actionButton: {
        color: color.strong
    },
    breadcrumbInactive: {
        color: color.grey,
        ...baseBreadcrumb,
        $nest: {
            '&:hover': {
                cursor: 'pointer',
                textDecoration: 'underline',
            }
        }
    },
    breadcrumbActive: {
        color: color.strong,
        ...baseBreadcrumb
    },
    breadcrumbSeparator: {
        color: grey[400],
    },
    container: {
        borderBottom: '1px solid ' + color.separator,
        height: '48px',
        justifyContent: 'space-between',
    },
});

interface LineageActionBarProps {
    root: string
}

interface LineageActionBarState {
    history: string[]
}

/** Shows the current navigation history and actions available to the Lineage Explorer. */
export class LineageActionBar extends React.Component<LineageActionBarProps, LineageActionBarState> {
    constructor(props: LineageActionBarProps) {
        super(props);
        this.reset = this.reset.bind(this);
        this.pushHistory = this.pushHistory.bind(this);
        this.state = {
            history: []
        }
    }

    public pushHistory(id: string) {
        console.log(`LineageActionBar: new history item ${id}`);
        this.setState({
            history: [...this.state.history, id]
        })
    }

    public render() {
        const {root} = this.props;
        const historyItems = [root, ...this.state.history];
        const breadcrumbLinks: JSX.Element[] = historyItems.map((id, index) => {
            const isActive = index === historyItems.length - 1;
            return <span className={classes(isActive ? actionBarCss.breadcrumbActive : actionBarCss.breadcrumbInactive)}>
                {id}
            </span>
        });
        const newBread = this.reactElementJoin(breadcrumbLinks, (
          <div className={classes(commonCss.flex)}>
              <ArrowRightAltIcon className={classes(actionBarCss.breadcrumbSeparator, padding(10, 'lr'))}>Reset</ArrowRightAltIcon>
          </div>
        ));
        return (
          <div
            className={classes(actionBarCss.container, padding(25, 'lr'), commonCss.flex)}>
              <div className={classes(commonCss.flex)}>{newBread}</div>
              <div>
                  <Button
                    className={classes(actionBarCss.actionButton)}
                    disabled={false}
                    onClick={this.reset}
                  >
                      <ReplayIcon/> Reset
                  </Button>
              </div>
          </div>
        );
    }

    private reset() {
        this.setState({
            history: []
        })
    }

    private reactElementJoin(elements: JSX.Element[], separator: JSX.Element): JSX.Element[] {
        if (elements.length <= 1) {
            return elements
        }

        const joinedElements: JSX.Element[] = [];
        elements.forEach((element, index) => {
            joinedElements.push(element);
            const isLast = index === elements.length - 1;
            if (!isLast) {
                joinedElements.push(separator);
            }
        });
        return joinedElements;
    }
}