'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type User = { id: string; name: string; email: string; role: string };
type Assignment = { id: string; title: string; description: string; maxScore: number };
type Submission = {
  id: string;
  status: string;
  score: number | null;
  plagiarismRisk: string | null;
  feedbackSummary: string | null;
  feedbackDetail: string | null;
  assignment: { title: string };
  createdAt: string;
};

export default function StudentDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [studentId, setStudentId] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        const firstStudent = (Array.isArray(data) ? data : []).find(
          (u: User) => u.role === 'student'
        );
        if (firstStudent) setStudentId(firstStudent.id);
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
    if (!studentId) return;
    fetch(`/api/submissions?studentId=${studentId}`)
      .then((r) => r.json())
      .then((data) => setSubmissions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [studentId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      setMessage('Please select a PDF file.');
      return;
    }
    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.set('file', file);
    try {
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setContent(data.text || '');
      setFileName(file.name);
      setMessage('PDF text extracted. You can edit below before submitting.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to extract PDF text.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !selectedAssignment || !content.trim()) {
      setMessage('Select your profile, an assignment, and enter or upload content.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment,
          studentId,
          content: content.trim(),
          fileName: fileName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setMessage('Submitted successfully! Feedback is ready.');
      setContent('');
      setFileName('');
      setSubmissions((prev) => [data.submission, ...prev]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const students = users.filter((u) => u.role === 'student');

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="text-slate-400 hover:text-amber-400 transition"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-amber-400">Student Dashboard</h1>
      </div>

      <section className="mb-10">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          I am (student)
        </label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full max-w-xs rounded-lg bg-slate-800 border border-slate-600 text-slate-100 px-3 py-2"
        >
          <option value="">Select student</option>
          {students.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </section>

      <section className="mb-10 rounded-xl bg-slate-800/50 border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Submit assignment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Assignment
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 px-3 py-2"
            >
              <option value="">Select assignment</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} (max {a.maxScore} pts)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Upload PDF (optional)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-amber-500/20 file:text-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Your answer (text or paste after PDF upload)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Paste or type your assignment content here..."
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 px-3 py-2 placeholder-slate-500"
            />
          </div>
          {message && (
            <p
              className={
                message.startsWith('Submit') || message.startsWith('PDF')
                  ? 'text-amber-400'
                  : 'text-red-400'
              }
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit for evaluation'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          My submissions & feedback
        </h2>
        {submissions.length === 0 ? (
          <p className="text-slate-500">No submissions yet.</p>
        ) : (
          <ul className="space-y-4">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="rounded-xl bg-slate-800/50 border border-slate-700 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-medium text-slate-200">
                    {s.assignment.title}
                  </span>
                  <span
                    className={`text-sm px-2 py-0.5 rounded ${
                      s.status === 'evaluated'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {s.status}
                  </span>
                  {s.score != null && (
                    <span className="text-sm text-slate-400">
                      Score: {s.score}
                    </span>
                  )}
                  {s.plagiarismRisk && (
                    <span className="text-sm text-slate-400">
                      Plagiarism risk: {s.plagiarismRisk}
                    </span>
                  )}
                </div>
                {s.feedbackSummary && (
                  <p className="text-slate-300 text-sm">{s.feedbackSummary}</p>
                )}
                {s.feedbackDetail && (
                  <p className="text-slate-500 text-xs mt-1">
                    {s.feedbackDetail}
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-2">
                  Submitted: {new Date(s.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
