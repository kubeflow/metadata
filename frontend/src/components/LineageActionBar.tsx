import * as React from 'react';
import Button from "@material-ui/core/Button";
import ReplayIcon from '@material-ui/icons/Replay';
import {classes, stylesheet} from "typestyle";
import {color, commonCss, fonts, padding} from "../Css";

const actionBarCss = stylesheet({
    actionButton: {
        color: color.strong
    },
    breadcrumb: {
        color: color.strong,
        fontFamily: fonts.secondary,
        fontWeight: 500
    },
    container: {
        borderBottom: '1px solid ' + color.separator,
        height: '48px',
        justifyContent: 'space-between',
    }
});

interface LineageActionBarProps {
    root: string
}

/** Shows the current navigation history and actions available to the Lineage Explorer. */
export const LineageActionBar: React.FC<LineageActionBarProps> = ({root}) => {
    return (
        <div className={classes(actionBarCss.container, padding(25, 'lr'), commonCss.flex)}>
            <div>
                <span className={classes(actionBarCss.breadcrumb)}>{root}</span>
            </div>
            <div>
                <Button className={classes(actionBarCss.actionButton)} disabled={false}>
                    <ReplayIcon /> Reset
                </Button>
            </div>
        </div>
    );
};