import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  layout("routes/app.layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("assessment", "routes/assessment.layout.tsx", [
      index("routes/assessment.index.tsx"),
      route("overview", "routes/assessment.overview.tsx"),
      route("domain/:domainNumber", "routes/domain.detail.tsx"),
      route("domain/:domainNumber/:controlNumber", "routes/domain.control.tsx"),
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
] satisfies RouteConfig;
