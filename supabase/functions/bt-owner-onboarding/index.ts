// ByteTorque BT-CP02-D — onboarding seguro del primer propietario.
// NO exponer llaves de servicio en frontend. Deshabilitado por defecto.
// Requiere: verify_jwt=true y BYTETORQUE_ONBOARDING_ENABLED=true
// solo DESPUÉS de superar las pruebas de aislamiento/Auth.
const allowedOrigins = new Set([
  "https://bytetorque.cl",
  "https://www.bytetorque.cl",
  "https://biomotors-taller-demo.onrender.com",
  "http://localhost:5173",
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function respond(
  status: number,
  data: Record<string, unknown>,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  };

  if (origin !== null) {
    if (!allowedOrigins.has(origin)) {
      return respond(403, { error: "Origen no autorizado." }, headers);
    }
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] =
      "authorization, apikey, content-type, x-client-info";
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") {
    return respond(405, { error: "Método no permitido." }, headers);
  }

  // Puerta de seguridad: no habilitar onboarding sin aprobación.
  if (Deno.env.get("BYTETORQUE_ONBOARDING_ENABLED") !== "true") {
    return respond(
      503,
      { error: "El registro de talleres todavía no está habilitado." },
      headers,
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(authHeader)) {
    return respond(401, { error: "Inicia sesión para continuar." }, headers);
  }

  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return respond(415, { error: "Se requiere contenido JSON." }, headers);
  }

  let requestData: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 4096) {
      return respond(413, { error: "Solicitud demasiado extensa." }, headers);
    }
    requestData = JSON.parse(raw);
  } catch {
    return respond(400, { error: "Solicitud inválida." }, headers);
  }

  if (!requestData || typeof requestData !== "object" || Array.isArray(requestData)) {
    return respond(400, { error: "Solicitud inválida." }, headers);
  }

  const payload = requestData as Record<string, unknown>;
  const workshopName = typeof payload.workshop_name === "string"
    ? payload.workshop_name.trim()
    : "";
  const displayName = typeof payload.display_name === "string"
    ? payload.display_name.trim()
    : "";

  if (
    [...workshopName].length < 2 || [...workshopName].length > 120 ||
    [...displayName].length < 2 || [...displayName].length > 120
  ) {
    return respond(
      422,
      { error: "Revisa el nombre del taller y el nombre del propietario (2 a 120 caracteres)." },
      headers,
    );
  }

  const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!baseUrl || !anonKey || !serviceKey) {
    return respond(503, { error: "Servicio temporalmente no disponible." }, headers);
  }

  try {
    // Validar el JWT contra Supabase Auth y obtener el UID real del solicitante.
    // No tomar jamás owner_user_id, rol o workshop_id del cuerpo del request.
    const userResponse = await fetch(baseUrl + "/auth/v1/user", {
      headers: {
        apikey: anonKey,
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!userResponse.ok) {
      return respond(401, { error: "Sesión inválida o vencida." }, headers);
    }

    const user = await userResponse.json();
    if (
      typeof user?.id !== "string" ||
      !uuidPattern.test(user.id) ||
      typeof user?.email !== "string" ||
      !user.email_confirmed_at ||
      user.is_anonymous === true
    ) {
      return respond(
        403,
        { error: "Debes confirmar tu correo antes de registrar un taller." },
        headers,
      );
    }

    // Solo el backend utiliza esta credencial, nunca el navegador.
    // La RPC en PostgreSQL es SECURITY INVOKER y EXECUTE solo service_role.
    const rpcResponse = await fetch(
      baseUrl + "/rest/v1/rpc/bootstrap_workshop_owner",
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: "Bearer " + serviceKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          p_owner_user_id: user.id,
          p_workshop_name: workshopName,
          p_display_name: displayName,
        }),
      },
    );

    if (!rpcResponse.ok) {
      // Nunca registrar contenido de peticiones ni información personal en logs.
      return respond(
        rpcResponse.status === 400 ? 422 : 503,
        { error: "No se pudo crear el taller. Intenta nuevamente." },
        headers,
      );
    }

    const workshopId: unknown = await rpcResponse.json();
    if (typeof workshopId !== "string" || !uuidPattern.test(workshopId)) {
      return respond(503, { error: "Respuesta de servicio inesperada." }, headers);
    }

    return respond(200, {
      workshop_id: workshopId,
      message: "Taller asociado correctamente a tu cuenta.",
    }, headers);
  } catch {
    return respond(503, { error: "No se pudo completar la operación." }, headers);
  }
});
