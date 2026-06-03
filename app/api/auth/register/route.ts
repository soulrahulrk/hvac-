import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  orgName: z.string().min(2, 'Company name is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = RegisterSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create a slug from the org name
    const orgSlug = validatedData.orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    // Hash the password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create Org and User in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: validatedData.orgName,
          slug: orgSlug,
          plan: 'FOUNDATION',
        }
      });

      return await tx.user.create({
        data: {
          orgId: org.id,
          email: validatedData.email,
          passwordHash,
          name: validatedData.name,
          role: 'OWNER',
        }
      });
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
