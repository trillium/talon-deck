import { getButtons, onUpdate } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        try {
          const data = JSON.stringify(getButtons());
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          cleanup();
        }
      };

      // Send current state immediately on connect
      send();

      const unsubscribe = onUpdate(send);

      const cleanup = () => {
        unsubscribe();
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
