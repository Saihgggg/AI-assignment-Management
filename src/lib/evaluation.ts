/**
 * AI/ML Evaluation: TF-IDF cosine similarity for plagiarism risk +
 * rule-based automated feedback generation.
 */

import natural from 'natural';

const { TfIdf } = natural;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Compute TF-IDF cosine similarity between two texts (0–1).
 * Used to flag plagiarism risk when comparing to other submissions.
 */
export function cosineSimilarity(textA: string, textB: string): number {
  if (!textA.trim() || !textB.trim()) return 0;
  const tfidf = new TfIdf();
  tfidf.addDocument(textA);
  tfidf.addDocument(textB);
  const termsA = new Map<string, number>();
  const termsB = new Map<string, number>();
  tfidf.listTerms(0).forEach((item: { term: string; tfidf: number }) => {
    termsA.set(item.term, item.tfidf);
  });
  tfidf.listTerms(1).forEach((item: { term: string; tfidf: number }) => {
    termsB.set(item.term, item.tfidf);
  });
  const allTerms = new Set([...termsA.keys(), ...termsB.keys()]);
  let dot = 0,
    normA = 0,
    normB = 0;
  allTerms.forEach((term) => {
    const a = termsA.get(term) ?? 0;
    const b = termsB.get(term) ?? 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : Math.min(1, dot / denom);
}

/**
 * Plagiarism risk: max similarity with any other submission, as percentage.
 */
export function computePlagiarismRisk(
  submissionText: string,
  otherSubmissions: string[]
): string {
  if (otherSubmissions.length === 0) return '0%';
  let maxSim = 0;
  for (const other of otherSubmissions) {
    const sim = cosineSimilarity(submissionText, other);
    if (sim > maxSim) maxSim = sim;
  }
  return `${Math.round(maxSim * 100)}%`;
}

/**
 * Rule-based feedback: length, structure, common rubric keywords.
 */
export function generateFeedback(
  content: string,
  assignmentDescription: string,
  maxScore: number
): { score: number; feedbackSummary: string; feedbackDetail: string } {
  const words = tokenize(content);
  const wordCount = words.length;
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const descWords = new Set(tokenize(assignmentDescription));
  const contentWords = new Set(words);

  let score = maxScore;
  const issues: string[] = [];
  const positives: string[] = [];

  // Length heuristic (short submissions penalized)
  if (wordCount < 50) {
    score -= 20;
    issues.push('The submission is too short; consider expanding your explanation.');
  } else if (wordCount < 100) {
    score -= 10;
    issues.push('The explanation could be more detailed in places.');
  } else if (wordCount >= 150) {
    positives.push('Good length and development.');
  }

  // Overlap with assignment description (shows engagement with prompt)
  let overlap = 0;
  descWords.forEach((w) => {
    if (contentWords.has(w)) overlap++;
  });
  const overlapRatio = descWords.size > 0 ? overlap / descWords.size : 0;
  if (overlapRatio < 0.2 && descWords.size > 5) {
    score -= 10;
    issues.push('The response could better address the assignment prompt.');
  }

  // Section structure: look for numbered or bullet-like structure
  const hasSections =
    /(\d+[.)]\s|\n\s*[-*]\s)/.test(content) ||
    content.toLowerCase().includes('section') ||
    content.toLowerCase().includes('first') ||
    content.toLowerCase().includes('second');
  if (!hasSections && wordCount > 80) {
    score -= 5;
    issues.push('Adding clear sections or bullet points would improve clarity.');
  } else if (hasSections) {
    positives.push('Clear structure with sections or bullets.');
  }

  // Depth: check for explanation keywords
  const depthWords = [
    'because',
    'therefore',
    'however',
    'example',
    'explain',
    'reason',
    'detail',
  ];
  const depthCount = words.filter((w) =>
    depthWords.some((d) => w.includes(d) || d.includes(w))
  ).length;
  if (depthCount < 2 && wordCount > 60) {
    score -= 10;
    issues.push('The explanation lacks depth in some sections.');
  }

  score = Math.max(0, Math.min(maxScore, score));

  const feedbackSummary =
    issues.length > 0
      ? issues[0]
      : positives.length > 0
        ? positives[0]
        : 'Submission meets basic requirements.';
  const feedbackDetail = [
    ...positives,
    ...issues,
    `Word count: ${wordCount}. Score: ${score}/${maxScore}.`,
  ].join(' ');

  return { score, feedbackSummary, feedbackDetail };
}

export type EvaluationResult = {
  plagiarism_risk: string;
  feedback_summary: string;
  score: number;
  feedback_detail?: string;
};

/**
 * Full evaluation: plagiarism risk + rule-based feedback.
 */
export function evaluateSubmission(
  content: string,
  otherSubmissions: string[],
  assignmentDescription: string,
  maxScore: number
): EvaluationResult {
  const plagiarism_risk = computePlagiarismRisk(content, otherSubmissions);
  const { score, feedbackSummary, feedbackDetail } = generateFeedback(
    content,
    assignmentDescription,
    maxScore
  );
  return {
    plagiarism_risk,
    feedback_summary: feedbackSummary,
    score,
    feedback_detail: feedbackDetail,
  };
}
