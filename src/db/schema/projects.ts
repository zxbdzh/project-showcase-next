import { pgEnum, pgTable, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { categories } from "./taxonomy";

export const projectStatusEnum = pgEnum("project_status", ["draft", "published"]);

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content"),
    coverImage: text("cover_image"),
    demoUrl: text("demo_url"),
    repoUrl: text("repo_url"),
    techStack: text("tech_stack").array(),
    featured: boolean("featured").default(false).notNull(),
    status: projectStatusEnum("status").default("draft").notNull(),
    views: integer("views").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("projects_slug_idx").on(table.slug),
    index("projects_category_idx").on(table.categoryId),
  ]
);
