import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const socialLinks = pgTable("social_links", {
  id: text("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
