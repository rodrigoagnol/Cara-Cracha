import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, float, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de crianças
export const children = mysqlTable("children", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  age: int("age"),
  classroom: varchar("classroom", { length: 100 }),
  photoUrl: text("photoUrl"),
  faceEmbedding: json("faceEmbedding"), // Array de números do embedding facial
  parentPhone: varchar("parentPhone", { length: 20 }),
  parentEmail: varchar("parentEmail", { length: 320 }),
  parentName: varchar("parentName", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Child = typeof children.$inferSelect;
export type InsertChild = typeof children.$inferInsert;

// Tabela de responsáveis autorizados
export const guardians = mysqlTable("guardians", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 20 }).notNull().unique(),
  relationship: varchar("relationship", { length: 100 }), // pai, mãe, avó, avô, tio, etc
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  photoUrl: text("photoUrl"),
  faceEmbedding: json("faceEmbedding"), // Array de números do embedding facial
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Guardian = typeof guardians.$inferSelect;
export type InsertGuardian = typeof guardians.$inferInsert;

// Tabela de autorizações (responsáveis autorizados para cada criança)
export const authorizations = mysqlTable("authorizations", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  guardianId: int("guardianId").notNull(),
  isAuthorized: boolean("isAuthorized").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Authorization = typeof authorizations.$inferSelect;
export type InsertAuthorization = typeof authorizations.$inferInsert;

// Tabela de histórico de saídas
export const exitLogs = mysqlTable("exitLogs", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  guardianId: int("guardianId"),
  guardianPhotoUrl: text("guardianPhotoUrl"), // Foto capturada na portaria
  childPhotoUrl: text("childPhotoUrl"), // Foto da criança para referência
  isAuthorized: boolean("isAuthorized").notNull(),
  matchConfidence: float("matchConfidence"), // Confiança do matching (0-1)
  status: mysqlEnum("status", ["approved", "denied", "pending", "manual_review"]).default("approved").notNull(),
  notes: text("notes"),
  exitTime: timestamp("exitTime").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExitLog = typeof exitLogs.$inferSelect;
export type InsertExitLog = typeof exitLogs.$inferInsert;

// Relações
export const childrenRelations = relations(children, ({ many }) => ({
  authorizations: many(authorizations),
  exitLogs: many(exitLogs),
}));

export const guardiansRelations = relations(guardians, ({ many }) => ({
  authorizations: many(authorizations),
  exitLogs: many(exitLogs),
}));

export const authorizationsRelations = relations(authorizations, ({ one }) => ({
  child: one(children, {
    fields: [authorizations.childId],
    references: [children.id],
  }),
  guardian: one(guardians, {
    fields: [authorizations.guardianId],
    references: [guardians.id],
  }),
}));

export const exitLogsRelations = relations(exitLogs, ({ one }) => ({
  child: one(children, {
    fields: [exitLogs.childId],
    references: [children.id],
  }),
  guardian: one(guardians, {
    fields: [exitLogs.guardianId],
    references: [guardians.id],
  }),
}));