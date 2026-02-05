import { z } from 'zod';
import { 
  insertCardSchema, cards,
  insertCollegeSchema, colleges,
  insertDepartmentSchema, departments,
  insertProgramSchema, programs,
  insertLevelSchema, levels,
  insertPersonSchema, persons,
  cardValidationSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // ============================================
  // COLLEGES
  // ============================================
  colleges: {
    list: {
      method: 'GET' as const,
      path: '/api/colleges',
      responses: {
        200: z.array(z.custom<typeof colleges.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/colleges/:id',
      responses: {
        200: z.custom<typeof colleges.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/colleges',
      input: insertCollegeSchema,
      responses: {
        201: z.custom<typeof colleges.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/colleges/:id',
      input: insertCollegeSchema.partial(),
      responses: {
        200: z.custom<typeof colleges.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/colleges/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // ============================================
  // DEPARTMENTS
  // ============================================
  departments: {
    list: {
      method: 'GET' as const,
      path: '/api/departments',
      input: z.object({
        collegeId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof departments.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/departments/:id',
      responses: {
        200: z.custom<typeof departments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/departments',
      input: insertDepartmentSchema,
      responses: {
        201: z.custom<typeof departments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/departments/:id',
      input: insertDepartmentSchema.partial(),
      responses: {
        200: z.custom<typeof departments.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/departments/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // ============================================
  // PROGRAMS
  // ============================================
  programs: {
    list: {
      method: 'GET' as const,
      path: '/api/programs',
      input: z.object({
        departmentId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof programs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/programs/:id',
      responses: {
        200: z.custom<typeof programs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/programs',
      input: insertProgramSchema,
      responses: {
        201: z.custom<typeof programs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/programs/:id',
      input: insertProgramSchema.partial(),
      responses: {
        200: z.custom<typeof programs.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/programs/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // ============================================
  // LEVELS
  // ============================================
  levels: {
    list: {
      method: 'GET' as const,
      path: '/api/levels',
      responses: {
        200: z.array(z.custom<typeof levels.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/levels',
      input: insertLevelSchema,
      responses: {
        201: z.custom<typeof levels.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // ============================================
  // PERSONS
  // ============================================
  persons: {
    list: {
      method: 'GET' as const,
      path: '/api/persons',
      input: z.object({
        search: z.string().optional(),
        type: z.enum(['student', 'staff', 'visitor']).optional(),
        status: z.enum(['active', 'expired', 'suspended']).optional(),
        collegeId: z.number().optional(),
        departmentId: z.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof persons.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/persons/:id',
      responses: {
        200: z.custom<typeof persons.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/persons',
      input: insertPersonSchema,
      responses: {
        201: z.custom<typeof persons.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    bulkCreate: {
      method: 'POST' as const,
      path: '/api/persons/bulk',
      input: z.array(insertPersonSchema),
      responses: {
        201: z.array(z.custom<typeof persons.$inferSelect>()),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/persons/:id',
      input: insertPersonSchema.partial(),
      responses: {
        200: z.custom<typeof persons.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/persons/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    validate: {
      method: 'POST' as const,
      path: '/api/persons/:id/validate',
      responses: {
        200: cardValidationSchema,
        404: errorSchemas.notFound,
      },
    },
  },

  // ============================================
  // CARDS (Legacy + Enhanced)
  // ============================================
  cards: {
    list: {
      method: 'GET' as const,
      path: '/api/cards',
      input: z.object({
        search: z.string().optional(),
        type: z.enum(['student', 'staff']).optional(),
        department: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof cards.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cards/:id',
      responses: {
        200: z.custom<typeof cards.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cards',
      input: insertCardSchema,
      responses: {
        201: z.custom<typeof cards.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    bulkCreate: {
      method: 'POST' as const,
      path: '/api/cards/bulk',
      input: z.array(insertCardSchema),
      responses: {
        201: z.array(z.custom<typeof cards.$inferSelect>()),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cards/:id',
      input: insertCardSchema.partial(),
      responses: {
        200: z.custom<typeof cards.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cards/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    validate: {
      method: 'POST' as const,
      path: '/api/cards/:id/validate',
      responses: {
        200: cardValidationSchema,
        404: errorSchemas.notFound,
      },
    },
  },

  // ============================================
  // STATISTICS
  // ============================================
  stats: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/stats/dashboard',
      responses: {
        200: z.object({
          totalPersons: z.number(),
          totalStudents: z.number(),
          totalStaff: z.number(),
          totalVisitors: z.number(),
          totalCards: z.number(),
          activeCards: z.number(),
          expiredCards: z.number(),
          totalColleges: z.number(),
          totalDepartments: z.number(),
          byCollege: z.array(z.object({
            name: z.string(),
            count: z.number(),
          })),
        }),
      },
    },
  },

  // ============================================
  // ID GENERATION
  // ============================================
  generateId: {
    next: {
      method: 'POST' as const,
      path: '/api/generate-id',
      input: z.object({
        type: z.enum(['student', 'staff', 'visitor']),
        collegeCode: z.string().optional(),
      }),
      responses: {
        200: z.object({
          universityId: z.string(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
