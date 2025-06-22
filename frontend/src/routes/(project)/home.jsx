import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/(project)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <p>Hello User , Welcome To TaskNexux</p>
      <Link to="/logout" className="btn btn-danger">
        Logout
      </Link>
    </div>
  );
}
