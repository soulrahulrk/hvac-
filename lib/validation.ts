import { z } from 'zod';

// ── Common Schemas ─────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const IdSchema = z.object({
  id: z.string().cuid(),
});

// ── Customer Validation ────────────────────────────────────────

export const CustomerCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  customerType: z.enum(['RESIDENTIAL', 'COMMERCIAL']).default('RESIDENTIAL'),
  leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'DORMANT', 'ACTIVE', 'CHURNED', 'WON', 'LOST']).default('NEW'),
});

export const CustomerUpdateSchema = CustomerCreateSchema.partial();

// ── Campaign Validation ────────────────────────────────────────

export const CampaignCreateSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  type: z.enum([
    'REACTIVATION', 'ESTIMATE_FOLLOWUP', 'MAINTENANCE_REMINDER',
    'REVIEW_REQUEST', 'REFERRAL', 'MEMBERSHIP_RENEWAL', 'SEASONAL',
    'MISSED_CALL_TEXTBACK', 'FINANCING_FOLLOWUP', 'REPEAT_CUSTOMER',
    'FEEDBACK', 'PIPELINE_ALERT', 'SMART_TAGGING'
  ]),
  channel: z.enum(['SMS', 'EMAIL', 'MULTI']).default('SMS'),
  scheduleType: z.enum(['IMMEDIATE', 'DELAYED', 'RECURRING']).default('IMMEDIATE'),
  scheduledAt: z.string().datetime().optional(),
  targetSegment: z.string().optional(),
});

// ── Message Validation ─────────────────────────────────────────

export const SendMessageSchema = z.object({
  customerId: z.string().cuid(),
  content: z.string().min(1, 'Message content cannot be empty'),
  channel: z.enum(['SMS', 'EMAIL']).default('SMS'),
  subject: z.string().optional(), // Used for emails
});
