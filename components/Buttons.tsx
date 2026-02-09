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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl text-gray-500 dark:text-gray-400">Disconnected</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center p-4">
      {buttons.map((button) => (
        <Button key={button.icon} button={button} />
      ))}
    </div>
  );
}
