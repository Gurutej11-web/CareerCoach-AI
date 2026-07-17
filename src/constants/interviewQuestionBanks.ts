export type InterviewDifficulty = 'junior' | 'mid' | 'senior';

export interface QuestionBank {
  id: string;
  label: string;
  questionsByDifficulty: Record<InterviewDifficulty, string[]>;
}

export const DIFFICULTY_LEVELS: { id: InterviewDifficulty; label: string; description: string }[] = [
  { id: 'junior', label: 'Junior', description: 'Entry-level questions focused on fundamentals and potential' },
  { id: 'mid', label: 'Mid-level', description: 'Standard questions expecting independent ownership of work' },
  { id: 'senior', label: 'Senior', description: 'Advanced questions probing strategy, tradeoffs, and leadership' },
];

export const QUESTION_BANKS: QuestionBank[] = [
  {
    id: 'general',
    label: 'General / Behavioral',
    questionsByDifficulty: {
      junior: [
        'Tell me about yourself.',
        'What are your greatest strengths?',
        'Describe a time you handled a conflict at work or school.',
        'Where do you see yourself in five years?',
        'Why do you want to work here?',
      ],
      mid: [
        'Tell me about a project you owned end to end.',
        'Describe a time you had to push back on a decision you disagreed with.',
        'How do you prioritize when you have more work than time?',
        'Tell me about a mistake you made and how you handled it.',
        'How do you handle feedback that stings a little?',
      ],
      senior: [
        'Tell me about a time you influenced a decision without having direct authority over it.',
        'Describe how you have mentored or grown someone on your team.',
        'Walk me through a strategic tradeoff you made that you would make differently today.',
        'How do you decide what NOT to work on?',
        'Tell me about a time you changed your mind on something you were previously certain about.',
      ],
    },
  },
  {
    id: 'software-engineering',
    label: 'Software Engineering',
    questionsByDifficulty: {
      junior: [
        'How do you approach debugging an issue you have never seen before?',
        'What is the difference between a stack and a queue, and when would you use each?',
        'Tell me about a bug you fixed and how you found it.',
        'How do you make sure your code works before submitting it for review?',
        'What do you do when you get stuck on a problem?',
      ],
      mid: [
        'Tell me about a time you had to optimize slow code. What did you do?',
        'How do you decide when to refactor versus ship a quick fix?',
        'Describe a technical disagreement you had with a teammate and how it was resolved.',
        'How do you approach code review, both giving and receiving feedback?',
        'Walk me through how you would design a rate limiter.',
      ],
      senior: [
        'Tell me about a system you designed that had to balance conflicting non-functional requirements.',
        'How do you approach a large-scale migration with minimal downtime and risk?',
        'Describe a time you had to make an architectural decision with incomplete information.',
        'How do you build engineering culture around code quality without slowing the team down?',
        'Tell me about a production incident you led the response for.',
      ],
    },
  },
  {
    id: 'product-management',
    label: 'Product Management',
    questionsByDifficulty: {
      junior: [
        'How would you improve a product you use every day?',
        'Tell me about a time you gathered feedback from users.',
        'How do you decide what makes a feature "done"?',
        'What data would you look at to know if a feature is successful?',
        'How do you work with engineers who disagree with your idea?',
      ],
      mid: [
        'Walk me through how you prioritize a product roadmap with limited resources.',
        'Tell me about a product decision you made based on data that turned out to be wrong.',
        'How do you handle disagreements between engineering and design on scope?',
        'Describe how you gather and incorporate user feedback into a product.',
        'How would you measure the success of a new feature you shipped?',
      ],
      senior: [
        'Tell me about a time you set product strategy for more than one team.',
        'How do you decide to sunset a product or feature?',
        'Describe how you have navigated a major stakeholder disagreement at the executive level.',
        'How do you balance long-term platform investment against short-term feature requests?',
        'Tell me about a bet you made that did not pay off, and what you did next.',
      ],
    },
  },
  {
    id: 'sales',
    label: 'Sales',
    questionsByDifficulty: {
      junior: [
        'How would you research a prospect before a first call?',
        'Tell me about a time you convinced someone of something.',
        'How do you handle rejection?',
        'What would you do if a prospect stopped responding?',
        'How do you stay organized with multiple leads at once?',
      ],
      mid: [
        'Walk me through how you handle an objection from a hesitant prospect.',
        'Tell me about your most difficult sale and how you closed it.',
        'How do you build a pipeline from scratch in a new territory?',
        'Describe a time you lost a deal. What did you learn from it?',
        'How do you tailor your pitch to different buyer personas?',
      ],
      senior: [
        'Tell me about how you have built or scaled a sales process for a team.',
        'How do you forecast revenue and course-correct when you are behind?',
        'Describe a strategic enterprise deal you negotiated end to end.',
        'How do you coach an underperforming rep on your team?',
        'Tell me about a time you had to walk away from a deal on principle.',
      ],
    },
  },
  {
    id: 'data-analytics',
    label: 'Data / Analytics',
    questionsByDifficulty: {
      junior: [
        'Walk me through how you would clean a messy dataset.',
        'Tell me about a time you had to learn a new tool quickly to finish an analysis.',
        'How do you check your own analysis for mistakes?',
        'What is the difference between correlation and causation, with an example?',
        'How would you explain a p-value to someone non-technical?',
      ],
      mid: [
        'Walk me through how you would validate that a metric is trustworthy.',
        'Tell me about a time your analysis changed a business decision.',
        'How do you explain a complex analysis to a non-technical stakeholder?',
        'Describe how you handle messy or incomplete data.',
        'How do you decide which metric matters most for a given problem?',
      ],
      senior: [
        'Tell me about a measurement framework or metrics system you built for a team.',
        'How do you decide between a quick directional answer and a rigorous, slower analysis?',
        'Describe a time you had to say no to a stakeholder\'s analysis request, and how you handled it.',
        'How do you build trust in data across an organization that has been burned by bad numbers before?',
        'Tell me about a time you mentored someone into becoming a stronger analyst.',
      ],
    },
  },
];

export function getQuestionBank(id: string): QuestionBank | undefined {
  return QUESTION_BANKS.find((bank) => bank.id === id);
}

export function getQuestionsForDifficulty(bankId: string, difficulty: InterviewDifficulty): string[] {
  const bank = getQuestionBank(bankId);
  return bank ? bank.questionsByDifficulty[difficulty] : [];
}
