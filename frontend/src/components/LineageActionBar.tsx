import * as React from 'react';
import grey from '@material-ui/core/colors/grey';
import Button from "@material-ui/core/Button";
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import ReplayIcon from '@material-ui/icons/Replay';
import {classes, stylesheet} from "typestyle";
import {color, commonCss, fonts, padding} from "../Css";
import {CSSProperties} from "typestyle/lib/types";
import {Artifact} from "../generated/src/apis/metadata/metadata_store_pb";
import {getResourceProperty} from "../lib/Utils";
import {ArtifactProperties} from "../lib/Api";

const baseLinkButton: CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    display: "inline",
    margin: 0,
    padding: 0,
};

const baseBreadcrumb = {
    ...baseLinkButton,
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
                textDecoration: 'underline',
            }
        }
    },
    breadcrumbActive: {
        color: color.strong,
        ...baseBreadcrumb,
        $nest: {
            '&:hover': {
                cursor: 'default',
            }
        }
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
    initialTarget?: Artifact
    setLineageViewTarget(artifact: Artifact): void
}

interface LineageActionBarState {
    history: Artifact[]
}

/** Shows the current navigation history and actions available to the Lineage Explorer. */
export class LineageActionBar extends React.Component<LineageActionBarProps, LineageActionBarState> {
    constructor(props: LineageActionBarProps) {
        super(props);
        this.reset = this.reset.bind(this);
        this.pushHistory = this.pushHistory.bind(this);
        this.state = {
            history: []
        };
        if (this.props.initialTarget) {
            this.state.history.push(this.props.initialTarget)
        }
    }

    public pushHistory(artifact: Artifact) {
        this.setState({
            history: [...this.state.history, artifact]
        })
    }

    public render() {
        const breadcrumbLinks: JSX.Element[] = this.state.history.map((artifact: Artifact, index) => {
            const isActive = index === this.state.history.length - 1;
            const onBreadcrumbClicked = () => {
                this.sliceHistory(index);
            };
            return (
              <button
                key={index}
                className={classes(isActive ? actionBarCss.breadcrumbActive : actionBarCss.breadcrumbInactive)}
                onClick={onBreadcrumbClicked}
              >
                  {getResourceProperty(artifact, ArtifactProperties.NAME)}
              </button>
            )
        });
        const newBread = this.reactElementJoin(breadcrumbLinks, (
          <div className={classes(commonCss.flex)}>
              <ArrowRightAltIcon
                className={classes(actionBarCss.breadcrumbSeparator, padding(10, 'lr'))}
                onClick={this.reset}
              >
                  Reset
              </ArrowRightAltIcon>
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

    private sliceHistory(index: number): void {
        const history = this.state.history.slice(0, index + 1);
        const targetArtifact = history[index];
        const onHistoryChanged = this.props.setLineageViewTarget.bind(this, targetArtifact);
        this.setState({
            history,
        }, onHistoryChanged)
    }

    private reset() {
        this.sliceHistory(0);
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