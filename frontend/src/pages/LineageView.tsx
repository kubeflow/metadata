/*
 * Copyright 2019 Google LLC
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
// tslint:disable: object-literal-sort-keys

import * as React from 'react';
import {classes} from 'typestyle';
import {commonCss} from '../Css';
import {Api} from '../lib/Api';
import {LineageCardColumn, CardDetails} from '../components/LineageCardColumn';
import {LineageActionBar} from '../components/LineageActionBar';
import {Artifact, Event, Execution} from '../generated/src/apis/metadata/metadata_store_pb';
import {RefObject} from 'react';
import {
  GetArtifactsByIDRequest,
  GetEventsByArtifactIDsRequest,
  GetEventsByExecutionIDsRequest,
  GetExecutionsByIDRequest
} from '../generated/src/apis/metadata/metadata_store_service_pb';
import {
  MetadataStoreServicePromiseClient
} from '../generated/src/apis/metadata/metadata_store_service_grpc_web_pb';

const isInputEvent = (event: Event) =>
  [Event.Type.INPUT.valueOf(), Event.Type.DECLARED_INPUT.valueOf()].includes(event.getType());
const isOutputEvent = (event: Event) =>
  [Event.Type.OUTPUT.valueOf(), Event.Type.DECLARED_OUTPUT.valueOf()].includes(event.getType());

/** Default size used when cardWidth prop is unset. */
const DEFAULT_CARD_WIDTH = 260;

/** Default size used when edgeWidth prop is unset. */
const DEFAULT_EDGE_WIDTH = 120;

export interface LineageViewProps {
  target: Artifact;
  cardWidth?: number;
  edgeWidth?: number;
}

interface LineageViewState {
  columnNames: string[];
  columnTypes: string[];
  inputArtifacts: Artifact[];
  inputExecutions: Execution[];
  target: Artifact;
  outputExecutions: Execution[];
  outputArtifacts: Artifact[];
}

class LineageView extends React.Component<LineageViewProps, LineageViewState> {
  private readonly actionBarRef: React.Ref<LineageActionBar>;
  private readonly metadataStoreService: MetadataStoreServicePromiseClient;

  constructor(props: any) {
    super(props);
    this.metadataStoreService = Api.getInstance().metadataStoreService;
    this.actionBarRef = React.createRef<LineageActionBar>();
    this.state = {
      columnNames: ['Input Artifact', '', 'Target', '', 'Output Artifact'],
      columnTypes: ['ipa', 'ipx', 'target', 'opx', 'opa'],
      target: props.target,
      inputArtifacts: [],
      inputExecutions: [],
      outputExecutions: [],
      outputArtifacts: [],
    };
    this.loadData = this.loadData.bind(this);
    this.setTargetFromActionBar = this.setTargetFromActionBar.bind(this);
    this.setTargetFromLineageCard = this.setTargetFromLineageCard.bind(this);
    this.loadData(this.props.target.getId());
  }

  public render(): JSX.Element {
    const {columnNames} = this.state;
    const cardWidth = this.props.cardWidth || DEFAULT_CARD_WIDTH;
    const edgeWidth = this.props.edgeWidth || DEFAULT_EDGE_WIDTH;
    return (
      <div className={classes(commonCss.page)}>
        <LineageActionBar ref={this.actionBarRef} initialTarget={this.props.target} setLineageViewTarget={this.setTargetFromActionBar} />
        <div className={classes(commonCss.page, 'LineageExplorer')} style={{flexFlow: 'row', overflow: 'auto', width: '100%', position: 'relative', background: '#f3f2f4', zIndex: 0}}>
          <LineageCardColumn
            type='artifact'
            cards={this.buildArtifactCards(this.state.inputArtifacts)}
            title={`${columnNames[0]}`}
            cardWidth={cardWidth}
            edgeWidth={edgeWidth}
            setLineageViewTarget={this.setTargetFromLineageCard}
          />
          <LineageCardColumn
            type='execution'
            cards={this.buildExecutionCards(this.state.inputExecutions)}
            cardWidth={cardWidth}
            edgeWidth={edgeWidth}
            title={`${columnNames[1]}`} />
          <LineageCardColumn
            type='artifact'
            cards={this.buildArtifactCards([this.state.target])}
            cardWidth={cardWidth}
            edgeWidth={edgeWidth}
            title={`${columnNames[2]}`} />
          <LineageCardColumn
            type='execution'
            cards={this.buildExecutionCards(this.state.outputExecutions)}
            cardWidth={cardWidth}
            edgeWidth={edgeWidth}
            title={`${columnNames[3]}`} />
          <LineageCardColumn
            type='artifact'
            cards={this.buildArtifactCards(this.state.outputArtifacts)}
            reverseBindings={true}
            cardWidth={cardWidth}
            edgeWidth={edgeWidth}
            title={`${columnNames[4]}`}
            setLineageViewTarget={this.setTargetFromLineageCard}
          />
        </div>
      </div>
    );
  }

  private buildArtifactCards(artifacts: Artifact[]): CardDetails[] {
    return [
      {
        title: 'Artifact',
        elements: artifacts.map((artifact) => ({
            resource: artifact,
            prev: true,
            next: true
          })
        )
      }
    ];
  }

  private buildExecutionCards(executions: Execution[]): CardDetails[] {
    return [
      {
        title: 'Execution',
        elements: executions.map((execution) => ({
            resource: execution,
            prev: true,
            next: true
          })
        )
      }
    ];
  }

  private async loadData(targetId: number): Promise<string> {
    const getEventsByArtifactIDsRequest = new GetEventsByArtifactIDsRequest();
    getEventsByArtifactIDsRequest.addArtifactIds(targetId);

    const getEventsByArtifactIDsResponse =
      await this.metadataStoreService.getEventsByArtifactIDs(getEventsByArtifactIDsRequest);

    const outputExecutionIds: number[] = [];
    const inputExecutionIds: number[] = [];

    for (const event of getEventsByArtifactIDsResponse.getEventsList()) {
      const executionId = event.getExecutionId();

      if (isOutputEvent(event)) {
        // The input executions column will show executions where the target
        // was an output of the execution.
        inputExecutionIds.push(executionId)
      } else if (isInputEvent(event)) {
        // The output executions column will show executions where the target
        // was an input for the execution.
        outputExecutionIds.push(executionId)
      }
    }

    const [outputExecutions, inputExecutions] = await Promise.all([
      this.getExecutions(outputExecutionIds),
      this.getExecutions(inputExecutionIds),
    ]);

    // Build the list of input execution events.
    const getInputExecutionEvents = new GetEventsByExecutionIDsRequest();
    getInputExecutionEvents.setExecutionIdsList(inputExecutionIds);
    const getInputExecutionEventsResponse =
      await this.metadataStoreService.getEventsByExecutionIDs(getInputExecutionEvents);

    // Build the list of input artifacts for the input execution
    const inputExecutionInputArtifactIds =
      getInputExecutionEventsResponse
        .getEventsList()
        .filter(isInputEvent)
        .map((event) => event.getArtifactId());
    const inputArtifacts = await this.getArtifacts(inputExecutionInputArtifactIds);

    // Build the list of output execution artifacts.
    const getOutputExecutionEventsRequest = new GetEventsByExecutionIDsRequest();
    getOutputExecutionEventsRequest.setExecutionIdsList(outputExecutionIds);
    const getOutputExecutionEventsResponse =
      await this.metadataStoreService.getEventsByExecutionIDs(getOutputExecutionEventsRequest);

    // Build the list of output artifacts for the output execution
    const outputExecutionOutputArtifactIds =
      getOutputExecutionEventsResponse
        .getEventsList()
        .filter(isOutputEvent)
        .map((event) => event.getArtifactId());
    const outputArtifacts = await this.getArtifacts(outputExecutionOutputArtifactIds);

    this.setState({
      inputArtifacts, inputExecutions, outputArtifacts, outputExecutions,
    });
    return ''
  }

  // Updates the view and action bar when the target is set from a lineage card.
  private setTargetFromLineageCard(target: Artifact): void {
    const actionBarRefObject = this.actionBarRef as RefObject<LineageActionBar>;
    if (!actionBarRefObject.current) {return;}

    actionBarRefObject.current.pushHistory(target);
    this.target = target;
  }

  // Updates the view when the target is changed from the action bar.
  private setTargetFromActionBar(target: Artifact): void {
    this.target = target;
  }

  private set target(target: Artifact) {
    this.setState({
      target,
    });
    this.loadData(target.getId())
  }

  private async getExecutions(executionIds: number[]): Promise<Execution[]> {
    const request = new GetExecutionsByIDRequest();
    request.setExecutionIdsList(executionIds);

    const response = await this.metadataStoreService.getExecutionsByID(request);
    return response.getExecutionsList();
  }

  private async getArtifacts(artifactIds: number[]): Promise<Artifact[]> {
    const request = new GetArtifactsByIDRequest();
    request.setArtifactIdsList(artifactIds);

    const response = await this.metadataStoreService.getArtifactsByID(request);
    return response.getArtifactsList();
  }
}

export default LineageView;
