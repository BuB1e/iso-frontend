import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("login", "routes/login.tsx"),

	layout("routes/app.layout.tsx", [
		route("dashboard", "routes/dashboard.tsx"),
		route("assessment", "routes/assessment.layout.tsx", [
			route("overall", "routes/assessment.overall.tsx"),
		]),
		route("evidence", "routes/evidence.tsx"),
		route("report", "routes/report.tsx"),
		route("audit", "routes/audit.tsx"),
		route("settings", "routes/settings.tsx"),
	])

] satisfies RouteConfig;
