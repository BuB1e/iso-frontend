import { ControlsType } from "../types";

// This is Domains (4 Domains)
export interface AssessmentControlResponseDto {
  id: number;
  isoAssessmentId: number;
  description: string;
  type: ControlsType;
  createdAt: Date;
  updatedAt: Date;
}
