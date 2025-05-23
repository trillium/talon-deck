import React from "react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";

const container = document.getElementById("root");
if (!container) {
  throw new Error(
    "Root container not found. Make sure <div id='root'></div> exists in index.html."
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
