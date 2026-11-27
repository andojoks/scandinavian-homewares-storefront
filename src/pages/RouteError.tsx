import { isRouteErrorResponse, useRouteError } from 'react-router'

export default function RouteError() {
  const error = useRouteError()
  console.error(error)
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something broke on this page.'

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6 text-center">
      <div>
        <h1 className="display text-5xl">Sorry about that.</h1>
        <p className="mt-3 text-ink-soft">{message}</p>
        <a
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-canvas"
        >
          Reload the store
        </a>
      </div>
    </main>
  )
}
