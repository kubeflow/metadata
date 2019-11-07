/**
 * This file provides common types used by the Lineage Explorer components
 */

export type LineageCardType = 'artifact' | 'execution';
export interface LineageRow {
    title: string;
    desc?: string;
    prev?: boolean;
    next?: boolean;
}
export const DEFAULT_LINEAGE_CARD_TYPE = 'artifact' as LineageCardType;
