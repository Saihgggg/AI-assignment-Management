import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { evaluateSubmission } from '@/lib/evaluation';

const createSchema = z.object({
  assignmentId: z.string().min(1),
  studentId: z.string().min(1),
  content: z.string().min(1),
  fileName: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');
    const submissions = await prisma.submission.findMany({
      where: {
        ...(assignmentId && { assignmentId }),
        ...(studentId && { studentId }),
      },
      include: {
        assignment: { select: { title: true, maxScore: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(submissions);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
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
    const { assignmentId, studentId, content, fileName } = parsed.data;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const otherSubmissions = await prisma.submission.findMany({
      where: { assignmentId, content: { not: '' } },
      select: { content: true },
    });
    const otherTexts = otherSubmissions.map((s) => s.content).filter(Boolean);

    const result = evaluateSubmission(
      content,
      otherTexts,
      assignment.description,
      assignment.maxScore
    );

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        content,
        fileName: fileName ?? null,
        status: 'evaluated',
        score: result.score,
        plagiarismRisk: result.plagiarism_risk,
        feedbackSummary: result.feedback_summary,
        feedbackDetail: result.feedback_detail ?? null,
        evaluatedAt: new Date(),
      },
      include: {
        assignment: { select: { title: true } },
        student: { select: { name: true } },
      },
    });

    return NextResponse.json({
      submission_id: submission.id,
      plagiarism_risk: result.plagiarism_risk,
      feedback_summary: result.feedback_summary,
      score: result.score,
      submission,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
