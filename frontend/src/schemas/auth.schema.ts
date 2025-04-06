import z from "zod";

export const SignUpSchema = z
  .object({
    firstName: z.string().min(2, "Must be minimum of 2 characters"),
    lastName: z.string().min(2, "Must be minimum of 2 characters"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().nonempty("Confirm password is required"),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number format") // Supports international numbers
      .optional(),
    profilePicture: z.string().optional(),
    role: z.enum(["teamMember", "teamLeader"], {
      message: "Invalid role choice.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
