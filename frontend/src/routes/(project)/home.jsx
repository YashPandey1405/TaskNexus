import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(project)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(project)/home"!</div>;
}
