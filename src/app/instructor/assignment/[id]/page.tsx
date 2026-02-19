'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Assignment = {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  instructor: { name: string };
  submissions: Array<{
    id: string;
    status: string;
    score: number | null;
    plagiarismRisk: string | null;
    feedbackSummary: string | null;
    feedbackDetail: string | null;
    student: { name: string; email: string };
    createdAt: string;
    content?: string;
  }>;
};

export default function InstructorAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<typeof assignment extends null ? null : Assignment['submissions'][0] | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/assignments/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAssignment(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !id) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (!assignment) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-red-400">Assignment not found.</p>
        <Link href="/instructor" className="text-emerald-400 mt-2 inline-block">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link
        href="/instructor"
        className="text-slate-400 hover:text-emerald-400 transition mb-6 inline-block"
      >
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-emerald-400 mb-2">
        {assignment.title}
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        by {assignment.instructor.name} · max score {assignment.maxScore}
      </p>
      <p className="text-slate-300 mb-8 whitespace-pre-wrap">
        {assignment.description}
      </p>

      <h2 className="text-lg font-semibold text-slate-200 mb-4">
        Submissions ({assignment.submissions.length})
      </h2>
      {assignment.submissions.length === 0 ? (
        <p className="text-slate-500">No submissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {assignment.submissions.map((s) => (
            <li
              key={s.id}
              className="rounded-xl bg-slate-800/50 border border-slate-700 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-slate-200">
                    {s.student.name}
                  </span>
                  <span className="text-slate-500 text-sm ml-2">
                    {s.student.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400">
                    Score: {s.score ?? '—'} / {assignment.maxScore}
                  </span>
                  <span className="text-slate-400">
                    Plagiarism: {s.plagiarismRisk ?? '—'}
                  </span>
                  <button
                    onClick={() => setSelectedSubmission(s)}
                    className="text-emerald-400 hover:underline"
                  >
                    Review feedback
                  </button>
                </div>
              </div>
              {s.feedbackSummary && (
                <p className="text-slate-400 text-sm mt-2 truncate">
                  {s.feedbackSummary}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-10"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="rounded-xl bg-slate-800 border border-slate-600 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-200">
                {selectedSubmission.student.name} – AI feedback
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-slate-500">Score:</span>{' '}
                {selectedSubmission.score ?? '—'} / {assignment.maxScore}
              </p>
              <p>
                <span className="text-slate-500">Plagiarism risk:</span>{' '}
                {selectedSubmission.plagiarismRisk ?? '—'}
              </p>
              <p>
                <span className="text-slate-500">Summary:</span>{' '}
                {selectedSubmission.feedbackSummary ?? '—'}
              </p>
              {selectedSubmission.feedbackDetail && (
                <p>
                  <span className="text-slate-500">Detail:</span>{' '}
                  {selectedSubmission.feedbackDetail}
                </p>
              )}
              {selectedSubmission.content && (
                <div>
                  <span className="text-slate-500 block mb-1">
                    Submission content:
                  </span>
                  <pre className="bg-slate-900 rounded p-3 text-slate-300 whitespace-pre-wrap text-xs max-h-48 overflow-y-auto">
                    {selectedSubmission.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
