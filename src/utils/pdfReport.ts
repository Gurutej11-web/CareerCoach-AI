import jsPDF from 'jspdf';
import { ResumeAnalysisResult } from '../services/resumeService';
import { InterviewAnalysisResult } from '../services/interviewService';
import { Activity } from '../contexts/RecentActivityContext';

const MARGIN = 15;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(79, 70, 229);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(79, 70, 229);
  doc.line(MARGIN, y + 1.5, PAGE_WIDTH - MARGIN, y + 1.5);
  return y + 8;
}

function addBulletList(doc: jsPDF, y: number, items: string[], maxY = 280): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);

  for (const item of items) {
    const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH);
    if (y + lines.length * 5 > maxY) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(lines, MARGIN, y);
    y += lines.length * 5 + 2;
  }
  return y;
}

export function generateResumeReportPdf(result: ResumeAnalysisResult, fileName = 'resume-analysis-report.pdf') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text('CareerCoach AI — Resume Analysis Report', MARGIN, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Match Score: ${result.matchScore}%`, MARGIN, y);
  y += 10;

  if (result.keywordsToAdd?.length) {
    y = addSectionTitle(doc, y, 'Keywords to Add');
    y = addBulletList(doc, y, result.keywordsToAdd);
    y += 4;
  }

  if (result.keywordsToRemove?.length) {
    y = addSectionTitle(doc, y, 'Keywords to Remove');
    y = addBulletList(doc, y, result.keywordsToRemove);
    y += 4;
  }

  if (result.contentSuggestions?.length) {
    y = addSectionTitle(doc, y, 'Content Suggestions');
    y = addBulletList(doc, y, result.contentSuggestions);
    y += 4;
  }

  if (result.formatSuggestions?.length) {
    y = addSectionTitle(doc, y, 'Formatting Suggestions');
    y = addBulletList(doc, y, result.formatSuggestions);
    y += 4;
  }

  if (result.sentimentAnalysis?.sentiment) {
    y = addSectionTitle(doc, y, 'Tone Analysis');
    y = addBulletList(doc, y, [`Overall sentiment: ${result.sentimentAnalysis.sentiment}`]);
    y += 4;
  }

  if (result.readability?.score !== null && result.readability?.score !== undefined) {
    y = addSectionTitle(doc, y, 'Readability');
    y = addBulletList(doc, y, [`Score: ${result.readability.score}/100 (${result.readability.label})`]);
  }

  doc.save(fileName);
}

export function generateProgressReportPdf(activities: Activity[], fileName = 'careercoach-progress-report.pdf') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text('CareerCoach AI — Progress Report', MARGIN, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);
  y += 10;

  const resumeCount = activities.filter((a) => a.type === 'resume').length;
  const interviewCount = activities.filter((a) => a.type === 'interview').length;
  const chatbotCount = activities.filter((a) => a.type === 'chatbot').length;
  const scored = activities.filter((a) => typeof a.score === 'number');
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, a) => sum + (a.score as number), 0) / scored.length)
    : null;

  y = addSectionTitle(doc, y, 'Summary');
  y = addBulletList(doc, y, [
    `Resumes analyzed: ${resumeCount}`,
    `Mock interviews completed: ${interviewCount}`,
    `Chatbot sessions: ${chatbotCount}`,
    avgScore !== null ? `Average score: ${avgScore}` : 'Average score: not enough data yet',
    `Total activities logged: ${activities.length}`,
  ]);
  y += 4;

  if (scored.length >= 2) {
    const sorted = [...scored].sort((a, b) => a.timestamp - b.timestamp);
    const first = sorted[0].score as number;
    const latest = sorted[sorted.length - 1].score as number;
    y = addSectionTitle(doc, y, 'Score Trend');
    y = addBulletList(doc, y, [
      `First recorded score: ${first}`,
      `Latest recorded score: ${latest}`,
      `Change: ${latest - first >= 0 ? '+' : ''}${latest - first}`,
    ]);
    y += 4;
  }

  y = addSectionTitle(doc, y, 'Recent Activity');
  const activityLines = activities
    .slice(0, 25)
    .map((a) => `[${a.date}] ${a.description}${typeof a.score === 'number' ? ` — score: ${a.score}` : ''}`);
  addBulletList(doc, y, activityLines.length ? activityLines : ['No activity recorded yet.']);

  doc.save(fileName);
}

export function generateInterviewReportPdf(
  result: InterviewAnalysisResult,
  transcript: string,
  fileName = 'mock-interview-report.pdf'
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text('CareerCoach AI — Mock Interview Report', MARGIN, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Overall Score: ${result.content_analysis.overall_score}/100`, MARGIN, y);
  y += 10;

  y = addSectionTitle(doc, y, 'Delivery');
  y = addBulletList(doc, y, [
    `Pace: ${result.audio_analysis.pace_score}/100 — ${result.audio_analysis.pace_feedback}`,
    `Volume: ${result.audio_analysis.volume_score}/100 — ${result.audio_analysis.volume_feedback}`,
  ]);
  y += 4;

  y = addSectionTitle(doc, y, 'Content');
  y = addBulletList(doc, y, [
    `Relevance: ${result.content_analysis.relevance_score}/100 — ${result.content_analysis.relevance_feedback}`,
    `Clarity: ${result.content_analysis.clarity_score}/100 — ${result.content_analysis.clarity_feedback}`,
  ]);
  y += 4;

  if (result.content_analysis.strengths?.length) {
    y = addSectionTitle(doc, y, 'Strengths');
    y = addBulletList(doc, y, result.content_analysis.strengths);
    y += 4;
  }

  if (result.content_analysis.improvement_areas?.length) {
    y = addSectionTitle(doc, y, 'Areas to Improve');
    y = addBulletList(doc, y, result.content_analysis.improvement_areas);
    y += 4;
  }

  if (result.feedback?.suggestions?.length) {
    y = addSectionTitle(doc, y, 'Suggestions');
    y = addBulletList(doc, y, result.feedback.suggestions);
    y += 4;
  }

  if (transcript) {
    y = addSectionTitle(doc, y, 'Transcript');
    y = addBulletList(doc, y, [transcript]);
  }

  doc.save(fileName);
}
