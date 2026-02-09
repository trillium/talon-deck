"use client";

import { useEffect, useState } from "react";
import type { ButtonClient } from "../lib/types";
import Button from "./Button";

export default function Buttons() {
  const [buttons, setButtons] = useState<ButtonClient[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        setButtons(JSON.parse(event.data));
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      setButtons([]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!connected) {
    return <h1>Disconnected</h1>;
  }

  return (
    <>
      {buttons.map((button) => (
        <Button key={button.icon} button={button} />
      ))}
    </>
  );
}
