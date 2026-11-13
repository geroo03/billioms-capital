// Hand-written to match supabase/migrations. Regenerate with
// `npx supabase gen types typescript --linked > src/lib/supabase/types.ts`
// once the project is linked.

export type CourseLevel = "inicial" | "avanzado";
export type OrderStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded";

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type CourseRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  duration_weeks: number;
  price_ars: number;
  cover_url: string | null;
  is_published: boolean;
  created_at: string;
};

export type LessonRow = {
  id: string;
  course_id: string;
  position: number;
  title: string;
  summary: string;
  video_id: string | null;
  duration_minutes: number | null;
  release_offset_days: number;
  is_preview: boolean;
};

export type OrderRow = {
  id: string;
  user_id: string;
  course_id: string;
  amount_ars: number;
  status: OrderStatus;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EnrollmentRow = {
  user_id: string;
  course_id: string;
  order_id: string | null;
  enrolled_at: string;
};

export type LessonProgressRow = {
  user_id: string;
  lesson_id: string;
  completed_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      courses: Table<CourseRow>;
      lessons: Table<LessonRow>;
      orders: Table<OrderRow, Pick<OrderRow, "user_id" | "course_id" | "amount_ars"> & Partial<OrderRow>>;
      enrollments: Table<EnrollmentRow, Pick<EnrollmentRow, "user_id" | "course_id"> & Partial<EnrollmentRow>>;
      lesson_progress: Table<LessonProgressRow, Pick<LessonProgressRow, "user_id" | "lesson_id"> & Partial<LessonProgressRow>>;
    };
    Views: Record<string, never>;
    Functions: {
      is_enrolled: { Args: { p_course_id: string }; Returns: boolean };
    };
    Enums: {
      course_level: CourseLevel;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
