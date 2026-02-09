export interface ButtonClient {
  icon: string;
  actionId?: string;
}

export interface ButtonConfig {
  icon: string;
  action?: string;
  order?: number;
}

export interface Settings {
  host: string;
  port: number;
  basicAuth?: {
    username: string;
    password: string;
  };
}
