import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Catch-all API proxy route.
 * Forwards all /api/* requests from the browser to the real backend server.
 * The backend URL is only known server-side via process.env.BACKEND_URL.
 */
async function proxyRequest(request: Request): Promise<Response> {
  if (!BACKEND_URL) {
    console.error("[API Proxy] BACKEND_URL environment variable is not set.");
    return new Response(
      JSON.stringify({ error: "Backend URL is not configured" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

  // Forward all headers except host (set it to the backend's host)
  const headers = new Headers(request.headers);
  headers.set("host", new URL(BACKEND_URL).host);
  // Remove headers that should not be forwarded
  headers.delete("connection");

  try {
    // --- COOKIE NAME REWRITING (browser → backend) ---
    // On localhost, we strip the "__Secure-" prefix from cookie names so the
    // browser accepts them (since __Secure- cookies require HTTPS).
    // But the backend expects cookies with the original __Secure- prefix.
    // So here we rename them BACK before forwarding to the backend.
    const cookieHeader = headers.get("cookie");
    if (cookieHeader) {
      const rewrittenCookie = cookieHeader.replace(
        /\bbetter-auth\.session_token\b/g,
        "__Secure-better-auth.session_token",
      );
      headers.set("cookie", rewrittenCookie);
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      // @ts-expect-error — duplex is required for streaming request bodies in Node
      duplex: "half",
    };

    // Only attach body for methods that support it
    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = request.body;
    }

    const response = await fetch(targetUrl, fetchOptions);

    // DEBUG: Log auth-related proxy requests
    if (url.pathname.includes("/auth/")) {
      console.log(
        `[API Proxy] ${request.method} ${url.pathname} → ${response.status}`,
      );
      console.log(
        `[API Proxy] Authorization header sent: ${headers.has("authorization") ? "YES (" + headers.get("authorization")!.substring(0, 30) + "...)" : "NO"}`,
      );
      console.log(
        `[API Proxy] Cookie header sent: ${headers.has("cookie") ? "YES" : "NO"}`,
      );
      console.log(
        `[API Proxy] Backend set-auth-token: ${response.headers.get("set-auth-token") || "MISSING"}`,
      );
      console.log(
        `[API Proxy] Backend set-cookie count: ${typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie().length : "N/A"}`,
      );
    }

    // Forward the response back to the client
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // we handle set-cookie separately below
      if (key.toLowerCase() !== "set-cookie") {
        responseHeaders.append(key, value);
      }
    });

    // Properly forward multiple cookies without merging them into a single string
    if (typeof response.headers.getSetCookie === "function") {
      response.headers.getSetCookie().forEach((cookie) => {
        let rewrittenCookie = cookie;
        // Strip Domain=... so the browser accepts the cookie on localhost
        rewrittenCookie = rewrittenCookie.replace(/Domain=[^;]+;?\s*/gi, "");

        // Strip out Secure flag if we are proxying on local HTTP, otherwise browser drops it
        if (
          request.url.startsWith("http://localhost") ||
          request.url.startsWith("http://127.0.0.1") ||
          request.url.startsWith("http://0.0.0.0")
        ) {
          // IMPORTANT: Strip __Secure- prefix BEFORE stripping the Secure flag,
          // otherwise /Secure;?\s*/gi also matches the "Secure" inside "__Secure-"
          // and corrupts the cookie name!
          rewrittenCookie = rewrittenCookie.replace(/__Secure-/gi, "");
          rewrittenCookie = rewrittenCookie.replace(/;\s*Secure/gi, "");
          rewrittenCookie = rewrittenCookie.replace(
            /SameSite=None;?\s*/gi,
            "SameSite=Lax; ",
          );
        }

        // --- BEARER TOKEN INJECTION FIX ---
        // If the backend sent the session_token cookie, extract its value and expose
        // it explicitly via the `set-auth-token` header (since Cloudflare/CORS may strip it)
        const sessionTokenMatch = cookie.match(
          /(?:better-auth\.session_token|__Secure-better-auth\.session_token)=([^;]+)/,
        );
        if (sessionTokenMatch) {
          const rawToken = sessionTokenMatch[1];
          // better-auth sometimes URLEncodes the token
          responseHeaders.set("set-auth-token", decodeURIComponent(rawToken));
          responseHeaders.append(
            "Access-Control-Expose-Headers",
            "set-auth-token",
          );
        }

        responseHeaders.append("set-cookie", rewrittenCookie);
      });
    }

    // Remove transfer-encoding as it may conflict with the framework's response handling
    responseHeaders.delete("transfer-encoding");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[API Proxy] Failed to proxy request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to connect to backend" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}

// Handle GET, HEAD requests
export async function loader({ request }: LoaderFunctionArgs) {
  return proxyRequest(request);
}

// Handle POST, PUT, PATCH, DELETE requests
export async function action({ request }: ActionFunctionArgs) {
  return proxyRequest(request);
}
