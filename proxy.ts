import { type NextRequest, NextResponse } from "next/server";
import settings from "./settings";

export function proxy(request: NextRequest) {
  // Basic auth
  if (settings.basicAuth) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !validateBasicAuth(authHeader)) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Talon Deck"' },
      });
    }
  }

  // Host validation
  const hostError = validateHost(request.headers.get("host"));
  if (hostError) {
    return new NextResponse(hostError, { status: 403 });
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function validateBasicAuth(authHeader: string): boolean {
  if (!settings.basicAuth || !authHeader.startsWith("Basic ")) return false;

  const decoded = atob(authHeader.slice(6));
  const [username, password] = decoded.split(":");
  return username === settings.basicAuth.username && password === settings.basicAuth.password;
}

function validateHost(host: string | null): string | null {
  if (!host) return "Host header is required";

  const portSuffix = `:${settings.port}`;

  if (settings.host === "0.0.0.0" || settings.host === "::") {
    let hostname = host;
    if (hostname.endsWith(portSuffix)) {
      hostname = hostname.slice(0, -portSuffix.length);
    } else if (settings.port !== 80) {
      return `Expected host header '${host}' to end with port '${settings.port}'`;
    }
    if (hostname === "localhost") hostname = "127.0.0.1";
    if (!isIP(hostname)) {
      return `Host '${hostname}' is not a valid IP address`;
    }
    return null;
  }

  const validIPs = [settings.host];
  if (settings.host === "localhost") validIPs.push("127.0.0.1");
  if (settings.host === "127.0.0.1") validIPs.push("localhost");

  const validPorts = [portSuffix];
  if (settings.port === 80) validPorts.push("");

  const validHosts = validIPs.flatMap((ip) => validPorts.map((port) => `${ip}${port}`));

  if (!validHosts.includes(host)) {
    return `Host '${host}' is not allowed`;
  }

  return null;
}

const ipv4Re = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6Re = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

function isIP(hostname: string): boolean {
  return ipv4Re.test(hostname) || ipv6Re.test(hostname);
}
