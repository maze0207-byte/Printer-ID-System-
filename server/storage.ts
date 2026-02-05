import { db } from "./db";
import { 
  cards, colleges, departments, programs, levels, persons, idSequences,
  type InsertCard, type UpdateCardRequest,
  type InsertCollege, type InsertDepartment, type InsertProgram, type InsertLevel,
  type InsertPerson, type CardValidation
} from "@shared/schema";
import { eq, ilike, or, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // College operations
  getColleges(): Promise<typeof colleges.$inferSelect[]>;
  getCollege(id: number): Promise<typeof colleges.$inferSelect | undefined>;
  createCollege(college: InsertCollege): Promise<typeof colleges.$inferSelect>;
  updateCollege(id: number, updates: Partial<InsertCollege>): Promise<typeof colleges.$inferSelect>;
  deleteCollege(id: number): Promise<void>;

  // Department operations
  getDepartments(collegeId?: number): Promise<typeof departments.$inferSelect[]>;
  getDepartment(id: number): Promise<typeof departments.$inferSelect | undefined>;
  createDepartment(department: InsertDepartment): Promise<typeof departments.$inferSelect>;
  updateDepartment(id: number, updates: Partial<InsertDepartment>): Promise<typeof departments.$inferSelect>;
  deleteDepartment(id: number): Promise<void>;

  // Program operations
  getPrograms(departmentId?: number): Promise<typeof programs.$inferSelect[]>;
  getProgram(id: number): Promise<typeof programs.$inferSelect | undefined>;
  createProgram(program: InsertProgram): Promise<typeof programs.$inferSelect>;
  updateProgram(id: number, updates: Partial<InsertProgram>): Promise<typeof programs.$inferSelect>;
  deleteProgram(id: number): Promise<void>;

  // Level operations
  getLevels(): Promise<typeof levels.$inferSelect[]>;
  createLevel(level: InsertLevel): Promise<typeof levels.$inferSelect>;

  // Person operations
  getPersons(params?: { search?: string; type?: string; status?: string; collegeId?: number; departmentId?: number }): Promise<typeof persons.$inferSelect[]>;
  getPerson(id: number): Promise<typeof persons.$inferSelect | undefined>;
  getPersonByUniversityId(universityId: string): Promise<typeof persons.$inferSelect | undefined>;
  createPerson(person: InsertPerson): Promise<typeof persons.$inferSelect>;
  bulkCreatePersons(personsData: InsertPerson[]): Promise<typeof persons.$inferSelect[]>;
  updatePerson(id: number, updates: Partial<InsertPerson>): Promise<typeof persons.$inferSelect>;
  deletePerson(id: number): Promise<void>;
  validatePerson(id: number): Promise<CardValidation>;

  // Card operations
  getCards(params?: { search?: string; type?: 'student' | 'staff'; department?: string }): Promise<typeof cards.$inferSelect[]>;
  getCard(id: number): Promise<typeof cards.$inferSelect | undefined>;
  createCard(card: InsertCard): Promise<typeof cards.$inferSelect>;
  bulkCreateCards(cardsData: InsertCard[]): Promise<typeof cards.$inferSelect[]>;
  updateCard(id: number, updates: UpdateCardRequest): Promise<typeof cards.$inferSelect>;
  deleteCard(id: number): Promise<void>;
  validateCard(id: number): Promise<CardValidation>;

  // Statistics
  getDashboardStats(): Promise<{
    totalPersons: number;
    totalStudents: number;
    totalStaff: number;
    totalVisitors: number;
    totalCards: number;
    activeCards: number;
    expiredCards: number;
    totalColleges: number;
    totalDepartments: number;
    byCollege: { name: string; count: number }[];
  }>;

  // ID Generation
  generateUniversityId(type: string, collegeCode?: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // ============================================
  // COLLEGES
  // ============================================
  async getColleges(): Promise<typeof colleges.$inferSelect[]> {
    return await db.select().from(colleges).orderBy(colleges.nameEn);
  }

  async getCollege(id: number): Promise<typeof colleges.$inferSelect | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
    return college;
  }

  async createCollege(college: InsertCollege): Promise<typeof colleges.$inferSelect> {
    const [newCollege] = await db.insert(colleges).values(college).returning();
    return newCollege;
  }

  async updateCollege(id: number, updates: Partial<InsertCollege>): Promise<typeof colleges.$inferSelect> {
    const [updated] = await db.update(colleges).set(updates).where(eq(colleges.id, id)).returning();
    return updated;
  }

  async deleteCollege(id: number): Promise<void> {
    await db.delete(colleges).where(eq(colleges.id, id));
  }

  // ============================================
  // DEPARTMENTS
  // ============================================
  async getDepartments(collegeId?: number): Promise<typeof departments.$inferSelect[]> {
    if (collegeId) {
      return await db.select().from(departments).where(eq(departments.collegeId, collegeId)).orderBy(departments.nameEn);
    }
    return await db.select().from(departments).orderBy(departments.nameEn);
  }

  async getDepartment(id: number): Promise<typeof departments.$inferSelect | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<typeof departments.$inferSelect> {
    const [newDept] = await db.insert(departments).values(department).returning();
    return newDept;
  }

  async updateDepartment(id: number, updates: Partial<InsertDepartment>): Promise<typeof departments.$inferSelect> {
    const [updated] = await db.update(departments).set(updates).where(eq(departments.id, id)).returning();
    return updated;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // ============================================
  // PROGRAMS
  // ============================================
  async getPrograms(departmentId?: number): Promise<typeof programs.$inferSelect[]> {
    if (departmentId) {
      return await db.select().from(programs).where(eq(programs.departmentId, departmentId)).orderBy(programs.nameEn);
    }
    return await db.select().from(programs).orderBy(programs.nameEn);
  }

  async getProgram(id: number): Promise<typeof programs.$inferSelect | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }

  async createProgram(program: InsertProgram): Promise<typeof programs.$inferSelect> {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  }

  async updateProgram(id: number, updates: Partial<InsertProgram>): Promise<typeof programs.$inferSelect> {
    const [updated] = await db.update(programs).set(updates).where(eq(programs.id, id)).returning();
    return updated;
  }

  async deleteProgram(id: number): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // ============================================
  // LEVELS
  // ============================================
  async getLevels(): Promise<typeof levels.$inferSelect[]> {
    return await db.select().from(levels).orderBy(levels.order);
  }

  async createLevel(level: InsertLevel): Promise<typeof levels.$inferSelect> {
    const [newLevel] = await db.insert(levels).values(level).returning();
    return newLevel;
  }

  // ============================================
  // PERSONS
  // ============================================
  async getPersons(params?: { search?: string; type?: string; status?: string; collegeId?: number; departmentId?: number }): Promise<typeof persons.$inferSelect[]> {
    const conditions = [];

    if (params?.search) {
      const searchPattern = `%${params.search}%`;
      conditions.push(
        or(
          ilike(persons.fullNameEn, searchPattern),
          ilike(persons.fullNameAr ?? '', searchPattern),
          ilike(persons.universityId, searchPattern),
          ilike(persons.email ?? '', searchPattern)
        )
      );
    }

    if (params?.type) {
      conditions.push(eq(persons.type, params.type));
    }

    if (params?.status) {
      conditions.push(eq(persons.status, params.status));
    }

    if (params?.collegeId) {
      conditions.push(eq(persons.collegeId, params.collegeId));
    }

    if (params?.departmentId) {
      conditions.push(eq(persons.departmentId, params.departmentId));
    }

    return await db.select()
      .from(persons)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(persons.createdAt));
  }

  async getPerson(id: number): Promise<typeof persons.$inferSelect | undefined> {
    const [person] = await db.select().from(persons).where(eq(persons.id, id));
    return person;
  }

  async getPersonByUniversityId(universityId: string): Promise<typeof persons.$inferSelect | undefined> {
    const [person] = await db.select().from(persons).where(eq(persons.universityId, universityId));
    return person;
  }

  async createPerson(person: InsertPerson): Promise<typeof persons.$inferSelect> {
    const [newPerson] = await db.insert(persons).values(person).returning();
    return newPerson;
  }

  async bulkCreatePersons(personsData: InsertPerson[]): Promise<typeof persons.$inferSelect[]> {
    if (personsData.length === 0) return [];
    return await db.insert(persons).values(personsData).returning();
  }

  async updatePerson(id: number, updates: Partial<InsertPerson>): Promise<typeof persons.$inferSelect> {
    const [updated] = await db.update(persons)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(persons.id, id))
      .returning();
    return updated;
  }

  async deletePerson(id: number): Promise<void> {
    await db.delete(persons).where(eq(persons.id, id));
  }

  async validatePerson(id: number): Promise<CardValidation> {
    const person = await this.getPerson(id);
    if (!person) {
      return {
        hasPhoto: false,
        hasName: false,
        hasValidId: false,
        hasValidExpiry: false,
        hasDepartment: false,
        isComplete: false,
        errors: ['Person not found'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    const hasPhoto = !!person.photoUrl;
    const hasName = !!person.fullNameEn && person.fullNameEn.trim().length > 0;
    const hasValidId = !!person.universityId && person.universityId.trim().length > 0;
    const hasDepartment = !!person.departmentId;
    const hasValidExpiry = true;

    if (!hasPhoto) errors.push('Photo is missing');
    if (!hasName) errors.push('Name is required');
    if (!hasValidId) errors.push('University ID is required');
    if (!hasDepartment) warnings.push('Department not assigned');
    if (!person.fullNameAr) warnings.push('Arabic name is missing');

    return {
      hasPhoto,
      hasName,
      hasValidId,
      hasValidExpiry,
      hasDepartment,
      isComplete: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ============================================
  // CARDS
  // ============================================
  async getCards(params?: { search?: string; type?: 'student' | 'staff'; department?: string }): Promise<typeof cards.$inferSelect[]> {
    const conditions = [];

    if (params?.search) {
      const searchPattern = `%${params.search}%`;
      conditions.push(
        or(
          ilike(cards.name, searchPattern),
          ilike(cards.idNumber, searchPattern),
          ilike(cards.department, searchPattern)
        )
      );
    }

    if (params?.type) {
      conditions.push(eq(cards.type, params.type));
    }

    if (params?.department) {
      conditions.push(ilike(cards.department, params.department));
    }

    return await db.select()
      .from(cards)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(cards.createdAt));
  }

  async getCard(id: number): Promise<typeof cards.$inferSelect | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card;
  }

  async createCard(card: InsertCard): Promise<typeof cards.$inferSelect> {
    const [newCard] = await db.insert(cards).values(card).returning();
    return newCard;
  }

  async bulkCreateCards(cardsData: InsertCard[]): Promise<typeof cards.$inferSelect[]> {
    if (cardsData.length === 0) return [];
    return await db.insert(cards).values(cardsData).returning();
  }

  async updateCard(id: number, updates: UpdateCardRequest): Promise<typeof cards.$inferSelect> {
    const [updated] = await db.update(cards)
      .set(updates)
      .where(eq(cards.id, id))
      .returning();
    return updated;
  }

  async deleteCard(id: number): Promise<void> {
    await db.delete(cards).where(eq(cards.id, id));
  }

  async validateCard(id: number): Promise<CardValidation> {
    const card = await this.getCard(id);
    if (!card) {
      return {
        hasPhoto: false,
        hasName: false,
        hasValidId: false,
        hasValidExpiry: false,
        hasDepartment: false,
        isComplete: false,
        errors: ['Card not found'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    const hasPhoto = !!card.photoUrl;
    const hasName = !!card.name && card.name.trim().length > 0;
    const hasValidId = !!card.idNumber && card.idNumber.trim().length > 0;
    const hasDepartment = !!card.department && card.department.trim().length > 0;
    
    const expiryDate = card.expiryDate ? new Date(card.expiryDate) : null;
    const hasValidExpiry = !expiryDate || expiryDate > new Date();

    if (!hasPhoto) errors.push('Photo is missing');
    if (!hasName) errors.push('Name is required');
    if (!hasValidId) errors.push('ID Number is required');
    if (!hasDepartment) warnings.push('Department not specified');
    if (expiryDate && expiryDate <= new Date()) errors.push('Card has expired');

    return {
      hasPhoto,
      hasName,
      hasValidId,
      hasValidExpiry,
      hasDepartment,
      isComplete: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ============================================
  // STATISTICS
  // ============================================
  async getDashboardStats() {
    const [personsResult] = await db.select({ count: count() }).from(persons);
    const [studentsResult] = await db.select({ count: count() }).from(persons).where(eq(persons.type, 'student'));
    const [staffResult] = await db.select({ count: count() }).from(persons).where(eq(persons.type, 'staff'));
    const [visitorsResult] = await db.select({ count: count() }).from(persons).where(eq(persons.type, 'visitor'));
    const [cardsResult] = await db.select({ count: count() }).from(cards);
    const [activeCardsResult] = await db.select({ count: count() }).from(cards).where(eq(cards.status, 'active'));
    const [expiredCardsResult] = await db.select({ count: count() }).from(cards).where(eq(cards.status, 'expired'));
    const [collegesResult] = await db.select({ count: count() }).from(colleges);
    const [departmentsResult] = await db.select({ count: count() }).from(departments);

    const collegesList = await db.select().from(colleges);
    const byCollege = await Promise.all(
      collegesList.map(async (college) => {
        const [result] = await db.select({ count: count() })
          .from(persons)
          .where(eq(persons.collegeId, college.id));
        return { name: college.nameEn, count: result.count };
      })
    );

    return {
      totalPersons: personsResult.count,
      totalStudents: studentsResult.count,
      totalStaff: staffResult.count,
      totalVisitors: visitorsResult.count,
      totalCards: cardsResult.count,
      activeCards: activeCardsResult.count,
      expiredCards: expiredCardsResult.count,
      totalColleges: collegesResult.count,
      totalDepartments: departmentsResult.count,
      byCollege,
    };
  }

  // ============================================
  // ID GENERATION
  // ============================================
  async generateUniversityId(type: string, collegeCode?: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = type === 'student' ? (collegeCode || 'STU') : (type === 'staff' ? 'EMP' : 'VIS');
    const key = `${prefix}-${year}`;

    const [existing] = await db.select()
      .from(idSequences)
      .where(and(eq(idSequences.prefix, prefix), eq(idSequences.year, year)));

    let nextNumber: number;
    if (existing) {
      nextNumber = existing.nextNumber ?? 1;
      await db.update(idSequences)
        .set({ nextNumber: nextNumber + 1 })
        .where(eq(idSequences.id, existing.id));
    } else {
      nextNumber = 1;
      await db.insert(idSequences).values({ prefix, year, nextNumber: 2 });
    }

    return `${prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
  }
}

export const storage = new DatabaseStorage();
