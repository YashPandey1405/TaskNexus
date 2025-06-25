import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/showProfile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/showProfile"!</div>
}
