import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/home/(tasks)/(project-HomePage)/notes/create/$pid',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/(tasks)/(project-HomePage)/notes/create/$pid"!</div>
}
