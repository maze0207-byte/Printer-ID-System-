import { pgTable, text, serial, timestamp, integer, date, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================
// UNIVERSITY STRUCTURE
// ============================================

export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").references(() => colleges.id).notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").references(() => departments.id).notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  code: text("code").notNull().unique(),
  durationYears: integer("duration_years").default(4),
  createdAt: timestamp("created_at").defaultNow(),
});

export const levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// PERSONS (Students, Staff, Visitors)
// ============================================

export const persons = pgTable("persons", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'student' | 'staff' | 'visitor'
  universityId: text("university_id").notNull().unique(),
  nationalId: text("national_id"),
  fullNameEn: text("full_name_en").notNull(),
  fullNameAr: text("full_name_ar"),
  email: text("email"),
  phone: text("phone"),
  collegeId: integer("college_id").references(() => colleges.id),
  departmentId: integer("department_id").references(() => departments.id),
  programId: integer("program_id").references(() => programs.id),
  levelId: integer("level_id").references(() => levels.id),
  position: text("position"),
  photoUrl: text("photo_url"),
  status: text("status").default("active"), // 'active' | 'expired' | 'suspended'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// CARDS
// ============================================

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").references(() => persons.id),
  cardNumber: text("card_number"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  status: text("status").default("active"), // 'active' | 'expired' | 'suspended' | 'revoked'
  printCount: integer("print_count").default(0),
  lastPrintedAt: timestamp("last_printed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Legacy fields for backward compatibility
  name: text("name").notNull(),
  idNumber: text("id_number").notNull().unique(),
  type: text("type").notNull(),
  department: text("department").notNull(),
  program: text("program"),
  year: text("year"),
  photoUrl: text("photo_url"),
  email: text("email"),
});

// ============================================
// USERS & ROLES (Phase 2)
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  status: text("status").default("active"), // 'active' | 'inactive' | 'locked'
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameAr: text("name_ar"),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// AUDIT LOGS (Phase 2)
// ============================================

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // 'create' | 'update' | 'delete' | 'print' | 'login' | 'logout'
  entityType: text("entity_type").notNull(), // 'person' | 'card' | 'college' | etc.
  entityId: integer("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// PRINT JOBS (Phase 2)
// ============================================

export const printJobs = pgTable("print_jobs", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").references(() => users.id),
  templateId: integer("template_id"),
  status: text("status").default("pending"), // 'pending' | 'processing' | 'completed' | 'failed'
  totalCards: integer("total_cards").default(0),
  successCount: integer("success_count").default(0),
  failedCount: integer("failed_count").default(0),
  printerName: text("printer_name"),
  settings: jsonb("settings"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const printItems = pgTable("print_items", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => printJobs.id).notNull(),
  cardId: integer("card_id").references(() => cards.id).notNull(),
  status: text("status").default("pending"), // 'pending' | 'success' | 'failed' | 'skipped'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// IMPORT JOBS (Phase 2)
// ============================================

export const importJobs = pgTable("import_jobs", {
  id: serial("id").primaryKey(),
  createdBy: integer("created_by").references(() => users.id),
  fileName: text("file_name"),
  status: text("status").default("pending"), // 'pending' | 'mapping' | 'validating' | 'importing' | 'completed' | 'failed'
  columnMapping: jsonb("column_mapping"),
  totalRows: integer("total_rows").default(0),
  successCount: integer("success_count").default(0),
  failedCount: integer("failed_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const importErrors = pgTable("import_errors", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => importJobs.id).notNull(),
  rowNumber: integer("row_number").notNull(),
  fieldName: text("field_name"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// TEMPLATES (Phase 3)
// ============================================

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'student' | 'staff' | 'visitor'
  layoutJson: jsonb("layout_json"),
  isDefault: boolean("is_default").default(false),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// ID SEQUENCES (Auto ID Generation)
// ============================================

export const idSequences = pgTable("id_sequences", {
  id: serial("id").primaryKey(),
  prefix: text("prefix").notNull(),
  year: integer("year").notNull(),
  nextNumber: integer("next_number").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// INSERT SCHEMAS
// ============================================

export const insertCollegeSchema = createInsertSchema(colleges).omit({ id: true, createdAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true });
export const insertLevelSchema = createInsertSchema(levels).omit({ id: true, createdAt: true });
export const insertPersonSchema = createInsertSchema(persons).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLoginAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertPrintJobSchema = createInsertSchema(printJobs).omit({ id: true, createdAt: true });
export const insertImportJobSchema = createInsertSchema(importJobs).omit({ id: true, createdAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true, updatedAt: true });

// ============================================
// TYPES
// ============================================

export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export type Level = typeof levels.$inferSelect;
export type InsertLevel = z.infer<typeof insertLevelSchema>;

export type Person = typeof persons.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;

export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type PrintJob = typeof printJobs.$inferSelect;
export type InsertPrintJob = z.infer<typeof insertPrintJobSchema>;

export type ImportJob = typeof importJobs.$inferSelect;
export type InsertImportJob = z.infer<typeof insertImportJobSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

// Legacy types for backward compatibility
export type CreateCardRequest = InsertCard;
export type UpdateCardRequest = Partial<InsertCard>;

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const cardValidationSchema = z.object({
  hasPhoto: z.boolean(),
  hasName: z.boolean(),
  hasValidId: z.boolean(),
  hasValidExpiry: z.boolean(),
  hasDepartment: z.boolean(),
  isComplete: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type CardValidation = z.infer<typeof cardValidationSchema>;
