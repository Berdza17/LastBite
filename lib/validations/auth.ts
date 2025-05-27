import * as z from 'zod'

export const authFormSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  role: z.enum(['buyer', 'seller']),
}).superRefine((data, ctx) => {
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either email or phone is required',
      path: ['email'],
    })
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either email or phone is required',
      path: ['phone'],
    })
  }
  if (data.email && !data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password is required for email login',
      path: ['password'],
    })
  }
})

export const otpFormSchema = z.object({
  token: z.string().min(6, 'OTP must be at least 6 characters'),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
}) 