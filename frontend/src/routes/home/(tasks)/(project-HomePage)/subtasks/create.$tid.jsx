import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/home/(tasks)/(project-HomePage)/subtasks/create/$tid',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/home/(tasks)/(project-HomePage)/subtasks/create/$tid"!</div>
  )
}
