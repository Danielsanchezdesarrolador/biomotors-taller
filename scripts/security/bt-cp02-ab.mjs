#!/usr/bin/env node
// ByteTorque — prueba A/B real: requiere Node 22+, API Auth oficial y JWT por usuario.
// Ejecutar solo desde un equipo confiable del operador, nunca desde Render o navegador.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

const project = "suxcqqnmcjoezfxltoms";
const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const admin = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
// Las nuevas sb_secret_* son API keys, no JWT; enviarlas solo en apikey.
const adminIsModern = typeof admin === "string" && admin.startsWith("sb_secret_");
if (url !== "https://" + project + ".supabase.co" ||
    process.env.BT_CP02_AB_TEST !== "YES_CREATE_AND_DELETE_TEST_USERS" ||
    !key || !admin) {
  console.error("BLOQUEADO: revisa las variables SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY heredada) y BT_CP02_AB_TEST. No guardes claves en GitHub.");
  process.exit(2);
}

const users = [], workshops = [];
let count = 0, failed = false;
function check(label, ok) {
  assert.ok(ok, label);
  console.log("PASS " + (++count) + " — " + label);
}
async function api(path, { method = "GET", body, jwt, service = false, returning = false } = {}) {
  const credential = service ? admin : key;
  const headers = { "apikey": credential, "Content-Type": "application/json" };
  // JWT real para usuarios; claves sb_secret_* nunca como Bearer.
  if (jwt) headers.Authorization = "Bearer " + jwt;
  else if (service && !adminIsModern) headers.Authorization = "Bearer " + admin;
  if (returning) headers.Prefer = "return=representation";
  const result = await fetch(url + path, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const raw = await result.text();
  let data = null;
  if (raw) { try { data = JSON.parse(raw); } catch { /* no user data in errors */ } }
  return { status: result.status, ok: result.ok, data };
}
function required(r, step) { assert.ok(r.ok, step + " HTTP " + r.status); return r.data; }
function hidden(r) {
  return r.status === 401 || r.status === 403 ||
    (r.ok && Array.isArray(r.data) && r.data.length === 0);
}
function forbidden(r) { return [400,401,403,405].includes(r.status); }
function uuid(s) { assert.match(s || "", /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i); return s; }
async function makeUser(tag) {
  const email = "btcp02-" + tag + "-" + randomBytes(10).toString("hex") + "@example.com";
  const password = randomBytes(28).toString("hex") + "aA!3";
  // Admin API oficial; email_confirm=true evita emails a direcciones ficticias.
  const data = required(await api("/auth/v1/admin/users", {
    service: true, method: "POST", body: {email,password,email_confirm:true}
  }), "Crear usuario Auth de prueba");
  users.push(uuid(data.id));
  const sign = required(await api("/auth/v1/token?grant_type=password", {
    method:"POST", body:{email,password}
  }), "Sesión Auth");
  assert.equal(sign.user.id, data.id);
  assert.ok(typeof sign.access_token === "string");
  return { id:data.id, jwt:sign.access_token };
}
async function makeWorkshop(user, name) {
  const id = required(await api("/rest/v1/rpc/bootstrap_workshop_owner", {
    service:true, method:"POST",
    body:{p_owner_user_id:user.id,p_workshop_name:name,p_display_name:"Mecánico "+name}
  }), "Alta desde backend");
  uuid(id);
  if (!workshops.includes(id)) workshops.push(id);
  return id;
}
function get(table, jwt, condition="") {
  return api("/rest/v1/" + table + "?select=*" + condition, {jwt});
}
async function cleanup() {
  // Borrado vía API Auth oficial; cascada limpia perfiles y membresías.
  for (const id of [...users].reverse()) {
    try { const r=await api("/auth/v1/admin/users/"+id,{method:"DELETE",service:true});
      if (!r.ok && r.status !== 404) { failed=true; console.error("Limpieza Auth: HTTP "+r.status); }
    } catch { failed=true; console.error("Fallo de red en limpieza Auth"); }
  }
  for (const id of [...workshops].reverse()) {
    try { const r=await api("/rest/v1/workshops?id=eq."+id,{method:"DELETE",service:true});
      if (!r.ok) { failed=true; console.error("Limpieza taller: HTTP "+r.status); }
    } catch { failed=true; console.error("Fallo de red en limpieza taller"); }
  }
}
try {
  const a=await makeUser("a"), b=await makeUser("b");
  check("Auth entrega dos identidades diferentes",a.id!==b.id);
  const none=await get("workshops",a.jwt);
  check("Usuario sin membresía no ve talleres",none.ok && none.data.length===0);
  const wa=await makeWorkshop(a,"Taller prueba A");
  const wb=await makeWorkshop(b,"Taller prueba B");
  check("A y B tienen taller independiente",wa!==wb);
  check("Alta repetida no duplica talleres",(await makeWorkshop(a,"Taller nuevo"))===wa);
  const al=await get("workshops",a.jwt), bl=await get("workshops",b.jwt);
  check("A ve solo A",al.ok&&al.data.length===1&&al.data[0].id===wa);
  check("B ve solo B",bl.ok&&bl.data.length===1&&bl.data[0].id===wb);
  check("A no ve B por UUID",hidden(await get("workshops",a.jwt,"&id=eq."+wb)));
  check("B no ve A por UUID",hidden(await get("workshops",b.jwt,"&id=eq."+wa)));
  check("A no lee membresía B",hidden(await get("workshop_memberships",a.jwt,"&user_id=eq."+b.id)));
  check("B no lee membresía A",hidden(await get("workshop_memberships",b.jwt,"&user_id=eq."+a.id)));
  check("A no lee perfil B",hidden(await get("profiles",a.jwt,"&user_id=eq."+b.id)));
  check("B no lee perfil A",hidden(await get("profiles",b.jwt,"&user_id=eq."+a.id)));
  const am=await get("workshop_memberships",a.jwt);
  check("A lee solo su membresía owner",am.ok&&am.data.length===1&&am.data[0].role==="owner"&&am.data[0].user_id===a.id);
  check("A no puede crear taller",forbidden(await api("/rest/v1/workshops",{jwt:a.jwt,method:"POST",body:{name:"Intruso"}})));
  check("A no puede agregar membresía en B",forbidden(await api("/rest/v1/workshop_memberships",{jwt:a.jwt,method:"POST",body:{workshop_id:wb,user_id:a.id,role:"owner"}})));
  check("A no puede cambiar roles",forbidden(await api("/rest/v1/workshop_memberships?user_id=eq."+a.id,{jwt:a.jwt,method:"PATCH",body:{role:"admin"}})));
  const edit=await api("/rest/v1/profiles?user_id=eq."+a.id,{jwt:a.jwt,method:"PATCH",body:{display_name:"Usuario A de prueba"},returning:true});
  check("A puede editar su nombre",edit.ok&&edit.data.length===1&&edit.data[0].display_name==="Usuario A de prueba");
  check("A no puede cambiar ID de perfil",forbidden(await api("/rest/v1/profiles?user_id=eq."+a.id,{jwt:a.jwt,method:"PATCH",body:{user_id:b.id}})));
  check("A no modifica perfil B",hidden(await api("/rest/v1/profiles?user_id=eq."+b.id,{jwt:a.jwt,method:"PATCH",body:{display_name:"No autorizado"},returning:true})));
  check("A no elimina taller B",forbidden(await api("/rest/v1/workshops?id=eq."+wb,{jwt:a.jwt,method:"DELETE"})));
  check("B no elimina taller A",forbidden(await api("/rest/v1/workshops?id=eq."+wa,{jwt:b.jwt,method:"DELETE"})));
  check("Anónimo no lee talleres",hidden(await api("/rest/v1/workshops?select=*")));
  const disable=await api("/rest/v1/workshop_memberships?workshop_id=eq."+wa+"&user_id=eq."+a.id,{service:true,method:"PATCH",body:{status:"disabled"},returning:true});
  check("Backend desactiva A",disable.ok&&disable.data.length===1&&disable.data[0].status==="disabled");
  check("A desactivado pierde lectura de taller",hidden(await get("workshops",a.jwt,"&id=eq."+wa)));
  const bafter=await get("workshops",b.jwt);
  check("B conserva acceso",bafter.ok&&bafter.data.length===1&&bafter.data[0].id===wb);
  console.log("RESULTADO: "+count+" pruebas A/B PASS. Limpieza pendiente...");
} catch(e) {
  failed=true; console.error("PRUEBAS INTERRUMPIDAS: "+(e?.message||"error"));
} finally {
  await cleanup();
  console.log("Limpieza solicitada. Verificar conteos en Supabase.");
  if (failed) process.exitCode=1;
}
