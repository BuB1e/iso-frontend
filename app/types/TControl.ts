import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

// Matches Prisma enum: control_status
export enum ControlStatus {
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  PARTIALLY = "PARTIALLY",
  IMPLEMENTED = "IMPLEMENTED",
}

// Matches Prisma enum: controls_type
export enum ControlsType {
  PHYSICAL = "PHYSICAL",
  PEOPLE = "PEOPLE",
  ORGANIZATION = "ORGANIZATION",
  TECHNOLOGICAL = "TECHNOLOGICAL",
}

// Matches Prisma model: Controls
export interface TControl {
  id: number;
  code: string; // e.g., "A.5.1"
  name: string;
  currentPractice: string;
  description: string;
  status: ControlStatus;
  assessmentControlId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Matches Prisma model: AssessmentControl (Domain grouping)
export interface TAssessmentControl {
  id: number;
  count: number; // completed count
  maxCount: number; // total controls
  context: string;
  type: ControlsType;
  isoAssessmentId: number;
  controls?: TControl[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Color key for styling based on domain type
export type DomainColorKey = "blue" | "green" | "yellow" | "purple";

// Map ControlsType to color
export const controlsTypeColorMap: Record<ControlsType, DomainColorKey> = {
  [ControlsType.ORGANIZATION]: "blue",
  [ControlsType.PEOPLE]: "green",
  [ControlsType.PHYSICAL]: "yellow",
  [ControlsType.TECHNOLOGICAL]: "purple",
};

// Map ControlsType to domain number (A.5, A.6, A.7, A.8)
export const controlsTypeDomainMap: Record<ControlsType, number> = {
  [ControlsType.ORGANIZATION]: 5,
  [ControlsType.PEOPLE]: 6,
  [ControlsType.PHYSICAL]: 7,
  [ControlsType.TECHNOLOGICAL]: 8,
};

// Map ControlsType to display name
export const controlsTypeNameMap: Record<ControlsType, string> = {
  [ControlsType.ORGANIZATION]: "Organizational Controls",
  [ControlsType.PEOPLE]: "People Controls",
  [ControlsType.PHYSICAL]: "Physical Controls",
  [ControlsType.TECHNOLOGICAL]: "Technical Controls",
};

// Status display configuration
export const controlStatusConfig: Record<
  ControlStatus,
  { label: string; color: string; bgColor: string }
> = {
  [ControlStatus.NOT_IMPLEMENTED]: {
    label: "Not Implemented",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  [ControlStatus.PARTIALLY]: {
    label: "Partially Implemented",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  [ControlStatus.IMPLEMENTED]: {
    label: "Implemented",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
};
