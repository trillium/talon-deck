import type { ButtonConfig } from "../types";

export interface StateMessage {
  version: number;
  timestamp: number;
  buttons: ButtonConfig[];
}

export interface ActionRequest {
  uuid: string;
  action: string;
  timestamp: number;
}

export interface ActionResponse {
  uuid: string;
  success: boolean;
  error: string | null;
  timestamp: number;
}
