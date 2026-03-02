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

    // Forward the response back to the client
    const responseHeaders = new Headers(response.headers);
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
