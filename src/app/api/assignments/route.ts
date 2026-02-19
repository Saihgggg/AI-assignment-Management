import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  maxScore: z.number().int().min(0).max(100).default(100),
  dueDate: z.string().datetime().optional(),
  instructorId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const assignments = await prisma.assignment.findMany({
      where: instructorId ? { instructorId } : undefined,
      include: { instructor: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assignments);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { dueDate, ...rest } = parsed.data;
    const assignment = await prisma.assignment.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { instructor: { select: { name: true } } },
    });
    return NextResponse.json(assignment);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
