import type { Settings } from "./lib/types";

const settings: Settings = {
  host: "0.0.0.0",
  port: 3000,
  basicAuth: {
    username: "admin",
    password: "password",
  },
};

export default settings;
