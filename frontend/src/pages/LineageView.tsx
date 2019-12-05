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
import {Api, ArtifactProperties, ExecutionProperties} from '../lib/Api';
import {LineageCardColumn, CardDetails} from '../components/LineageCardColumn';
import {LineageActionBar} from '../components/LineageActionBar';
import {
  Artifact, Event, Execution
} from '../generated/src/apis/metadata/metadata_store_pb';
import {getResourceProperty} from '../lib/Utils';
import {RefObject} from 'react';
import {
  GetArtifactsByIDRequest,
  GetEventsByArtifactIDsRequest, GetEventsByExecutionIDsRequest,
  GetExecutionsByIDRequest
} from '../generated/src/apis/metadata/metadata_store_service_pb';
import {MetadataStoreServicePromiseClient} from "../generated/src/apis/metadata/metadata_store_service_grpc_web_pb";

// https://github.com/google/ml-metadata/blob/master/ml_metadata/proto/metadata_store.proto#L108
// 1 = ml_metadata.Event.DECLARED_OUTPUT
// 2 = ml_metadata.Event.DECLARED_INPUT
// 3 = ml_metadata.Event.INPUT
// 4 = ml_metadata.Event.OUTPUT
const isInputEvent = (event: Event) => [2, 3].includes(event.getType());
const isOutputEvent = (event: Event) => [1, 4].includes(event.getType());

export interface LineageViewProps {
  target: Artifact;
}

interface LineageViewState {
  columnNames: string[];
  columnTypes: string[];
  // TODO: This will draw all input and output artifacts as coming out of "every
  //  Execution". Since there is only one right now (for the data I've seen),
  //  this is enough to get the RPCs hooked up with, but not enough to really
  //  build the correct data structure.
  inputArtifacts: Artifact[]
  inputExecutions: Execution[]
  target: Artifact;
  outputExecutions: Execution[]
  outputArtifacts: Artifact[]
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
    return (
      <div className={classes(commonCss.page)}>
        <LineageActionBar ref={this.actionBarRef} initialTarget={this.props.target} setLineageViewTarget={this.setTargetFromActionBar} />
        <div className={classes(commonCss.page, 'LineageExplorer')} style={{flexFlow: 'row', overflow: 'auto', width: '100%', position: 'relative', background: '#f3f2f4', zIndex: 0}}>
          <LineageCardColumn
            type='artifact'
            cards={this.buildArtifactCards(this.state.inputArtifacts)}
            title={`${columnNames[0]}`}
            setLineageViewTarget={this.setTargetFromLineageCard}
          />
          <LineageCardColumn
            type='execution'
            cards={this.buildExecutionCards(this.state.inputExecutions)}
            title={`${columnNames[1]}`} />
          <LineageCardColumn
            type='artifact'
            cards={this.buildArtifactCards([this.state.target])}
            title={`${columnNames[2]}`} />
          <LineageCardColumn
            type='execution'
            cards={this.buildExecutionCards(this.state.outputExecutions)}
            title={`${columnNames[3]}`} />
          <LineageCardColumn
            type='artifact'
            cards={this.buildArtifactCards(this.state.outputArtifacts)}
            reverseBindings={true}
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
            artifact,
            title: getResourceProperty(artifact, ArtifactProperties.NAME),
            desc: getResourceProperty(artifact, ArtifactProperties.DESCRIPTION),
            prev: true,
            next: true
          })
        )
      }
    ] as CardDetails[];
  }

  private buildExecutionCards(executions: Execution[]): CardDetails[] {
    return [
      {
        title: 'Execution',
        elements: executions.map((execution) => ({
          title: getResourceProperty(execution, ExecutionProperties.NAME),
          // desc: getResourceProperty(execution, ExecutionProperties.PIPELINE_NAME),
          desc: String(execution.getId()),
          prev: true,
          next: true
          })
        )
      }
    ] as CardDetails[];
  }

  // @ts-ignore
  private static logProto(proto: any): void {
    console.log(JSON.stringify(proto.toObject(), null, 2))
  }

  private async loadData(id: number): Promise<string> {
    console.log(`Fetching data for ${id}`);

    const getEventsByArtifactIDsRequest = new GetEventsByArtifactIDsRequest();
    getEventsByArtifactIDsRequest.addArtifactIds(id);

    const getEventsByArtifactIDsResponse =
      await this.metadataStoreService.getEventsByArtifactIDs(getEventsByArtifactIDsRequest);

    const events = getEventsByArtifactIDsResponse.getEventsList();

    const outputExecutionIds =
      events.filter(isOutputEvent)
        .map((event) => (event.getExecutionId()));

    const inputExecutionIds =
      events.filter(isInputEvent)
        .map((event) => (event.getExecutionId()));

    const outputExecutions = await this.getExecutions(outputExecutionIds);
    const inputExecutions = await this.getExecutions(inputExecutionIds);

    // Build the list of input execution events.
    // The list of input executions is the list of events in which the target
    // artifact was an output artifact.
    const getInputExecutionEvents = new GetEventsByExecutionIDsRequest();
    getInputExecutionEvents.setExecutionIdsList(outputExecutionIds);
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
    // The list of output executions is the list of events in which the target
    // artifact was an input artifact.
    const getOutputExecutionEventsRequest = new GetEventsByExecutionIDsRequest();
    getOutputExecutionEventsRequest.setExecutionIdsList(inputExecutionIds);
    const getOutputExecutionEventsResponse =
      await this.metadataStoreService.getEventsByExecutionIDs(getOutputExecutionEventsRequest);

    const outputExecutionOutputArtifactIds =
      getOutputExecutionEventsResponse
        .getEventsList()
        .filter(isOutputEvent)
        .map((event) => event.getArtifactId());
    const outputArtifacts = await this.getArtifacts(outputExecutionOutputArtifactIds);

    this.setState({
      inputArtifacts: inputArtifacts,
      inputExecutions: outputExecutions,
      outputExecutions: inputExecutions,
      outputArtifacts: outputArtifacts,
    });
    return ''
  }

  // Updates the view and action bar when the target is set from a lineage card.
  private setTargetFromLineageCard(target: Artifact): void {
    const actionBarRefObject = this.actionBarRef as RefObject<LineageActionBar>;
    if (!actionBarRefObject.current) {return;}

    actionBarRefObject.current.pushHistory(target);
    // TODO: This is being called with id === 0
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
