-- Datos de ejemplo. Títulos y precios son provisorios hasta confirmarlos con el cliente.
insert into public.courses (slug, title, subtitle, description, level, duration_weeks, price_ars, is_published) values
  ('finanzas-personales', 'Finanzas personales', 'Ordená tu plata, ahorrá y armá tu primer fondo de emergencia.',
   'Un curso para empezar desde cero: presupuesto, deudas, ahorro en pesos y en dólares, y cómo pensar tus objetivos.', 'inicial', 12, 45000, true),
  ('inversiones-desde-cero', 'Inversiones desde cero', 'Acciones, bonos, CEDEARs y fondos explicados sin vueltas.',
   'Aprendé cómo funciona el mercado argentino e internacional, cómo abrir una cuenta en un broker y cómo armar una cartera según tu perfil.', 'inicial', 12, 60000, true),
  ('trading-profesional', 'Trading profesional', 'Análisis técnico, gestión del riesgo y psicología del trader.',
   'Para quienes ya invierten y quieren operar con un método: lectura de gráficos, indicadores, planes de trading y control del riesgo.', 'avanzado', 24, 120000, true);

insert into public.lessons (course_id, position, title, summary, release_offset_days, is_preview)
select c.id, l.position, l.title, l.summary, l.offset_days, l.position = 1
from public.courses c
cross join (values
  (1, 'Bienvenida y cómo se cursa', 'Qué vas a aprender y cómo aprovechar el curso.', 0),
  (2, 'Conceptos base', 'El vocabulario que vas a usar en todo el curso.', 2),
  (3, 'Primer caso práctico', 'Aplicamos lo visto a un ejemplo real.', 7)
) as l(position, title, summary, offset_days);
