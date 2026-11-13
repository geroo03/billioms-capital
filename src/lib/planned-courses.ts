// Courses the client plans to launch. Shown as "Próximamente" only while the
// catalog in the database is empty, so the site never looks broken before
// real courses (with real prices) are loaded.
export interface PlannedCourse {
  title: string;
  topic: string;
  level: "inicial" | "avanzado";
  blurb: string;
}

export const PLANNED_COURSES: readonly PlannedCourse[] = [
  {
    title: "Finanzas personales",
    topic: "Finanzas",
    level: "inicial",
    blurb: "Ordená tus ingresos, armá un presupuesto y empezá a ahorrar con un plan.",
  },
  {
    title: "Inversiones desde cero",
    topic: "Inversiones",
    level: "inicial",
    blurb: "Plazo fijo, bonos, acciones y CEDEARs explicados en simple para dar el primer paso.",
  },
  {
    title: "Trading profesional",
    topic: "Trading",
    level: "avanzado",
    blurb: "Análisis técnico, gestión del riesgo y armado de un plan de operación propio.",
  },
];

export const TOPICS: readonly string[] = [
  "Finanzas personales",
  "Inversiones",
  "Trading",
  "Cripto y Bitcoin",
  "IA para negocios",
  "Emprender",
  "Análisis fundamental",
  "Economía y mercados",
  "Ventas",
];
