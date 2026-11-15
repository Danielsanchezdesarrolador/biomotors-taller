// ByteTorque R2-A6 worker transport boundary.
// NOT DEPLOYED. Always returns 503 and NEVER invokes a DB, SMTP, or worker.
// The coordinator is implemented/tested separately under _shared.
// Future machine-to-machine authorization must be reviewed before replacing
// this handler: CORS alone is NOT authentication.
Deno.serve((_request: Request) => {
  return new Response(JSON.stringify({
    error: 'El trabajador de invitaciones todavía no está habilitado.'
  }), {
    status: 503,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  })
})
