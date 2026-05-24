import { relations } from "drizzle-orm";
import { users, accounts, sessions } from "./auth";
import { profiles } from "./profiles";
import { projects } from "./projects";
import { categories, tags, projectsToTags } from "./taxonomy";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  accounts: many(accounts),
  sessions: many(sessions),
  projects: many(projects),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  category: one(categories, { fields: [projects.categoryId], references: [categories.id] }),
  tags: many(projectsToTags),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  projects: many(projects),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  projects: many(projectsToTags),
}));

export const projectsToTagsRelations = relations(projectsToTags, ({ one }) => ({
  project: one(projects, { fields: [projectsToTags.projectId], references: [projects.id] }),
  tag: one(tags, { fields: [projectsToTags.tagId], references: [tags.id] }),
}));
