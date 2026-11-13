# Billions Capital: plataforma de cursos

Web para vender y cursar los cursos de finanzas de Billions Capital.

**Stack:** Next.js 15 (App Router) · Supabase (auth por enlace mágico, Postgres con RLS) · Mercado Pago Checkout Pro · Bunny Stream (video con token firmado) · Tailwind CSS.

## Cómo funciona la compra

1. El alumno toca "Comprar" en la página del curso. Si no inició sesión, se le pide el email y recibe un enlace.
2. El servidor crea una orden con el precio **leído de la base** (nunca del navegador) y una preferencia de Mercado Pago con `external_reference = order.id`.
3. Mercado Pago notifica a `/api/webhooks/mercadopago`. El endpoint valida la firma `x-signature`, vuelve a leer el pago desde la API de Mercado Pago y, si está aprobado por el monto y moneda correctos, crea la inscripción. Es idempotente: repetir la notificación no duplica nada. Reembolsos y contracargos quitan el acceso.
4. El alumno ve sus cursos en `/mi-cuenta`. Cada clase se habilita `release_offset_days` días después de la inscripción, y el video se sirve con una URL firmada que vence a las 2 horas.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar las variables
npm run dev
```

### Base de datos

Con la [CLI de Supabase](https://supabase.com/docs/guides/local-development):

```bash
npx supabase link --project-ref <ref>
npx supabase db push              # aplica supabase/migrations
psql "$DATABASE_URL" -f supabase/seed.sql   # cursos de ejemplo (opcional)
```

En Supabase > Authentication > URL Configuration, agregar `<NEXT_PUBLIC_SITE_URL>/auth/callback` a las Redirect URLs.

### Mercado Pago

- Usar credenciales de **prueba** en desarrollo.
- Configurar el webhook (evento *Pagos*) apuntando a `<NEXT_PUBLIC_SITE_URL>/api/webhooks/mercadopago` y copiar la clave secreta en `MERCADOPAGO_WEBHOOK_SECRET`. En local hace falta un túnel (por ejemplo `cloudflared` o `ngrok`).

### Bunny Stream

Crear una Video Library, activar *Token Authentication* y copiar el Library ID y la clave. El `video_id` de cada clase se carga en la tabla `lessons`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests de reglas de pago, firma del webhook, calendario y redirecciones |
| `npm run typecheck` | Chequeo de tipos |
| `npm run lint` | ESLint |

## Pendiente (fase 2)

- Panel de administración para cargar cursos y clases (hoy se cargan desde Supabase Studio).
- Certificado PDF al completar.
- Emails de bienvenida y aviso de clase nueva.
