import * as jspb from "google-protobuf"

export class Value extends jspb.Message {
  getIntValue(): number;
  setIntValue(value: number): void;

  getDoubleValue(): number;
  setDoubleValue(value: number): void;

  getStringValue(): string;
  setStringValue(value: string): void;

  getValueCase(): Value.ValueCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Value.AsObject;
  static toObject(includeInstance: boolean, msg: Value): Value.AsObject;
  static serializeBinaryToWriter(message: Value, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Value;
  static deserializeBinaryFromReader(message: Value, reader: jspb.BinaryReader): Value;
}

export namespace Value {
  export type AsObject = {
    intValue: number,
    doubleValue: number,
    stringValue: string,
  }

  export enum ValueCase { 
    VALUE_NOT_SET = 0,
    INT_VALUE = 1,
    DOUBLE_VALUE = 2,
    STRING_VALUE = 3,
  }
}

export class Artifact extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getTypeId(): number;
  setTypeId(value: number): void;

  getUri(): string;
  setUri(value: string): void;

  getPropertiesMap(): jspb.Map<string, Value>;
  clearPropertiesMap(): void;

  getCustomPropertiesMap(): jspb.Map<string, Value>;
  clearCustomPropertiesMap(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Artifact.AsObject;
  static toObject(includeInstance: boolean, msg: Artifact): Artifact.AsObject;
  static serializeBinaryToWriter(message: Artifact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Artifact;
  static deserializeBinaryFromReader(message: Artifact, reader: jspb.BinaryReader): Artifact;
}

export namespace Artifact {
  export type AsObject = {
    id: number,
    typeId: number,
    uri: string,
    propertiesMap: Array<[string, Value.AsObject]>,
    customPropertiesMap: Array<[string, Value.AsObject]>,
  }
}

export class ArtifactType extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getPropertiesMap(): jspb.Map<string, PropertyType>;
  clearPropertiesMap(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ArtifactType.AsObject;
  static toObject(includeInstance: boolean, msg: ArtifactType): ArtifactType.AsObject;
  static serializeBinaryToWriter(message: ArtifactType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ArtifactType;
  static deserializeBinaryFromReader(message: ArtifactType, reader: jspb.BinaryReader): ArtifactType;
}

export namespace ArtifactType {
  export type AsObject = {
    id: number,
    name: string,
    propertiesMap: Array<[string, PropertyType]>,
  }
}

export class Event extends jspb.Message {
  getArtifactId(): number;
  setArtifactId(value: number): void;

  getExecutionId(): number;
  setExecutionId(value: number): void;

  getPath(): Event.Path | undefined;
  setPath(value?: Event.Path): void;
  hasPath(): boolean;
  clearPath(): void;

  getType(): Event.Type;
  setType(value: Event.Type): void;

  getMillisecondsSinceEpoch(): number;
  setMillisecondsSinceEpoch(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Event.AsObject;
  static toObject(includeInstance: boolean, msg: Event): Event.AsObject;
  static serializeBinaryToWriter(message: Event, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Event;
  static deserializeBinaryFromReader(message: Event, reader: jspb.BinaryReader): Event;
}

export namespace Event {
  export type AsObject = {
    artifactId: number,
    executionId: number,
    path?: Event.Path.AsObject,
    type: Event.Type,
    millisecondsSinceEpoch: number,
  }

  export class Path extends jspb.Message {
    getStepsList(): Array<Event.Path.Step>;
    setStepsList(value: Array<Event.Path.Step>): void;
    clearStepsList(): void;
    addSteps(value?: Event.Path.Step, index?: number): Event.Path.Step;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Path.AsObject;
    static toObject(includeInstance: boolean, msg: Path): Path.AsObject;
    static serializeBinaryToWriter(message: Path, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Path;
    static deserializeBinaryFromReader(message: Path, reader: jspb.BinaryReader): Path;
  }

  export namespace Path {
    export type AsObject = {
      stepsList: Array<Event.Path.Step.AsObject>,
    }

    export class Step extends jspb.Message {
      getIndex(): number;
      setIndex(value: number): void;

      getKey(): string;
      setKey(value: string): void;

      getValueCase(): Step.ValueCase;

      serializeBinary(): Uint8Array;
      toObject(includeInstance?: boolean): Step.AsObject;
      static toObject(includeInstance: boolean, msg: Step): Step.AsObject;
      static serializeBinaryToWriter(message: Step, writer: jspb.BinaryWriter): void;
      static deserializeBinary(bytes: Uint8Array): Step;
      static deserializeBinaryFromReader(message: Step, reader: jspb.BinaryReader): Step;
    }

    export namespace Step {
      export type AsObject = {
        index: number,
        key: string,
      }

      export enum ValueCase { 
        VALUE_NOT_SET = 0,
        INDEX = 1,
        KEY = 2,
      }
    }

  }


  export enum Type { 
    UNKNOWN = 0,
    DECLARED_OUTPUT = 1,
    DECLARED_INPUT = 2,
    INPUT = 3,
    OUTPUT = 4,
  }
}

export class Execution extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getTypeId(): number;
  setTypeId(value: number): void;

  getLastKnownState(): Execution.State;
  setLastKnownState(value: Execution.State): void;

  getPropertiesMap(): jspb.Map<string, Value>;
  clearPropertiesMap(): void;

  getCustomPropertiesMap(): jspb.Map<string, Value>;
  clearCustomPropertiesMap(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Execution.AsObject;
  static toObject(includeInstance: boolean, msg: Execution): Execution.AsObject;
  static serializeBinaryToWriter(message: Execution, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Execution;
  static deserializeBinaryFromReader(message: Execution, reader: jspb.BinaryReader): Execution;
}

export namespace Execution {
  export type AsObject = {
    id: number,
    typeId: number,
    lastKnownState: Execution.State,
    propertiesMap: Array<[string, Value.AsObject]>,
    customPropertiesMap: Array<[string, Value.AsObject]>,
  }

  export enum State { 
    UNKNOWN = 0,
    NEW = 1,
    RUNNING = 2,
    COMPLETE = 3,
    FAILED = 4,
    CACHED = 5,
  }
}

export class ExecutionType extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getPropertiesMap(): jspb.Map<string, PropertyType>;
  clearPropertiesMap(): void;

  getInputType(): ArtifactStructType | undefined;
  setInputType(value?: ArtifactStructType): void;
  hasInputType(): boolean;
  clearInputType(): void;

  getOutputType(): ArtifactStructType | undefined;
  setOutputType(value?: ArtifactStructType): void;
  hasOutputType(): boolean;
  clearOutputType(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExecutionType.AsObject;
  static toObject(includeInstance: boolean, msg: ExecutionType): ExecutionType.AsObject;
  static serializeBinaryToWriter(message: ExecutionType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExecutionType;
  static deserializeBinaryFromReader(message: ExecutionType, reader: jspb.BinaryReader): ExecutionType;
}

export namespace ExecutionType {
  export type AsObject = {
    id: number,
    name: string,
    propertiesMap: Array<[string, PropertyType]>,
    inputType?: ArtifactStructType.AsObject,
    outputType?: ArtifactStructType.AsObject,
  }
}

export class ContextType extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getPropertiesMap(): jspb.Map<string, PropertyType>;
  clearPropertiesMap(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContextType.AsObject;
  static toObject(includeInstance: boolean, msg: ContextType): ContextType.AsObject;
  static serializeBinaryToWriter(message: ContextType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContextType;
  static deserializeBinaryFromReader(message: ContextType, reader: jspb.BinaryReader): ContextType;
}

export namespace ContextType {
  export type AsObject = {
    id: number,
    name: string,
    propertiesMap: Array<[string, PropertyType]>,
  }
}

export class Context extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getTypeId(): number;
  setTypeId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getPropertiesMap(): jspb.Map<string, Value>;
  clearPropertiesMap(): void;

  getCustomPropertiesMap(): jspb.Map<string, Value>;
  clearCustomPropertiesMap(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Context.AsObject;
  static toObject(includeInstance: boolean, msg: Context): Context.AsObject;
  static serializeBinaryToWriter(message: Context, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Context;
  static deserializeBinaryFromReader(message: Context, reader: jspb.BinaryReader): Context;
}

export namespace Context {
  export type AsObject = {
    id: number,
    typeId: number,
    name: string,
    propertiesMap: Array<[string, Value.AsObject]>,
    customPropertiesMap: Array<[string, Value.AsObject]>,
  }
}

export class Attribution extends jspb.Message {
  getArtifactId(): number;
  setArtifactId(value: number): void;

  getContextId(): number;
  setContextId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Attribution.AsObject;
  static toObject(includeInstance: boolean, msg: Attribution): Attribution.AsObject;
  static serializeBinaryToWriter(message: Attribution, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Attribution;
  static deserializeBinaryFromReader(message: Attribution, reader: jspb.BinaryReader): Attribution;
}

export namespace Attribution {
  export type AsObject = {
    artifactId: number,
    contextId: number,
  }
}

export class Association extends jspb.Message {
  getExecutionId(): number;
  setExecutionId(value: number): void;

  getContextId(): number;
  setContextId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Association.AsObject;
  static toObject(includeInstance: boolean, msg: Association): Association.AsObject;
  static serializeBinaryToWriter(message: Association, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Association;
  static deserializeBinaryFromReader(message: Association, reader: jspb.BinaryReader): Association;
}

export namespace Association {
  export type AsObject = {
    executionId: number,
    contextId: number,
  }
}

export class ParentContext extends jspb.Message {
  getChildId(): number;
  setChildId(value: number): void;

  getParentId(): number;
  setParentId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParentContext.AsObject;
  static toObject(includeInstance: boolean, msg: ParentContext): ParentContext.AsObject;
  static serializeBinaryToWriter(message: ParentContext, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParentContext;
  static deserializeBinaryFromReader(message: ParentContext, reader: jspb.BinaryReader): ParentContext;
}

export namespace ParentContext {
  export type AsObject = {
    childId: number,
    parentId: number,
  }
}

export class ArtifactStructType extends jspb.Message {
  getSimple(): ArtifactType | undefined;
  setSimple(value?: ArtifactType): void;
  hasSimple(): boolean;
  clearSimple(): void;

  getUnionType(): UnionArtifactStructType | undefined;
  setUnionType(value?: UnionArtifactStructType): void;
  hasUnionType(): boolean;
  clearUnionType(): void;

  getIntersection(): IntersectionArtifactStructType | undefined;
  setIntersection(value?: IntersectionArtifactStructType): void;
  hasIntersection(): boolean;
  clearIntersection(): void;

  getList(): ListArtifactStructType | undefined;
  setList(value?: ListArtifactStructType): void;
  hasList(): boolean;
  clearList(): void;

  getNone(): NoneArtifactStructType | undefined;
  setNone(value?: NoneArtifactStructType): void;
  hasNone(): boolean;
  clearNone(): void;

  getAny(): AnyArtifactStructType | undefined;
  setAny(value?: AnyArtifactStructType): void;
  hasAny(): boolean;
  clearAny(): void;

  getTuple(): TupleArtifactStructType | undefined;
  setTuple(value?: TupleArtifactStructType): void;
  hasTuple(): boolean;
  clearTuple(): void;

  getDict(): DictArtifactStructType | undefined;
  setDict(value?: DictArtifactStructType): void;
  hasDict(): boolean;
  clearDict(): void;

  getKindCase(): ArtifactStructType.KindCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: ArtifactStructType): ArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: ArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ArtifactStructType;
  static deserializeBinaryFromReader(message: ArtifactStructType, reader: jspb.BinaryReader): ArtifactStructType;
}

export namespace ArtifactStructType {
  export type AsObject = {
    simple?: ArtifactType.AsObject,
    unionType?: UnionArtifactStructType.AsObject,
    intersection?: IntersectionArtifactStructType.AsObject,
    list?: ListArtifactStructType.AsObject,
    none?: NoneArtifactStructType.AsObject,
    any?: AnyArtifactStructType.AsObject,
    tuple?: TupleArtifactStructType.AsObject,
    dict?: DictArtifactStructType.AsObject,
  }

  export enum KindCase { 
    KIND_NOT_SET = 0,
    SIMPLE = 1,
    UNION_TYPE = 2,
    INTERSECTION = 3,
    LIST = 4,
    NONE = 5,
    ANY = 6,
    TUPLE = 7,
    DICT = 8,
  }
}

export class UnionArtifactStructType extends jspb.Message {
  getCandidatesList(): Array<ArtifactStructType>;
  setCandidatesList(value: Array<ArtifactStructType>): void;
  clearCandidatesList(): void;
  addCandidates(value?: ArtifactStructType, index?: number): ArtifactStructType;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnionArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: UnionArtifactStructType): UnionArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: UnionArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnionArtifactStructType;
  static deserializeBinaryFromReader(message: UnionArtifactStructType, reader: jspb.BinaryReader): UnionArtifactStructType;
}

export namespace UnionArtifactStructType {
  export type AsObject = {
    candidatesList: Array<ArtifactStructType.AsObject>,
  }
}

export class IntersectionArtifactStructType extends jspb.Message {
  getConstraintsList(): Array<ArtifactStructType>;
  setConstraintsList(value: Array<ArtifactStructType>): void;
  clearConstraintsList(): void;
  addConstraints(value?: ArtifactStructType, index?: number): ArtifactStructType;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IntersectionArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: IntersectionArtifactStructType): IntersectionArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: IntersectionArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IntersectionArtifactStructType;
  static deserializeBinaryFromReader(message: IntersectionArtifactStructType, reader: jspb.BinaryReader): IntersectionArtifactStructType;
}

export namespace IntersectionArtifactStructType {
  export type AsObject = {
    constraintsList: Array<ArtifactStructType.AsObject>,
  }
}

export class ListArtifactStructType extends jspb.Message {
  getElement(): ArtifactStructType | undefined;
  setElement(value?: ArtifactStructType): void;
  hasElement(): boolean;
  clearElement(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: ListArtifactStructType): ListArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: ListArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListArtifactStructType;
  static deserializeBinaryFromReader(message: ListArtifactStructType, reader: jspb.BinaryReader): ListArtifactStructType;
}

export namespace ListArtifactStructType {
  export type AsObject = {
    element?: ArtifactStructType.AsObject,
  }
}

export class NoneArtifactStructType extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NoneArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: NoneArtifactStructType): NoneArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: NoneArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NoneArtifactStructType;
  static deserializeBinaryFromReader(message: NoneArtifactStructType, reader: jspb.BinaryReader): NoneArtifactStructType;
}

export namespace NoneArtifactStructType {
  export type AsObject = {
  }
}

export class AnyArtifactStructType extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnyArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: AnyArtifactStructType): AnyArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: AnyArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnyArtifactStructType;
  static deserializeBinaryFromReader(message: AnyArtifactStructType, reader: jspb.BinaryReader): AnyArtifactStructType;
}

export namespace AnyArtifactStructType {
  export type AsObject = {
  }
}

export class TupleArtifactStructType extends jspb.Message {
  getElementsList(): Array<ArtifactStructType>;
  setElementsList(value: Array<ArtifactStructType>): void;
  clearElementsList(): void;
  addElements(value?: ArtifactStructType, index?: number): ArtifactStructType;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TupleArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: TupleArtifactStructType): TupleArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: TupleArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TupleArtifactStructType;
  static deserializeBinaryFromReader(message: TupleArtifactStructType, reader: jspb.BinaryReader): TupleArtifactStructType;
}

export namespace TupleArtifactStructType {
  export type AsObject = {
    elementsList: Array<ArtifactStructType.AsObject>,
  }
}

export class DictArtifactStructType extends jspb.Message {
  getPropertiesMap(): jspb.Map<string, ArtifactStructType>;
  clearPropertiesMap(): void;

  getNoneTypeNotRequired(): boolean;
  setNoneTypeNotRequired(value: boolean): void;

  getExtraPropertiesType(): ArtifactStructType | undefined;
  setExtraPropertiesType(value?: ArtifactStructType): void;
  hasExtraPropertiesType(): boolean;
  clearExtraPropertiesType(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DictArtifactStructType.AsObject;
  static toObject(includeInstance: boolean, msg: DictArtifactStructType): DictArtifactStructType.AsObject;
  static serializeBinaryToWriter(message: DictArtifactStructType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DictArtifactStructType;
  static deserializeBinaryFromReader(message: DictArtifactStructType, reader: jspb.BinaryReader): DictArtifactStructType;
}

export namespace DictArtifactStructType {
  export type AsObject = {
    propertiesMap: Array<[string, ArtifactStructType.AsObject]>,
    noneTypeNotRequired: boolean,
    extraPropertiesType?: ArtifactStructType.AsObject,
  }
}

export class FakeDatabaseConfig extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FakeDatabaseConfig.AsObject;
  static toObject(includeInstance: boolean, msg: FakeDatabaseConfig): FakeDatabaseConfig.AsObject;
  static serializeBinaryToWriter(message: FakeDatabaseConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FakeDatabaseConfig;
  static deserializeBinaryFromReader(message: FakeDatabaseConfig, reader: jspb.BinaryReader): FakeDatabaseConfig;
}

export namespace FakeDatabaseConfig {
  export type AsObject = {
  }
}

export class MySQLDatabaseConfig extends jspb.Message {
  getHost(): string;
  setHost(value: string): void;

  getPort(): number;
  setPort(value: number): void;

  getDatabase(): string;
  setDatabase(value: string): void;

  getUser(): string;
  setUser(value: string): void;

  getPassword(): string;
  setPassword(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MySQLDatabaseConfig.AsObject;
  static toObject(includeInstance: boolean, msg: MySQLDatabaseConfig): MySQLDatabaseConfig.AsObject;
  static serializeBinaryToWriter(message: MySQLDatabaseConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MySQLDatabaseConfig;
  static deserializeBinaryFromReader(message: MySQLDatabaseConfig, reader: jspb.BinaryReader): MySQLDatabaseConfig;
}

export namespace MySQLDatabaseConfig {
  export type AsObject = {
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
  }
}

export class SqliteMetadataSourceConfig extends jspb.Message {
  getFilenameUri(): string;
  setFilenameUri(value: string): void;

  getConnectionMode(): SqliteMetadataSourceConfig.ConnectionMode;
  setConnectionMode(value: SqliteMetadataSourceConfig.ConnectionMode): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SqliteMetadataSourceConfig.AsObject;
  static toObject(includeInstance: boolean, msg: SqliteMetadataSourceConfig): SqliteMetadataSourceConfig.AsObject;
  static serializeBinaryToWriter(message: SqliteMetadataSourceConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SqliteMetadataSourceConfig;
  static deserializeBinaryFromReader(message: SqliteMetadataSourceConfig, reader: jspb.BinaryReader): SqliteMetadataSourceConfig;
}

export namespace SqliteMetadataSourceConfig {
  export type AsObject = {
    filenameUri: string,
    connectionMode: SqliteMetadataSourceConfig.ConnectionMode,
  }

  export enum ConnectionMode { 
    UNKNOWN = 0,
    READONLY = 1,
    READWRITE = 2,
    READWRITE_OPENCREATE = 3,
  }
}

export class ConnectionConfig extends jspb.Message {
  getFakeDatabase(): FakeDatabaseConfig | undefined;
  setFakeDatabase(value?: FakeDatabaseConfig): void;
  hasFakeDatabase(): boolean;
  clearFakeDatabase(): void;

  getMysql(): MySQLDatabaseConfig | undefined;
  setMysql(value?: MySQLDatabaseConfig): void;
  hasMysql(): boolean;
  clearMysql(): void;

  getSqlite(): SqliteMetadataSourceConfig | undefined;
  setSqlite(value?: SqliteMetadataSourceConfig): void;
  hasSqlite(): boolean;
  clearSqlite(): void;

  getConfigCase(): ConnectionConfig.ConfigCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectionConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectionConfig): ConnectionConfig.AsObject;
  static serializeBinaryToWriter(message: ConnectionConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectionConfig;
  static deserializeBinaryFromReader(message: ConnectionConfig, reader: jspb.BinaryReader): ConnectionConfig;
}

export namespace ConnectionConfig {
  export type AsObject = {
    fakeDatabase?: FakeDatabaseConfig.AsObject,
    mysql?: MySQLDatabaseConfig.AsObject,
    sqlite?: SqliteMetadataSourceConfig.AsObject,
  }

  export enum ConfigCase { 
    CONFIG_NOT_SET = 0,
    FAKE_DATABASE = 1,
    MYSQL = 2,
    SQLITE = 3,
  }
}

export class MetadataStoreServerConfig extends jspb.Message {
  getConnectionConfig(): ConnectionConfig | undefined;
  setConnectionConfig(value?: ConnectionConfig): void;
  hasConnectionConfig(): boolean;
  clearConnectionConfig(): void;

  getSslConfig(): MetadataStoreServerConfig.SSLConfig | undefined;
  setSslConfig(value?: MetadataStoreServerConfig.SSLConfig): void;
  hasSslConfig(): boolean;
  clearSslConfig(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MetadataStoreServerConfig.AsObject;
  static toObject(includeInstance: boolean, msg: MetadataStoreServerConfig): MetadataStoreServerConfig.AsObject;
  static serializeBinaryToWriter(message: MetadataStoreServerConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MetadataStoreServerConfig;
  static deserializeBinaryFromReader(message: MetadataStoreServerConfig, reader: jspb.BinaryReader): MetadataStoreServerConfig;
}

export namespace MetadataStoreServerConfig {
  export type AsObject = {
    connectionConfig?: ConnectionConfig.AsObject,
    sslConfig?: MetadataStoreServerConfig.SSLConfig.AsObject,
  }

  export class SSLConfig extends jspb.Message {
    getServerKey(): string;
    setServerKey(value: string): void;

    getServerCert(): string;
    setServerCert(value: string): void;

    getCustomCa(): string;
    setCustomCa(value: string): void;

    getClientVerify(): boolean;
    setClientVerify(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SSLConfig.AsObject;
    static toObject(includeInstance: boolean, msg: SSLConfig): SSLConfig.AsObject;
    static serializeBinaryToWriter(message: SSLConfig, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SSLConfig;
    static deserializeBinaryFromReader(message: SSLConfig, reader: jspb.BinaryReader): SSLConfig;
  }

  export namespace SSLConfig {
    export type AsObject = {
      serverKey: string,
      serverCert: string,
      customCa: string,
      clientVerify: boolean,
    }
  }

}

export enum PropertyType { 
  UNKNOWN = 0,
  INT = 1,
  DOUBLE = 2,
  STRING = 3,
}
