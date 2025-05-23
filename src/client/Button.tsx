import React, { useState } from "react";
import "./Button.css";
import { getIcon } from "./icons";
import { ButtonConfig } from "./types";

interface Parameters {
  csrfToken: string;
  button: ButtonConfig;
}

const Button = ({ csrfToken, button }: Parameters) => {
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
    const body = JSON.stringify({ actionId: button.actionId });
    const headers = {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    };
    try {
      const response = await fetch("rest/action", {
        method: "POST",
        body,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Action successful:", data);
    } catch (error) {
      if (error instanceof Error && (error as any).code === "ECONNRESET") {
        console.error("Connection reset by server. Please try again later.");
      } else {
        console.error("An error occurred:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="inline-block box-border rounded-md align-middle p-0 m-4 button text-red-500 place-content-center h-20 w-20 text-6xl bg-gray-500 border-4 border-inset border-gray-500"
      disabled={loading}
      onClick={() => performAction()}
    >
      {createInnerDiv(button.icon)}
    </button>
  );
};

export default Button;

function createInnerDiv(iconName: string) {
  const iconUrl = getIcon(iconName);
  console.log({ iconUrl });
  if (iconUrl) {
    return (
      <div
        style={{
          backgroundImage: `url("${iconUrl}")`,
        }}
        className="w-full h-full rounded-sm bg-cover bg-center bg-no-repeat"
      />
    );
  }
  return <div className="">{iconName}</div>;
}
