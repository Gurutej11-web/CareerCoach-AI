export interface QuestionBank {
  id: string;
  label: string;
  questions: string[];
}

export const QUESTION_BANKS: QuestionBank[] = [
  {
    id: 'general',
    label: 'General / Behavioral',
    questions: [
      'Tell me about yourself.',
      'What are your greatest strengths?',
      'Describe a time you handled a conflict at work.',
      'Where do you see yourself in five years?',
      'Why do you want to work here?',
    ],
  },
  {
    id: 'software-engineering',
    label: 'Software Engineering',
    questions: [
      'How do you approach debugging a complex issue?',
      'Tell me about a time you had to optimize slow code. What did you do?',
      'How do you decide when to refactor versus ship a quick fix?',
      'Describe a technical disagreement you had with a teammate and how it was resolved.',
      'How do you approach code review, both giving and receiving feedback?',
    ],
  },
  {
    id: 'product-management',
    label: 'Product Management',
    questions: [
      'Walk me through how you prioritize a product roadmap with limited resources.',
      'Tell me about a product decision you made based on data that turned out to be wrong.',
      'How do you handle disagreements between engineering and design on scope?',
      'Describe how you gather and incorporate user feedback into a product.',
      'How would you measure the success of a new feature you shipped?',
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    questions: [
      'Walk me through how you handle an objection from a hesitant prospect.',
      'Tell me about your most difficult sale and how you closed it.',
      'How do you build a pipeline from scratch in a new territory?',
      'Describe a time you lost a deal. What did you learn from it?',
      'How do you tailor your pitch to different buyer personas?',
    ],
  },
  {
    id: 'data-analytics',
    label: 'Data / Analytics',
    questions: [
      'Walk me through how you would validate that a metric is trustworthy.',
      'Tell me about a time your analysis changed a business decision.',
      'How do you explain a complex analysis to a non-technical stakeholder?',
      'Describe how you handle messy or incomplete data.',
      'How do you decide which metric matters most for a given problem?',
    ],
  },
];

export function getQuestionBank(id: string): QuestionBank | undefined {
  return QUESTION_BANKS.find((bank) => bank.id === id);
}
