/**
 * This file provides common types used by the Lineage Explorer components
 */
import {
    Artifact,
    Execution
} from "../generated/src/apis/metadata/metadata_store_pb";

export type LineageCardType = 'artifact' | 'execution';
export interface LineageRow {
    title: string;
    desc?: string;
    prev?: boolean;
    next?: boolean;
    artifact?: Artifact,
    execution?: Execution,
}
export const DEFAULT_LINEAGE_CARD_TYPE = 'artifact' as LineageCardType;
