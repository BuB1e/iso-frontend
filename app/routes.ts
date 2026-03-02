import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("api/suggestion/:controlId", "routes/api.suggestion.$controlId.ts"),

  // Protect all app routes
  layout("routes/_protected.tsx", [
    // Standard App Layout (Sidebar, Topbar)
    layout("routes/app.layout.tsx", [
      route("dashboard", "routes/dashboard.tsx"),
      route("assessment", "routes/assessment.layout.tsx", [
        index("routes/assessment.index.tsx"),
        route("overview", "routes/assessment.overview.tsx"),
        route("domain/:domainNumber", "routes/domain.detail.tsx"),
        route(
          "domain/:domainNumber/:controlNumber",
          "routes/domain.control.tsx",
        ),
      ]),
      route("evidence", "routes/evidence.tsx"),
      route("summary", "routes/summary.tsx"),
      route("settings", "routes/settings.tsx"),

      // Admin routes (protected by role check in components)
      layout("routes/admin.layout.tsx", [
        route("admin/users", "routes/admin.users.tsx"),
        route("admin/companies", "routes/admin.companies.tsx"),
      ]),
    ]),
  ]),

  // Catch-all API proxy — forwards /api/* to the real backend server-side
  route("api/*", "routes/api.proxy.ts"),
] satisfies RouteConfig;
