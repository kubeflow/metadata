/*
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import ArtifactList from '../pages/ArtifactList';
import ArtifactDetails from '../pages/ArtifactDetails';
import Banner, {BannerProps} from '../components/Banner';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Page404 from '../pages/404';
import ExecutionList from '../pages/ExecutionList';
import SideNav from '../pages/SideNav';
import ExecutionDetails from '../pages/ExecutionDetails';
import Snackbar, {SnackbarProps} from '@material-ui/core/Snackbar';
import Toolbar, {ToolbarProps} from './Toolbar';
import {Route, Switch, Redirect, HashRouter} from 'react-router-dom';
import {classes, stylesheet} from 'typestyle';
import {commonCss} from '../Css';


// tslint:disable: variable-name
export type RouteConfig = {
  path: string;
  Component: React.ComponentType<any>;
  view?: any;
  notExact?: boolean;
};

const css = stylesheet({
  dialog: {
    minWidth: 250,
  },
});

export enum RouteParams {
  ARTIFACT_TYPE = 'artifactType',
  EXECUTION_TYPE = 'executionType',
  // TODO: create one of these for artifact and execution?
  ID = 'id',
}

export const RoutePrefix = {
  ARTIFACT: '/artifact',
  EXECUTION: '/execution',
};

export const RoutePage = {
  ARTIFACTS: '/artifacts',
  ARTIFACT_DETAILS: `/artifact_types/:${RouteParams.ARTIFACT_TYPE}+/artifacts/:${RouteParams.ID}`,
  EXECUTIONS: '/executions',
  EXECUTION_DETAILS: `/execution_types/:${RouteParams.EXECUTION_TYPE}+/executions/:${RouteParams.ID}`,
};

export const RoutePageFactory = {
  artifactDetails: (artifactType: string, artifactId: number) => {
    return RoutePage.ARTIFACT_DETAILS.replace(
      `:${RouteParams.ARTIFACT_TYPE}+`,
      artifactType,
    ).replace(`:${RouteParams.ID}`, '' + artifactId);
  },
};

export const ExternalLinks = {
  AI_HUB: 'https://aihub.cloud.google.com/u/0/s?category=pipeline',
  DOCUMENTATION: 'https://www.kubeflow.org/docs/pipelines/',
  GITHUB: 'https://github.com/kubeflow/pipelines',
};

export interface DialogProps {
  buttons?: Array<{onClick?: () => any; text: string}>;
  // TODO: This should be generalized to any react component.
  content?: string;
  onClose?: () => any;
  open?: boolean;
  title?: string;
}

interface RouteComponentState {
  bannerProps: BannerProps;
  dialogProps: DialogProps;
  snackbarProps: SnackbarProps;
  toolbarProps: ToolbarProps;
}

export interface RouterProps {
  configs?: RouteConfig[]; // only used in tests
}

const DEFAULT_ROUTE = RoutePage.ARTIFACTS;

// This component is made as a wrapper to separate toolbar state for different pages.
const Router: React.FC<RouterProps> = ({configs}) => {
  const routes: RouteConfig[] = configs || [
    {path: RoutePage.ARTIFACTS, Component: ArtifactList},
    {path: RoutePage.ARTIFACT_DETAILS, Component: ArtifactDetails, notExact: true},
    {path: RoutePage.EXECUTIONS, Component: ExecutionList},
    {path: RoutePage.EXECUTION_DETAILS, Component: ExecutionDetails},
  ];

  return (
    // There will be only one instance of SideNav, throughout UI usage.
    <SideNavLayout>
      <Switch>
        <Route
          exact={true}
          path={'/'}
          render={({ ...props }) => <Redirect to={DEFAULT_ROUTE} {...props} />}
        />

        {/* Normal routes */}
        {routes.map((route, i) => {
          const { path } = { ...route };
          return (
            // Setting a key here, so that two different routes are considered two instances from
            // react. Therefore, they don't share toolbar state. This avoids many bugs like dangling
            // network response handlers.
            <Route
              key={i}
              exact={!route.notExact}
              path={path}
              render={props => <RoutedPage key={props.location.key} route={route} />}
            />
          );
        })}

        {/* 404 */}
        {
          <Route>
            <RoutedPage />
          </Route>
        }
      </Switch>
    </SideNavLayout>
  );
};

class RoutedPage extends React.Component<{route?: RouteConfig}, RouteComponentState> {
  constructor(props: any) {
    super(props);
    this.state = {
      bannerProps: {},
      dialogProps: {open: false},
      snackbarProps: {autoHideDuration: 5000, open: false},
      toolbarProps: {breadcrumbs: [{displayName: '', href: ''}], actions: [], ...props},
    };
  }

  public render(): JSX.Element {
    const childProps = {
      toolbarProps: this.state.toolbarProps,
      updateBanner: this._updateBanner.bind(this),
      updateDialog: this._updateDialog.bind(this),
      updateSnackbar: this._updateSnackbar.bind(this),
      updateToolbar: this._updateToolbar.bind(this),
    };
    const route = this.props.route;

    return (
      <div className={classes(commonCss.page)}>
        <Route render={({...props}) => <Toolbar {...this.state.toolbarProps} {...props} />} />
        {this.state.bannerProps.message && (
          <Banner
            message={this.state.bannerProps.message}
            mode={this.state.bannerProps.mode}
            additionalInfo={this.state.bannerProps.additionalInfo}
            refresh={this.state.bannerProps.refresh}
          />
        )}
        <Switch>
          {route &&
            (() => {
              const { path, Component, ...otherProps } = { ...route };
              return (
                <Route
                  exact={!route.notExact}
                  path={path}
                  render={({ ...props }) => (
                    <Component {...props} {...childProps} {...otherProps} />
                  )}
                />
              );
            })()}

          {/* 404 */}
          {!!route && <Route render={({...props}) => <Page404 {...props} {...childProps} />} />}
        </Switch>

        <Snackbar
          autoHideDuration={this.state.snackbarProps.autoHideDuration}
          message={this.state.snackbarProps.message}
          open={this.state.snackbarProps.open}
          onClose={this._handleSnackbarClose.bind(this)}
        />

        <Dialog
          open={this.state.dialogProps.open !== false}
          classes={{paper: css.dialog}}
          className='dialog'
          onClose={() => this._handleDialogClosed()}
        >
          {this.state.dialogProps.title && (
            <DialogTitle> {this.state.dialogProps.title}</DialogTitle>
          )}
          {this.state.dialogProps.content && (
            <DialogContent className={commonCss.prewrap}>
              {this.state.dialogProps.content}
            </DialogContent>
          )}
          {this.state.dialogProps.buttons && (
            <DialogActions>
              {this.state.dialogProps.buttons.map((b, i) => (
                <Button
                  key={i}
                  onClick={() => this._handleDialogClosed(b.onClick)}
                  className='dialogButton'
                  color='secondary'
                >
                  {b.text}
                </Button>
              ))}
            </DialogActions>
          )}
        </Dialog>
      </div>
    );
  }

  private _updateDialog(dialogProps: DialogProps): void {
    // Assuming components will want to open the dialog by defaut.
    if (dialogProps.open === undefined) {
      dialogProps.open = true;
    }
    this.setState({dialogProps});
  }

  private _handleDialogClosed(onClick?: () => void): void {
    this.setState({dialogProps: {open: false}});
    if (onClick) {
      onClick();
    }
    if (this.state.dialogProps.onClose) {
      this.state.dialogProps.onClose();
    }
  }

  private _updateToolbar(newToolbarProps: Partial<ToolbarProps>): void {
    const toolbarProps = Object.assign(this.state.toolbarProps, newToolbarProps);
    this.setState({toolbarProps});
  }

  private _updateBanner(bannerProps: BannerProps): void {
    this.setState({bannerProps});
  }

  private _updateSnackbar(snackbarProps: SnackbarProps): void {
    snackbarProps.autoHideDuration =
      snackbarProps.autoHideDuration || this.state.snackbarProps.autoHideDuration;
    this.setState({snackbarProps});
  }

  private _handleSnackbarClose(): void {
    this.setState({snackbarProps: {open: false, message: ''}});
  }
}

// TODO: loading/error experience until backend is reachable

export default Router;

const SideNavLayout: React.FC<{}> = ({children}) => (
  <HashRouter>
    <div className={commonCss.page}>
      <div className={commonCss.flexGrow}>
        <Route render={({...props}) => <SideNav page={props.location.pathname} {...props} />} />
        {children}
      </div>
    </div>
  </HashRouter>
);
