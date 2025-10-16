/**
 * ReviewConstants - Central constants for CEO review application
 * Defines all static data, schemas, and configuration values
 * @namespace ReviewConstants
 */

// --- KPI & Business Configuration ---
const kpis = [
  "Conflict Resolution",
  "Financial Resilience",
  "Board–CEO Communication",
  "Values Alignment"
];

const strategicPriorities = [
  "Strengthen Iwi relationships",
  "Increase trusted relationships & social cohesion",
  "Contribute to intergenerational wellbeing",
  "Operate a positive & professional organisation"
];

const jdAreas = [
  "Strategic Leadership",
  "People & Resources",
  "Partnerships",
  "Growth Opportunities",
  "Accountability",
  "Team & Culture"
];

const ratingDescriptions = {
  5: "Consistently exceeds expectations",
  4: "Meets and often exceeds expectations",
  3: "Meets expectations",
  2: "Partially meets expectations",
  1: "Unacceptable"
};

// --- UI Configuration ---
const emptyStateMessages = {
  'challenges-container': 'No challenges added yet.',
  'last-year-goals-container': 'No goals from last year added yet.',
  'pd-undertaken-container': 'No professional development recorded yet.',
  'pd-needed-container': 'No future professional development needs added.',
  'future-goals-container': 'No future goals added yet.',
  'board-requests-container': 'No requests for the board added yet.'
};

// --- Schema for loading previous review context ---
const previousContextSchema = {
  'part-1': [
    { key: 'successes', altKeys: ['successHighlights', 'wins'], label: 'Success highlights' },
    { key: 'not-well', altKeys: ['setbacks', 'improvementsNeeded'], label: 'Areas that did not go well' },
    { key: 'comparative-reflection', altKeys: ['yearComparison'], label: 'Comparative reflection' },
    { key: 'challenges', label: 'Key challenges', formatter: 'formatChallengeList' }
  ],
  'part-2': [
    { key: 'lastYearGoals', altKeys: ['goalsLastYear', 'goals'], label: 'Goals from last year', formatter: 'formatGoalList' },
    { key: 'kpis', altKeys: ['kpiRatings'], label: 'KPI & competency ratings', formatter: 'formatKpiList' }
  ],
  'part-3': [
    { key: 'jdAlignment', altKeys: ['jobAlignment'], label: 'Job description alignment', formatter: 'formatJobAlignmentList' }
  ],
  'part-4': [
    { key: 'strategicPriorities', altKeys: ['priorities'], label: 'Strategic priorities', formatter: 'formatStrategicPriorityList' }
  ],
  'part-5': [
    { key: 'strengths', altKeys: ['keyStrengths'], label: 'Key strengths' },
    { key: 'limitations', altKeys: ['constraints'], label: 'Limitations / restrictions' },
    { key: 'pdUndertaken', altKeys: ['professionalDevelopmentUndertaken'], label: 'Professional development undertaken', formatter: 'formatPDUndertakenList' },
    { key: 'pdNeeded', altKeys: ['professionalDevelopmentNeeded', 'pdNeeds'], label: 'Future professional development needs', formatter: 'formatPDNeededList' }
  ],
  'part-6': [
    { key: 'futureGoals', altKeys: ['nextYearGoals'], label: 'Future goals', formatter: 'formatFutureGoalList' }
  ],
  'part-7': [
    { key: 'boardRequests', altKeys: ['requestsForBoard'], label: 'Requests for the board', formatter: 'formatBoardRequestList' }
  ]
};

// --- Form Schema Definition ---
const employeeReviewSchema = {
  metadata: {
    employeeName: "",
    employeeId: "",
    role: "",
    department: "",
    manager: "",
    reviewPeriod: "",
    status: "draft", // or "submitted"
    timestamp: ""
  },
  sections: [
    // Example section
    // {
    //   id: "performance",
    //   title: "Performance Reflection",
    //   description: "Reflect on your work during the review period.",
    //   questions: [
    //     { id: "successes", type: "text", label: "Key Successes" },
    //     { id: "challenges", type: "repeater", label: "Challenges", fields: ["Challenge", "Action Taken", "Result"] },
    //     { id: "rating", type: "rating", label: "Overall Rating", scale: [1,2,3,4,5] }
    //   ]
    // }
  ]
};

// --- Example: Dynamic Section Template ---
const defaultSections = [
  {
    id: "performance",
    title: "Performance Reflection",
    description: "Reflect on your work during the review period.",
    questions: [
      { id: "successes", type: "text", label: "Key Successes" },
      { id: "challenges", type: "repeater", label: "Challenges", fields: ["Challenge", "Action Taken", "Result"] },
      { id: "rating", type: "rating", label: "Overall Rating", scale: [1,2,3,4,5] }
    ]
  },
  {
    id: "goals",
    title: "Goals & KPIs",
    description: "Review your goals and key performance indicators.",
    questions: [
      { id: "lastYearGoals", type: "repeater", label: "Last Year Goals", fields: ["Goal", "Status", "Evidence"] },
      { id: "kpiRatings", type: "matrix", label: "KPI Ratings", kpis: ["Teamwork", "Communication", "Initiative"] }
    ]
  }
  // Add more sections as needed
];

// --- Export to global namespace ---
window.ReviewConstants = {
  kpis,
  strategicPriorities,
  jdAreas,
  ratingDescriptions,
  emptyStateMessages,
  previousContextSchema,
  employeeReviewSchema,
  defaultSections
};

// --- Legacy exports for backwards compatibility ---
window.ceoReviewConfig = { kpis, strategicPriorities, jdAreas, ratingDescriptions };
window.employeeReviewSchema = employeeReviewSchema;
window.defaultSections = defaultSections;
