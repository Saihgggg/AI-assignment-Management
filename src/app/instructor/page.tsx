'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type User = { id: string; name: string; email: string; role: string };
type Assignment = {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  instructorId: string;
  submissions?: Submission[];
};
type Submission = {
  id: string;
  assignmentId: string;
  status: string;
  score: number | null;
  plagiarismRisk: string | null;
  feedbackSummary: string | null;
  feedbackDetail: string | null;
  student: { name: string; email: string };
  assignment?: { title: string; maxScore?: number };
  createdAt: string;
  content?: string;
};

export default function InstructorDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [instructorId, setInstructorId] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        const firstInstructor = (Array.isArray(data) ? data : []).find(
          (u: User) => u.role === 'instructor'
        );
        if (firstInstructor) setInstructorId(firstInstructor.id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/assignments')
      .then((r) => r.json())
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/submissions')
      .then((r) => r.json())
      .then((data) => setSubmissions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const myAssignments = assignments.filter((a) => a.instructorId === instructorId);
  const submissionsForMyAssignments = submissions.filter((s) =>
    myAssignments.some((a) => a.id === s.assignmentId)
  );

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorId || !title.trim() || !description.trim()) {
      setMessage('Fill title and description.');
      return;
    }
    setCreating(true);
    setMessage('');
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          maxScore: Number(maxScore) || 100,
          instructorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setAssignments((prev) => [data, ...prev]);
      setTitle('');
      setDescription('');
      setMaxScore(100);
      setShowCreate(false);
      setMessage('Assignment created.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create.');
    } finally {
      setCreating(false);
    }
  };

  const instructors = users.filter((u) => u.role === 'instructor');

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-slate-400 hover:text-emerald-400 transition"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-emerald-400">
          Instructor Dashboard
        </h1>
      </div>

      <section className="mb-8">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          I am (instructor)
        </label>
        <select
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          className="w-full max-w-xs rounded-lg bg-slate-800 border border-slate-600 text-slate-100 px-3 py-2"
        >
          <option value="">Select instructor</option>
          {instructors.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </section>

      <section className="mb-10 rounded-xl bg-slate-800/50 border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">
            My assignments
          </h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
          >
            {showCreate ? 'Cancel' : 'Create assignment'}
          </button>
        </div>
        {showCreate && (
          <form onSubmit={handleCreateAssignment} className="mb-6 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 px-3 py-2"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description / prompt (used for AI feedback)"
              rows={3}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 px-3 py-2"
            />
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-sm">Max score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-20 rounded bg-slate-800 border border-slate-600 px-2 py-1 text-slate-100"
              />
            </div>
            {message && <p className="text-amber-400 text-sm">{message}</p>}
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-medium hover:bg-emerald-400 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        )}
        {myAssignments.length === 0 ? (
          <p className="text-slate-500">No assignments yet. Create one above.</p>
        ) : (
          <ul className="space-y-2">
            {myAssignments.map((a) => (
              <li
                key={a.id}
                className="flex justify-between items-center rounded-lg bg-slate-800 border border-slate-600 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-slate-200">{a.title}</span>
                  <span className="text-slate-500 text-sm ml-2">
                    max {a.maxScore} pts
                  </span>
                </div>
                <Link
                  href={`/instructor/assignment/${a.id}`}
                  className="text-emerald-400 hover:underline text-sm"
                >
                  View submissions
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-slate-800/50 border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          All submissions (AI-generated feedback)
        </h2>
        {submissionsForMyAssignments.length === 0 ? (
          <p className="text-slate-500">
            No submissions for your assignments yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-600">
                  <th className="pb-2 pr-4">Student</th>
                  <th className="pb-2 pr-4">Assignment</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Plagiarism risk</th>
                  <th className="pb-2 pr-4">Feedback summary</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissionsForMyAssignments.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-700/50 hover:bg-slate-800/50"
                  >
                    <td className="py-3 pr-4 text-slate-200">
                      {s.student.name}
                    </td>
                    <td className="py-3 pr-4 text-slate-300">
                      {s.assignment?.title ?? '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          s.status === 'evaluated'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{s.score ?? '—'}</td>
                    <td className="py-3 pr-4 text-slate-300">
                      {s.plagiarismRisk ?? '—'}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 max-w-xs truncate">
                      {s.feedbackSummary ?? '—'}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setSelectedSubmission(s)}
                        className="text-emerald-400 hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
                Submission: {selectedSubmission.student.name}
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
                {selectedSubmission.score ?? '—'}
              </p>
              <p>
                <span className="text-slate-500">Plagiarism risk:</span>{' '}
                {selectedSubmission.plagiarismRisk ?? '—'}
              </p>
              <p>
                <span className="text-slate-500">Feedback summary:</span>{' '}
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
                  <span className="text-slate-500 block mb-1">Content preview:</span>
                  <pre className="bg-slate-900 rounded p-3 text-slate-300 whitespace-pre-wrap text-xs max-h-40 overflow-y-auto">
                    {selectedSubmission.content.slice(0, 800)}
                    {selectedSubmission.content.length > 800 ? '...' : ''}
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
