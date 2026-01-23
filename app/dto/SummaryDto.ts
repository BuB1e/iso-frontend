import { ControlStatus, ControlsType } from "../types";

// Response from backend - array of domain/status counts
export interface SummaryItemDto {
  type: ControlsType;
  status: ControlStatus;
  count: number;
}

// Processed summary for a single domain
export interface DomainSummary {
  type: ControlsType;
  code: string;
  name: string;
  description: string;
  notImplemented: number;
  partially: number;
  implemented: number;
  total: number;
  percentage: number;
}

// Full summary response (array of items)
export type SummaryResponseDto = SummaryItemDto[];
