"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

const progressSchema = z.object({
  lessonId: z.uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  completed: z.enum(["true", "false"]),
});

/** RLS only lets a student mark lessons of courses they are enrolled in. */
export async function toggleLessonAction(formData: FormData) {
  const parsed = progressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { lessonId, slug, completed } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { error } =
    completed === "true"
      ? await supabase.from("lesson_progress").delete().eq("user_id", user.id).eq("lesson_id", lessonId)
      : await supabase.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lessonId }, { ignoreDuplicates: true });
  if (error) console.error("[progress] no se pudo guardar", error.message);

  revalidatePath(`/mi-cuenta/cursos/${slug}`);
}
