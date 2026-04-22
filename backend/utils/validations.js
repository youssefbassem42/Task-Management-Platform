const { z } = require('zod');

// User Authentication & Profile
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character")
      .optional(),
  }).refine((data) => {
    // If newPassword is provided, currentPassword is required
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  }, {
    message: "Current password is required to set a new password",
    path: ["currentPassword"],
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
  }),
});

// Board Schemas
const createBoardSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Board name is required").max(120, "Board name is too long"),
    description: z.string().max(2000).optional(),
    memberIds: z.array(z.string()).optional(),
  }),
});

const updateBoardSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    memberIds: z.array(z.string()).optional(),
  }),
});

// Task Schemas
const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required").max(200, "Task title is too long"),
    description: z.string().max(8000).optional(),
    emoji: z.string().max(16).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigneeId: z.string().optional().nullable(),
    assigneeIds: z.array(z.string()).optional(),
    keywords: z.array(z.string().max(40)).optional(),
    checklist: z
      .array(
        z.object({
          text: z.string().min(1).max(240),
          completed: z.boolean().optional(),
          _id: z.string().optional(),
        })
      )
      .optional(),
    startDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(8000).optional(),
    emoji: z.string().max(16).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigneeId: z.string().optional().nullable(),
    assigneeIds: z.array(z.string()).optional(),
    keywords: z.array(z.string().max(40)).optional(),
    checklist: z
      .array(
        z.object({
          text: z.string().min(1).max(240),
          completed: z.boolean().optional(),
          _id: z.string().optional(),
        })
      )
      .optional(),
    startDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createBoardSchema,
  updateBoardSchema,
  createTaskSchema,
  updateTaskSchema,
};
