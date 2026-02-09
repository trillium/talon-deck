"use client";

import { useState } from "react";
import { getIcon } from "../lib/icons";
import type { ButtonClient } from "../lib/types";

interface Parameters {
  button: ButtonClient;
}

export default function Button({ button }: Parameters) {
  const [loading, setLoading] = useState(false);

  if (!button.actionId) {
    return (
      <div className="inline-block box-border rounded-md align-middle p-0 m-4 button text-red-500 place-content-center h-20 w-20 text-6xl border-4 border-inset border-gray-500">
        {createInnerDiv(button.icon)}
      </div>
    );
  }

  const performAction = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/action", {
        method: "POST",
        body: JSON.stringify({ actionId: button.actionId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="inline-block box-border rounded-md align-middle p-0 m-4 button text-red-500 place-content-center h-20 w-20 text-6xl bg-gray-500 border-4 border-inset border-gray-500"
      disabled={loading}
      onClick={() => performAction()}
    >
      {createInnerDiv(button.icon)}
    </button>
  );
}

function createInnerDiv(iconName: string) {
  const iconUrl = getIcon(iconName);
  if (iconUrl) {
    return (
      <div
        style={{ backgroundImage: `url("${iconUrl}")` }}
        className="w-full h-full rounded-sm bg-cover bg-center bg-no-repeat"
      />
    );
  }
  return <div>{iconName}</div>;
}
