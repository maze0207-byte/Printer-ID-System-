import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============================================
  // COLLEGES
  // ============================================
  app.get(api.colleges.list.path, async (req, res) => {
    try {
      const colleges = await storage.getColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.colleges.get.path, async (req, res) => {
    try {
      const college = await storage.getCollege(Number(req.params.id));
      if (!college) {
        return res.status(404).json({ message: 'College not found' });
      }
      res.json(college);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.colleges.create.path, async (req, res) => {
    try {
      const input = api.colleges.create.input.parse(req.body);
      const college = await storage.createCollege(input);
      res.status(201).json(college);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.colleges.update.path, async (req, res) => {
    try {
      const input = api.colleges.update.input.parse(req.body);
      const college = await storage.updateCollege(Number(req.params.id), input);
      if (!college) {
        return res.status(404).json({ message: 'College not found' });
      }
      res.json(college);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.colleges.delete.path, async (req, res) => {
    try {
      await storage.deleteCollege(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // DEPARTMENTS
  // ============================================
  app.get(api.departments.list.path, async (req, res) => {
    try {
      const collegeId = req.query.collegeId ? Number(req.query.collegeId) : undefined;
      const departments = await storage.getDepartments(collegeId);
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.departments.get.path, async (req, res) => {
    try {
      const department = await storage.getDepartment(Number(req.params.id));
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.departments.create.path, async (req, res) => {
    try {
      const input = api.departments.create.input.parse(req.body);
      const department = await storage.createDepartment(input);
      res.status(201).json(department);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.departments.update.path, async (req, res) => {
    try {
      const input = api.departments.update.input.parse(req.body);
      const department = await storage.updateDepartment(Number(req.params.id), input);
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
      res.json(department);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.departments.delete.path, async (req, res) => {
    try {
      await storage.deleteDepartment(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // PROGRAMS
  // ============================================
  app.get(api.programs.list.path, async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const programs = await storage.getPrograms(departmentId);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.programs.get.path, async (req, res) => {
    try {
      const program = await storage.getProgram(Number(req.params.id));
      if (!program) {
        return res.status(404).json({ message: 'Program not found' });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.programs.create.path, async (req, res) => {
    try {
      const input = api.programs.create.input.parse(req.body);
      const program = await storage.createProgram(input);
      res.status(201).json(program);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.programs.update.path, async (req, res) => {
    try {
      const input = api.programs.update.input.parse(req.body);
      const program = await storage.updateProgram(Number(req.params.id), input);
      if (!program) {
        return res.status(404).json({ message: 'Program not found' });
      }
      res.json(program);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.programs.delete.path, async (req, res) => {
    try {
      await storage.deleteProgram(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // LEVELS
  // ============================================
  app.get(api.levels.list.path, async (req, res) => {
    try {
      const levels = await storage.getLevels();
      res.json(levels);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.levels.create.path, async (req, res) => {
    try {
      const input = api.levels.create.input.parse(req.body);
      const level = await storage.createLevel(input);
      res.status(201).json(level);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // PERSONS
  // ============================================
  app.get(api.persons.list.path, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const collegeId = req.query.collegeId ? Number(req.query.collegeId) : undefined;
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      
      const persons = await storage.getPersons({ search, type, status, collegeId, departmentId });
      res.json(persons);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.persons.get.path, async (req, res) => {
    try {
      const person = await storage.getPerson(Number(req.params.id));
      if (!person) {
        return res.status(404).json({ message: 'Person not found' });
      }
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.persons.create.path, async (req, res) => {
    try {
      const input = api.persons.create.input.parse(req.body);
      const person = await storage.createPerson(input);
      res.status(201).json(person);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      if (err instanceof Error && 'code' in err && (err as any).code === '23505') {
        return res.status(400).json({ message: "A person with this University ID already exists", field: "universityId" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.persons.bulkCreate.path, async (req, res) => {
    try {
      const input = api.persons.bulkCreate.input.parse(req.body);
      const persons = await storage.bulkCreatePersons(input);
      res.status(201).json(persons);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.persons.update.path, async (req, res) => {
    try {
      const input = api.persons.update.input.parse(req.body);
      const person = await storage.updatePerson(Number(req.params.id), input);
      if (!person) {
        return res.status(404).json({ message: 'Person not found' });
      }
      res.json(person);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.persons.delete.path, async (req, res) => {
    try {
      await storage.deletePerson(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.persons.validate.path, async (req, res) => {
    try {
      const validation = await storage.validatePerson(Number(req.params.id));
      res.json(validation);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // CARDS
  // ============================================
  app.get(api.cards.list.path, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const type = req.query.type as 'student' | 'staff' | undefined;
      const department = req.query.department as string | undefined;
      
      const cards = await storage.getCards({ search, type, department });
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.cards.get.path, async (req, res) => {
    try {
      const card = await storage.getCard(Number(req.params.id));
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.cards.create.path, async (req, res) => {
    try {
      const input = api.cards.create.input.parse(req.body);
      const card = await storage.createCard(input);
      res.status(201).json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      if (err instanceof Error && 'code' in err && (err as any).code === '23505') {
         return res.status(400).json({ message: "A card with this ID Number already exists", field: "idNumber" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.cards.bulkCreate.path, async (req, res) => {
    try {
      const input = api.cards.bulkCreate.input.parse(req.body);
      const cards = await storage.bulkCreateCards(input);
      res.status(201).json(cards);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      if (err instanceof Error && 'code' in err && (err as any).code === '23505') {
         return res.status(400).json({ message: "One or more cards have duplicate ID Numbers" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.cards.update.path, async (req, res) => {
    try {
      const input = api.cards.update.input.parse(req.body);
      const card = await storage.updateCard(Number(req.params.id), input);
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
      res.json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.cards.delete.path, async (req, res) => {
    try {
      await storage.deleteCard(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.cards.validate.path, async (req, res) => {
    try {
      const validation = await storage.validateCard(Number(req.params.id));
      res.json(validation);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // STATISTICS
  // ============================================
  app.get(api.stats.dashboard.path, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============================================
  // ID GENERATION
  // ============================================
  app.post(api.generateId.next.path, async (req, res) => {
    try {
      const input = api.generateId.next.input.parse(req.body);
      const universityId = await storage.generateUniversityId(input.type, input.collegeCode);
      res.json({ universityId });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCards = await storage.getCards();
  if (existingCards.length === 0) {
    const seedCards = [
      {
        name: "Alex Johnson",
        idNumber: "STU2024001",
        cardNumber: "CARD-STU2024001",
        type: "student",
        department: "Computer Science",
        program: "B.Sc. Software Engineering",
        year: "2024",
        status: "active"
      },
      {
        name: "Sarah Williams",
        idNumber: "STU2024002",
        cardNumber: "CARD-STU2024002",
        type: "student",
        department: "Engineering",
        program: "B.Eng. Mechanical",
        year: "2024",
        status: "active"
      },
      {
        name: "Dr. Robert Smith",
        idNumber: "STAFF001",
        cardNumber: "CARD-STAFF001",
        type: "staff",
        department: "Faculty of Science",
        status: "active"
      },
      {
        name: "Emily Brown",
        idNumber: "STAFF002",
        cardNumber: "CARD-STAFF002",
        type: "staff",
        department: "Administration",
        status: "active"
      }
    ];

    try {
      await storage.bulkCreateCards(seedCards);
      console.log("Database seeded with initial cards");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  // Seed university structure
  const existingColleges = await storage.getColleges();
  if (existingColleges.length === 0) {
    try {
      const engineering = await storage.createCollege({
        nameEn: "Faculty of Engineering",
        nameAr: "كلية الهندسة",
        code: "ENG"
      });

      const cs = await storage.createCollege({
        nameEn: "Faculty of Computer Science",
        nameAr: "كلية علوم الحاسب",
        code: "CS"
      });

      const business = await storage.createCollege({
        nameEn: "Faculty of Business",
        nameAr: "كلية إدارة الأعمال",
        code: "BUS"
      });

      // Departments for Engineering
      await storage.createDepartment({
        collegeId: engineering.id,
        nameEn: "Mechanical Engineering",
        nameAr: "الهندسة الميكانيكية",
        code: "ME"
      });

      await storage.createDepartment({
        collegeId: engineering.id,
        nameEn: "Electrical Engineering",
        nameAr: "الهندسة الكهربائية",
        code: "EE"
      });

      // Departments for CS
      await storage.createDepartment({
        collegeId: cs.id,
        nameEn: "Software Engineering",
        nameAr: "هندسة البرمجيات",
        code: "SE"
      });

      await storage.createDepartment({
        collegeId: cs.id,
        nameEn: "Information Systems",
        nameAr: "نظم المعلومات",
        code: "IS"
      });

      // Levels
      await storage.createLevel({ nameEn: "Level 1 - Freshman", nameAr: "المستوى الأول", order: 1 });
      await storage.createLevel({ nameEn: "Level 2 - Sophomore", nameAr: "المستوى الثاني", order: 2 });
      await storage.createLevel({ nameEn: "Level 3 - Junior", nameAr: "المستوى الثالث", order: 3 });
      await storage.createLevel({ nameEn: "Level 4 - Senior", nameAr: "المستوى الرابع", order: 4 });

      console.log("Database seeded with university structure");
    } catch (error) {
      console.error("Error seeding university structure:", error);
    }
  }
}
