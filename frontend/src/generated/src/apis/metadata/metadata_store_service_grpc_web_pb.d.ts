import * as grpcWeb from 'grpc-web';

import * as src_apis_metadata_metadata_store_pb from '../../../src/apis/metadata/metadata_store_pb';

import {
  GetArtifactTypeRequest,
  GetArtifactTypeResponse,
  GetArtifactTypesByIDRequest,
  GetArtifactTypesByIDResponse,
  GetArtifactTypesRequest,
  GetArtifactTypesResponse,
  GetArtifactsByContextRequest,
  GetArtifactsByContextResponse,
  GetArtifactsByIDRequest,
  GetArtifactsByIDResponse,
  GetArtifactsByTypeRequest,
  GetArtifactsByTypeResponse,
  GetArtifactsByURIRequest,
  GetArtifactsByURIResponse,
  GetArtifactsRequest,
  GetArtifactsResponse,
  GetChildrenContextsByContextRequest,
  GetChildrenContextsByContextResponse,
  GetContextTypeRequest,
  GetContextTypeResponse,
  GetContextTypesByIDRequest,
  GetContextTypesByIDResponse,
  GetContextsByArtifactRequest,
  GetContextsByArtifactResponse,
  GetContextsByExecutionRequest,
  GetContextsByExecutionResponse,
  GetContextsByIDRequest,
  GetContextsByIDResponse,
  GetContextsByTypeRequest,
  GetContextsByTypeResponse,
  GetContextsRequest,
  GetContextsResponse,
  GetEventsByArtifactIDsRequest,
  GetEventsByArtifactIDsResponse,
  GetEventsByExecutionIDsRequest,
  GetEventsByExecutionIDsResponse,
  GetExecutionTypeRequest,
  GetExecutionTypeResponse,
  GetExecutionTypesByIDRequest,
  GetExecutionTypesByIDResponse,
  GetExecutionTypesRequest,
  GetExecutionTypesResponse,
  GetExecutionsByContextRequest,
  GetExecutionsByContextResponse,
  GetExecutionsByIDRequest,
  GetExecutionsByIDResponse,
  GetExecutionsByTypeRequest,
  GetExecutionsByTypeResponse,
  GetExecutionsRequest,
  GetExecutionsResponse,
  GetParentContextsByContextRequest,
  GetParentContextsByContextResponse,
  PutArtifactTypeRequest,
  PutArtifactTypeResponse,
  PutArtifactsRequest,
  PutArtifactsResponse,
  PutAttributionsAndAssociationsRequest,
  PutAttributionsAndAssociationsResponse,
  PutContextTypeRequest,
  PutContextTypeResponse,
  PutContextsRequest,
  PutContextsResponse,
  PutEventsRequest,
  PutEventsResponse,
  PutExecutionRequest,
  PutExecutionResponse,
  PutExecutionTypeRequest,
  PutExecutionTypeResponse,
  PutExecutionsRequest,
  PutExecutionsResponse,
  PutParentContextsRequest,
  PutParentContextsResponse,
  PutTypesRequest,
  PutTypesResponse} from './metadata_store_service_pb';

export class MetadataStoreServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: string; });

  putArtifacts(
    request: PutArtifactsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutArtifactsResponse) => void
  ): grpcWeb.ClientReadableStream<PutArtifactsResponse>;

  putArtifactType(
    request: PutArtifactTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutArtifactTypeResponse) => void
  ): grpcWeb.ClientReadableStream<PutArtifactTypeResponse>;

  putExecutions(
    request: PutExecutionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutExecutionsResponse) => void
  ): grpcWeb.ClientReadableStream<PutExecutionsResponse>;

  putExecutionType(
    request: PutExecutionTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutExecutionTypeResponse) => void
  ): grpcWeb.ClientReadableStream<PutExecutionTypeResponse>;

  putEvents(
    request: PutEventsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutEventsResponse) => void
  ): grpcWeb.ClientReadableStream<PutEventsResponse>;

  putExecution(
    request: PutExecutionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutExecutionResponse) => void
  ): grpcWeb.ClientReadableStream<PutExecutionResponse>;

  putTypes(
    request: PutTypesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutTypesResponse) => void
  ): grpcWeb.ClientReadableStream<PutTypesResponse>;

  putContextType(
    request: PutContextTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutContextTypeResponse) => void
  ): grpcWeb.ClientReadableStream<PutContextTypeResponse>;

  putContexts(
    request: PutContextsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutContextsResponse) => void
  ): grpcWeb.ClientReadableStream<PutContextsResponse>;

  putAttributionsAndAssociations(
    request: PutAttributionsAndAssociationsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutAttributionsAndAssociationsResponse) => void
  ): grpcWeb.ClientReadableStream<PutAttributionsAndAssociationsResponse>;

  putParentContexts(
    request: PutParentContextsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: PutParentContextsResponse) => void
  ): grpcWeb.ClientReadableStream<PutParentContextsResponse>;

  getArtifactType(
    request: GetArtifactTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactTypeResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactTypeResponse>;

  getArtifactTypesByID(
    request: GetArtifactTypesByIDRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactTypesByIDResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactTypesByIDResponse>;

  getArtifactTypes(
    request: GetArtifactTypesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactTypesResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactTypesResponse>;

  getExecutionType(
    request: GetExecutionTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetExecutionTypeResponse) => void
  ): grpcWeb.ClientReadableStream<GetExecutionTypeResponse>;

  getExecutionTypesByID(
    request: GetExecutionTypesByIDRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetExecutionTypesByIDResponse) => void
  ): grpcWeb.ClientReadableStream<GetExecutionTypesByIDResponse>;

  getExecutionTypes(
    request: GetExecutionTypesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetExecutionTypesResponse) => void
  ): grpcWeb.ClientReadableStream<GetExecutionTypesResponse>;

  getContextType(
    request: GetContextTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetContextTypeResponse) => void
  ): grpcWeb.ClientReadableStream<GetContextTypeResponse>;

  getContextTypesByID(
    request: GetContextTypesByIDRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetContextTypesByIDResponse) => void
  ): grpcWeb.ClientReadableStream<GetContextTypesByIDResponse>;

  getArtifacts(
    request: GetArtifactsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactsResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactsResponse>;

  getExecutions(
    request: GetExecutionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetExecutionsResponse) => void
  ): grpcWeb.ClientReadableStream<GetExecutionsResponse>;

  getContexts(
    request: GetContextsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetContextsResponse) => void
  ): grpcWeb.ClientReadableStream<GetContextsResponse>;

  getArtifactsByID(
    request: GetArtifactsByIDRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactsByIDResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactsByIDResponse>;

  getExecutionsByID(
    request: GetExecutionsByIDRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetExecutionsByIDResponse) => void
  ): grpcWeb.ClientReadableStream<GetExecutionsByIDResponse>;

  getContextsByID(
    request: GetContextsByIDRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetContextsByIDResponse) => void
  ): grpcWeb.ClientReadableStream<GetContextsByIDResponse>;

  getArtifactsByType(
    request: GetArtifactsByTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactsByTypeResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactsByTypeResponse>;

  getExecutionsByType(
    request: GetExecutionsByTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetExecutionsByTypeResponse) => void
  ): grpcWeb.ClientReadableStream<GetExecutionsByTypeResponse>;

  getContextsByType(
    request: GetContextsByTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetContextsByTypeResponse) => void
  ): grpcWeb.ClientReadableStream<GetContextsByTypeResponse>;

  getArtifactsByURI(
    request: GetArtifactsByURIRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactsByURIResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactsByURIResponse>;

  getEventsByExecutionIDs(
    request: GetEventsByExecutionIDsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetEventsByExecutionIDsResponse) => void
  ): grpcWeb.ClientReadableStream<GetEventsByExecutionIDsResponse>;

  getEventsByArtifactIDs(
    request: GetEventsByArtifactIDsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetEventsByArtifactIDsResponse) => void
  ): grpcWeb.ClientReadableStream<GetEventsByArtifactIDsResponse>;

  getContextsByArtifact(
    request: GetContextsByArtifactRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetContextsByArtifactResponse) => void
  ): grpcWeb.ClientReadableStream<GetContextsByArtifactResponse>;

  getContextsByExecution(
    request: GetContextsByExecutionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetContextsByExecutionResponse) => void
  ): grpcWeb.ClientReadableStream<GetContextsByExecutionResponse>;

  getParentContextsByContext(
    request: GetParentContextsByContextRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetParentContextsByContextResponse) => void
  ): grpcWeb.ClientReadableStream<GetParentContextsByContextResponse>;

  getChildrenContextsByContext(
    request: GetChildrenContextsByContextRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetChildrenContextsByContextResponse) => void
  ): grpcWeb.ClientReadableStream<GetChildrenContextsByContextResponse>;

  getArtifactsByContext(
    request: GetArtifactsByContextRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetArtifactsByContextResponse) => void
  ): grpcWeb.ClientReadableStream<GetArtifactsByContextResponse>;

  getExecutionsByContext(
    request: GetExecutionsByContextRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.Error,
               response: GetExecutionsByContextResponse) => void
  ): grpcWeb.ClientReadableStream<GetExecutionsByContextResponse>;

}

export class MetadataStoreServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: string; });

  putArtifacts(
    request: PutArtifactsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutArtifactsResponse>;

  putArtifactType(
    request: PutArtifactTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutArtifactTypeResponse>;

  putExecutions(
    request: PutExecutionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutExecutionsResponse>;

  putExecutionType(
    request: PutExecutionTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutExecutionTypeResponse>;

  putEvents(
    request: PutEventsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutEventsResponse>;

  putExecution(
    request: PutExecutionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutExecutionResponse>;

  putTypes(
    request: PutTypesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutTypesResponse>;

  putContextType(
    request: PutContextTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutContextTypeResponse>;

  putContexts(
    request: PutContextsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutContextsResponse>;

  putAttributionsAndAssociations(
    request: PutAttributionsAndAssociationsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutAttributionsAndAssociationsResponse>;

  putParentContexts(
    request: PutParentContextsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<PutParentContextsResponse>;

  getArtifactType(
    request: GetArtifactTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactTypeResponse>;

  getArtifactTypesByID(
    request: GetArtifactTypesByIDRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactTypesByIDResponse>;

  getArtifactTypes(
    request: GetArtifactTypesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactTypesResponse>;

  getExecutionType(
    request: GetExecutionTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetExecutionTypeResponse>;

  getExecutionTypesByID(
    request: GetExecutionTypesByIDRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetExecutionTypesByIDResponse>;

  getExecutionTypes(
    request: GetExecutionTypesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetExecutionTypesResponse>;

  getContextType(
    request: GetContextTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetContextTypeResponse>;

  getContextTypesByID(
    request: GetContextTypesByIDRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetContextTypesByIDResponse>;

  getArtifacts(
    request: GetArtifactsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactsResponse>;

  getExecutions(
    request: GetExecutionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetExecutionsResponse>;

  getContexts(
    request: GetContextsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetContextsResponse>;

  getArtifactsByID(
    request: GetArtifactsByIDRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactsByIDResponse>;

  getExecutionsByID(
    request: GetExecutionsByIDRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetExecutionsByIDResponse>;

  getContextsByID(
    request: GetContextsByIDRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetContextsByIDResponse>;

  getArtifactsByType(
    request: GetArtifactsByTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactsByTypeResponse>;

  getExecutionsByType(
    request: GetExecutionsByTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetExecutionsByTypeResponse>;

  getContextsByType(
    request: GetContextsByTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetContextsByTypeResponse>;

  getArtifactsByURI(
    request: GetArtifactsByURIRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactsByURIResponse>;

  getEventsByExecutionIDs(
    request: GetEventsByExecutionIDsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetEventsByExecutionIDsResponse>;

  getEventsByArtifactIDs(
    request: GetEventsByArtifactIDsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetEventsByArtifactIDsResponse>;

  getContextsByArtifact(
    request: GetContextsByArtifactRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetContextsByArtifactResponse>;

  getContextsByExecution(
    request: GetContextsByExecutionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetContextsByExecutionResponse>;

  getParentContextsByContext(
    request: GetParentContextsByContextRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetParentContextsByContextResponse>;

  getChildrenContextsByContext(
    request: GetChildrenContextsByContextRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetChildrenContextsByContextResponse>;

  getArtifactsByContext(
    request: GetArtifactsByContextRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetArtifactsByContextResponse>;

  getExecutionsByContext(
    request: GetExecutionsByContextRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<GetExecutionsByContextResponse>;

}

