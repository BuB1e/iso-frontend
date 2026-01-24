import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/root";
import "./app.css";
import { UserService } from "~/services/UserService";
import { useUserStore } from "~/stores/userStore";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "ISO Portal" },
  { name: "description", content: "ISO 27001 Compliance Management Portal" },
  { name: "theme-color", content: "#3b82f6" },
];

export async function loader() {
  const users = await UserService.getAllUser();
  return { users: users || [] };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { users } = useLoaderData<typeof loader>();
  const setUsers = useUserStore((state) => state.setUsers);

  useEffect(() => {
    if (users.length > 0) {
      setUsers(users);
    }
  }, [users, setUsers]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let statusCode = "Error";
  let title = "Something went wrong";
  let description = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = String(error.status);
    if (error.status === 404) {
      title = "Page not found";
      description =
        "The page you're looking for doesn't exist or has been moved.";
    } else if (error.status === 403) {
      title = "Access denied";
      description = "You don't have permission to view this page.";
    } else if (error.status === 500) {
      title = "Server error";
      description = "Our servers are having trouble. Please try again later.";
    } else {
      description = error.statusText || description;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    description = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        {/* Status Code Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <span className="text-2xl font-bold text-red-600">{statusCode}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>

        {/* Description */}
        <p className="text-slate-600 mb-6">{description}</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-main-blue text-white rounded-lg font-medium hover:bg-main-blue/90 transition-colors"
          >
            ← Go Home
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            ↻ Try Again
          </button>
        </div>

        {/* Dev Stack Trace */}
        {stack && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
              Technical details (dev only)
            </summary>
            <pre className="mt-2 p-3 bg-slate-100 rounded-lg overflow-x-auto text-xs text-slate-700">
              <code>{stack}</code>
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
