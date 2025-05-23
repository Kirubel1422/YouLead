import zod from "zod";

export const SignupSchema = zod.object({
  firstName: zod.string().min(2, "Must be minimum of 2 characters"),
  lastName: zod.string().min(2, "Must be minimum of 2 characters"),
  email: zod.string().email("Invalid email"),
  password: zod
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  phoneNumber: zod
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number format") // Supports international numbers
    .optional(),
  profilePicture: zod.string().optional(),
  role: zod.enum(["teamMember", "teamLeader"], {
    message: "Invalid role.",
  }),
  workRole: zod.string().min(1, "Work role is required."),
});

export const SigninSchema = zod.object({
  email: zod.string().email("Invalid email"),
  password: zod
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const ChangePasswordSchema = zod.object({
  oldPassword: zod
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  newPassword: zod
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  email: zod.string().email("Invalid email"),
});
