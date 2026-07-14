import jsPDF from 'jspdf';
import { ResumeAnalysisResult } from '../services/resumeService';

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
  }

  doc.save(fileName);
}
