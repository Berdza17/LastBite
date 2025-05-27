import * as z from 'zod'

export const authFormSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  role: z.enum(['buyer', 'seller']),
}).superRefine((data, ctx) => {
  // Only validate email/password combination if email is provided
  if (data.email && !data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password is required for email login',
      path: ['password'],
    })
  }
  
  // Only validate phone if neither email nor password is provided
  if (!data.email && !data.password && !data.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either email/password or phone is required',
      path: ['email'],
    })
  }
})

export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registrationFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'seller']),
})

export const otpFormSchema = z.object({
  token: z.string().min(6, 'Verification code must be at least 6 characters'),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
}) 