/**
 * Mock data for screenshot/demo mode.
 * Gated behind NEXT_PUBLIC_USE_MOCK_DATA=true.
 *
 * All data matches real Prisma types exactly.
 * Read-only: never written to DB, never triggers Claude calls.
 */

import type { Company, Contact, Message, Profile, Tier, Stage, Angle, Role } from "@prisma/client";

// ============================================================================
// HELPER
// ============================================================================

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export const MOCK_USER_EMAIL = "alex.carter@gmail.com";

function mockDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function mockId(): string {
  return `mock_${Math.random().toString(36).slice(2, 11)}`;
}

const MOCK_USER_ID = "mock_user_001";

// ============================================================================
// PROFILE
// ============================================================================

export const MOCK_PROFILE: Profile = {
  id: mockId(),
  userId: MOCK_USER_ID,
  name: "Alex Carter",
  role: "Senior Full-Stack Engineer",
  location: "Montreal, QC",
  stack: "TypeScript, React, Node.js, PostgreSQL, AWS",
  experience: "~5 years building B2B SaaS products",
  education: "B.Eng Computer Engineering, Concordia University",
  summary:
    "I specialize in building scalable web applications with modern TypeScript stacks. Currently exploring new opportunities at product-focused companies.",
  cvFileUrl: "mock://cv/alex-carter-resume.pdf",
  cvFileName: "Alex_Carter_Resume.pdf",
  cvUploadedAt: mockDate(15),
  createdAt: mockDate(30),
  updatedAt: mockDate(0),
};

// ============================================================================
// COMPANIES (subset of real seed list + a few extras)
// ============================================================================

export const MOCK_COMPANIES: Company[] = [
  // MID tier
  { id: mockId(), userId: MOCK_USER_ID, name: "Coveo", city: "Montreal", tier: "MID" as Tier, createdAt: mockDate(25) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Lightspeed", city: "Montreal", tier: "MID" as Tier, createdAt: mockDate(25) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Hopper", city: "Montreal", tier: "MID" as Tier, createdAt: mockDate(24) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Wealthsimple", city: "Toronto", tier: "MID" as Tier, createdAt: mockDate(23) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Clio", city: "Vancouver", tier: "MID" as Tier, createdAt: mockDate(22) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Ada", city: "Toronto", tier: "MID" as Tier, createdAt: mockDate(21) },
  // CONSULTANCY tier
  { id: mockId(), userId: MOCK_USER_ID, name: "CGI", city: "Montreal", tier: "CONSULTANCY" as Tier, createdAt: mockDate(20) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Spiria", city: "Montreal", tier: "CONSULTANCY" as Tier, createdAt: mockDate(19) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Osedea", city: "Montreal", tier: "CONSULTANCY" as Tier, createdAt: mockDate(18) },
  // LARGE tier
  { id: mockId(), userId: MOCK_USER_ID, name: "Shopify", city: "Ottawa", tier: "LARGE" as Tier, createdAt: mockDate(17) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Google", city: "Montreal", tier: "LARGE" as Tier, createdAt: mockDate(16) },
  { id: mockId(), userId: MOCK_USER_ID, name: "Autodesk", city: "Montreal", tier: "LARGE" as Tier, createdAt: mockDate(15) },
];

// ============================================================================
// CONTACTS + MESSAGES
// Spread across ALL 5 stages: REQUESTED, CONTACTED, REPLIED, TALKING, CLOSED
// ============================================================================

type ContactWithMessages = Contact & { messages: Message[] };

// --- REQUESTED stage (2 contacts, no messages yet) ---

const contactRequestedIds = [mockId(), mockId()];

const CONTACT_REQUESTED_1: ContactWithMessages = {
  id: contactRequestedIds[0]!,
  userId: MOCK_USER_ID,
  name: "Priya Sharma",
  company: "Hopper",
  angle: "STACK" as Angle,
  stage: "REQUESTED" as Stage,
  linkedinUrl: "https://linkedin.com/in/priyasharma",
  profileText: "Senior Software Engineer at Hopper. TypeScript, React, Node.js. Building travel tech.",
  nextStep: "Wait for connection acceptance",
  createdAt: mockDate(1),
  updatedAt: mockDate(1),
  messages: [],
};

const CONTACT_REQUESTED_2: ContactWithMessages = {
  id: contactRequestedIds[1]!,
  userId: MOCK_USER_ID,
  name: "James Liu",
  company: "Wealthsimple",
  angle: "ALUM" as Angle,
  stage: "REQUESTED" as Stage,
  linkedinUrl: "https://linkedin.com/in/jamesliu-dev",
  profileText: "Staff Engineer at Wealthsimple. Concordia 2018. Full-stack fintech.",
  nextStep: "Pending — fellow Concordia alum",
  createdAt: mockDate(0),
  updatedAt: mockDate(0),
  messages: [],
};

// --- CONTACTED stage (3 contacts, sent connection note) ---

const contactContactedIds = [mockId(), mockId(), mockId()];

const CONTACT_CONTACTED_1: ContactWithMessages = {
  id: contactContactedIds[0]!,
  userId: MOCK_USER_ID,
  name: "Sophie Tremblay",
  company: "Coveo",
  angle: "STACK" as Angle,
  stage: "CONTACTED" as Stage,
  linkedinUrl: "https://linkedin.com/in/sophietremblay",
  profileText: "Engineering Lead at Coveo. Building AI-powered search. TypeScript, Python, ML.",
  nextStep: "Sent note — waiting for response",
  createdAt: mockDate(5),
  updatedAt: mockDate(3),
  messages: [
    {
      id: mockId(),
      contactId: contactContactedIds[0]!,
      role: "YOU" as Role,
      text: "Hi Sophie — saw you've been at Coveo for a while leading eng. I'm exploring senior roles at product companies and curious what the path in looked like for you. Would love to hear what helped you stand out when you joined.",
      createdAt: mockDate(3),
    },
  ],
};

const CONTACT_CONTACTED_2: ContactWithMessages = {
  id: contactContactedIds[1]!,
  userId: MOCK_USER_ID,
  name: "Marcus Chen",
  company: "Lightspeed",
  angle: "RECRUITER" as Angle,
  stage: "CONTACTED" as Stage,
  linkedinUrl: "https://linkedin.com/in/marcuschen-recruit",
  profileText: "Senior Technical Recruiter at Lightspeed. Hiring full-stack engineers.",
  nextStep: "Sent note — recruiter lead",
  createdAt: mockDate(4),
  updatedAt: mockDate(2),
  messages: [
    {
      id: mockId(),
      contactId: contactContactedIds[1]!,
      role: "YOU" as Role,
      text: "Hi Marcus — I came across some of the full-stack roles at Lightspeed. I've spent the last 5 years building B2B SaaS with TypeScript and Node, mostly at growth-stage companies. Happy to chat if there's a fit on your end.",
      createdAt: mockDate(2),
    },
  ],
};

const CONTACT_CONTACTED_3: ContactWithMessages = {
  id: contactContactedIds[2]!,
  userId: MOCK_USER_ID,
  name: "Elena Rodriguez",
  company: "Shopify",
  angle: "STACK" as Angle,
  stage: "CONTACTED" as Stage,
  linkedinUrl: "https://linkedin.com/in/elenarodriguez",
  profileText: "Senior Developer at Shopify. React, Ruby, GraphQL. Platform team.",
  nextStep: "Sent connection note",
  createdAt: mockDate(3),
  updatedAt: mockDate(1),
  messages: [
    {
      id: mockId(),
      contactId: contactContactedIds[2]!,
      role: "YOU" as Role,
      text: "Hi Elena — noticed you've been on Shopify's platform team for a few years. I'm exploring opportunities there and curious what made you choose Shopify over other options. Any advice on what they look for?",
      createdAt: mockDate(1),
    },
  ],
};

// --- REPLIED stage (3 contacts, with back-and-forth) ---

const contactRepliedIds = [mockId(), mockId(), mockId()];

const CONTACT_REPLIED_1: ContactWithMessages = {
  id: contactRepliedIds[0]!,
  userId: MOCK_USER_ID,
  name: "David Park",
  company: "Ada",
  angle: "STACK" as Angle,
  stage: "REPLIED" as Stage,
  linkedinUrl: "https://linkedin.com/in/davidpark-ada",
  profileText: "Principal Engineer at Ada. Building conversational AI. Previously Shopify.",
  nextStep: "Follow up on team structure question",
  createdAt: mockDate(10),
  updatedAt: mockDate(1),
  messages: [
    {
      id: mockId(),
      contactId: contactRepliedIds[0]!,
      role: "YOU" as Role,
      text: "Hi David — saw you've been at Ada for a few years building conversational AI. I'm curious how the engineering org has evolved as the product matured. Would love to hear your perspective if you have a few minutes.",
      createdAt: mockDate(7),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[0]!,
      role: "THEM" as Role,
      text: "Hey Alex! Thanks for reaching out. Yeah, it's been a wild ride — we've grown from 30 to 150 engineers in my time here. The product has shifted a lot toward enterprise use cases. Happy to chat more about it!",
      createdAt: mockDate(5),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[0]!,
      role: "YOU" as Role,
      text: "That's a big scale shift! I've been through similar growth at smaller companies (10→50) and the org design challenges are fascinating. How do you structure teams now — product-aligned or platform-focused?",
      createdAt: mockDate(4),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[0]!,
      role: "THEM" as Role,
      text: "Mix of both actually. Product pods with embedded platform engineers, plus a central infra team. Works pretty well for us. Want to hop on a quick call sometime next week?",
      createdAt: mockDate(1),
    },
  ],
};

const CONTACT_REPLIED_2: ContactWithMessages = {
  id: contactRepliedIds[1]!,
  userId: MOCK_USER_ID,
  name: "Amara Okonkwo",
  company: "Clio",
  angle: "ALUM" as Angle,
  stage: "REPLIED" as Stage,
  linkedinUrl: "https://linkedin.com/in/amaraokonkwo",
  profileText: "Staff Engineer at Clio. Concordia 2016. Legal tech, React, Ruby.",
  nextStep: "Scheduling call — responded positively",
  createdAt: mockDate(12),
  updatedAt: mockDate(2),
  messages: [
    {
      id: mockId(),
      contactId: contactRepliedIds[1]!,
      role: "YOU" as Role,
      text: "Hi Amara — fellow Concordia alum here (2019). Saw you've been at Clio for a while. I'm exploring opportunities in legal tech and would love to hear what drew you to the space.",
      createdAt: mockDate(8),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[1]!,
      role: "THEM" as Role,
      text: "Hey, always happy to connect with fellow Concordia folks! Clio's been great — the legal industry is surprisingly underserved by good software, so there's real impact. What kind of role are you looking for?",
      createdAt: mockDate(6),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[1]!,
      role: "YOU" as Role,
      text: "Ideally a senior full-stack role with some ownership — I've been building B2B products for 5 years and want to be closer to product decisions. How autonomous are the teams at Clio?",
      createdAt: mockDate(4),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[1]!,
      role: "THEM" as Role,
      text: "Pretty autonomous actually! Each pod owns end-to-end. We're hiring on the billing team right now if that's interesting. Want to grab a virtual coffee this week?",
      createdAt: mockDate(2),
    },
  ],
};

const CONTACT_REPLIED_3: ContactWithMessages = {
  id: contactRepliedIds[2]!,
  userId: MOCK_USER_ID,
  name: "Kevin Nguyen",
  company: "Google",
  angle: "STACK" as Angle,
  stage: "REPLIED" as Stage,
  linkedinUrl: "https://linkedin.com/in/kevinnguyen-mtl",
  profileText: "Software Engineer at Google Montreal. Cloud infrastructure, Go, Kubernetes.",
  nextStep: "Waiting for his referral timing",
  createdAt: mockDate(14),
  updatedAt: mockDate(3),
  messages: [
    {
      id: mockId(),
      contactId: contactRepliedIds[2]!,
      role: "YOU" as Role,
      text: "Hi Kevin — saw you're on the cloud infra team at Google Montreal. I've been working a lot with AWS and K8s and curious how the GCP team approaches similar problems internally.",
      createdAt: mockDate(10),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[2]!,
      role: "THEM" as Role,
      text: "Hey! Yeah the internal tooling is pretty different from what you'd use externally haha. Are you interested in Google specifically or just exploring infra roles?",
      createdAt: mockDate(8),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[2]!,
      role: "YOU" as Role,
      text: "Google's definitely on my list — the Montreal office seems to have interesting cloud work. I'm mostly looking at companies where I can grow technically and have impact.",
      createdAt: mockDate(6),
    },
    {
      id: mockId(),
      contactId: contactRepliedIds[2]!,
      role: "THEM" as Role,
      text: "Makes sense. We're ramping up hiring next quarter. I can refer you if you want — just give me a heads up when you apply and I'll submit it.",
      createdAt: mockDate(3),
    },
  ],
};

// --- TALKING stage (2 contacts, actively in process) ---

const contactTalkingIds = [mockId(), mockId()];

const CONTACT_TALKING_1: ContactWithMessages = {
  id: contactTalkingIds[0]!,
  userId: MOCK_USER_ID,
  name: "Rachel Kim",
  company: "Autodesk",
  angle: "STACK" as Angle,
  stage: "TALKING" as Stage,
  linkedinUrl: "https://linkedin.com/in/rachelkim-autodesk",
  profileText: "Engineering Manager at Autodesk. Building 3D collaboration tools. TypeScript, Three.js, WebGL.",
  nextStep: "Technical phone screen scheduled Thursday",
  createdAt: mockDate(20),
  updatedAt: mockDate(0),
  messages: [
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "YOU" as Role,
      text: "Hi Rachel — your work on Autodesk's web-based 3D tools looks fascinating. I've dabbled with Three.js and would love to learn how your team handles the performance challenges of browser-based rendering.",
      createdAt: mockDate(18),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "THEM" as Role,
      text: "Thanks for reaching out! It's definitely a unique challenge. We've built a lot of custom tooling around WebGL and WebAssembly. Are you actively looking right now?",
      createdAt: mockDate(16),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "YOU" as Role,
      text: "Yes, exploring senior roles where I can deepen my frontend expertise. The combination of TypeScript and graphics programming at Autodesk seems like a great fit for what I'm looking for.",
      createdAt: mockDate(14),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "THEM" as Role,
      text: "Nice! We actually have a senior frontend role open on my team. Want me to set up a quick intro call with our recruiter?",
      createdAt: mockDate(12),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "YOU" as Role,
      text: "That would be great! I'm available most days next week.",
      createdAt: mockDate(10),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "THEM" as Role,
      text: "Perfect — I'll connect you with Sarah from recruiting. She'll reach out to schedule the initial screen.",
      createdAt: mockDate(8),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "YOU" as Role,
      text: "Had the recruiter call yesterday — went well! She mentioned you'd be on the technical phone screen. Looking forward to it.",
      createdAt: mockDate(2),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[0]!,
      role: "THEM" as Role,
      text: "Glad to hear it! Yep, I'll be on the call Thursday. It's pretty conversational — we'll go through some architecture scenarios. No live coding, just discussion.",
      createdAt: mockDate(0),
    },
  ],
};

const CONTACT_TALKING_2: ContactWithMessages = {
  id: contactTalkingIds[1]!,
  userId: MOCK_USER_ID,
  name: "Omar Hassan",
  company: "Spiria",
  angle: "RECRUITER" as Angle,
  stage: "TALKING" as Stage,
  linkedinUrl: "https://linkedin.com/in/omarhassan-spiria",
  profileText: "Technical Recruiter at Spiria. Hiring full-stack developers for consulting projects.",
  nextStep: "Final interview Monday",
  createdAt: mockDate(25),
  updatedAt: mockDate(1),
  messages: [
    {
      id: mockId(),
      contactId: contactTalkingIds[1]!,
      role: "YOU" as Role,
      text: "Hi Omar — I've heard good things about Spiria's work on complex client projects. I'm a senior full-stack engineer exploring consulting opportunities. Would love to learn more about what you're hiring for.",
      createdAt: mockDate(22),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[1]!,
      role: "THEM" as Role,
      text: "Hey Alex! Great timing — we're actively building our Montreal team. Your background looks solid. Can you tell me more about your experience with large-scale web apps?",
      createdAt: mockDate(20),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[1]!,
      role: "YOU" as Role,
      text: "Sure! Most recently I built the core platform for a B2B SaaS product — React frontend, Node/Express backend, PostgreSQL. Handled ~50k daily active users. Happy to share more details on a call.",
      createdAt: mockDate(18),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[1]!,
      role: "THEM" as Role,
      text: "That's exactly the kind of experience we need. Let me set up an intro call with our tech lead — how's your availability next week?",
      createdAt: mockDate(15),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[1]!,
      role: "YOU" as Role,
      text: "Had the call with Marc yesterday — great conversation about the healthcare project. He mentioned you'd follow up about next steps?",
      createdAt: mockDate(5),
    },
    {
      id: mockId(),
      contactId: contactTalkingIds[1]!,
      role: "THEM" as Role,
      text: "Yes! Marc was impressed. We'd like to bring you in for a final interview with the partners Monday. Does 2pm work?",
      createdAt: mockDate(1),
    },
  ],
};

// --- CLOSED stage (2 contacts, completed conversations) ---

const contactClosedIds = [mockId(), mockId()];

const CONTACT_CLOSED_1: ContactWithMessages = {
  id: contactClosedIds[0]!,
  userId: MOCK_USER_ID,
  name: "Lisa Wong",
  company: "Osedea",
  angle: "STACK" as Angle,
  stage: "CLOSED" as Stage,
  linkedinUrl: "https://linkedin.com/in/lisawong-osedea",
  profileText: "CTO at Osedea. Full-stack, mobile, and AI projects.",
  nextStep: "Good contact — not hiring now, reconnect Q1",
  createdAt: mockDate(35),
  updatedAt: mockDate(10),
  messages: [
    {
      id: mockId(),
      contactId: contactClosedIds[0]!,
      role: "YOU" as Role,
      text: "Hi Lisa — Osedea's portfolio of AI projects caught my eye. I've been building with TypeScript and exploring ML integrations. Would love to hear about what your team is working on.",
      createdAt: mockDate(30),
    },
    {
      id: mockId(),
      contactId: contactClosedIds[0]!,
      role: "THEM" as Role,
      text: "Thanks for reaching out! We're doing some interesting work with LLMs and computer vision right now. What's your ML background like?",
      createdAt: mockDate(28),
    },
    {
      id: mockId(),
      contactId: contactClosedIds[0]!,
      role: "YOU" as Role,
      text: "Mostly on the integration side — building products that use ML APIs and embeddings, not training models myself. More full-stack + ML-enabled than pure ML.",
      createdAt: mockDate(25),
    },
    {
      id: mockId(),
      contactId: contactClosedIds[0]!,
      role: "THEM" as Role,
      text: "That's actually what we need for most projects! Unfortunately we're not actively hiring right now — budget constraints. But let's stay in touch and reconnect in Q1?",
      createdAt: mockDate(20),
    },
    {
      id: mockId(),
      contactId: contactClosedIds[0]!,
      role: "YOU" as Role,
      text: "Absolutely, I appreciate the transparency. I'll reach out in January. Good luck with the current projects!",
      createdAt: mockDate(10),
    },
  ],
};

const CONTACT_CLOSED_2: ContactWithMessages = {
  id: contactClosedIds[1]!,
  userId: MOCK_USER_ID,
  name: "Nathan Brooks",
  company: "CGI",
  angle: "RECRUITER" as Angle,
  stage: "CLOSED" as Stage,
  linkedinUrl: "https://linkedin.com/in/nathanbrooks-cgi",
  profileText: "Senior Recruiter at CGI. Enterprise consulting roles.",
  nextStep: "Not a fit — looking for more product-focused",
  createdAt: mockDate(40),
  updatedAt: mockDate(15),
  messages: [
    {
      id: mockId(),
      contactId: contactClosedIds[1]!,
      role: "YOU" as Role,
      text: "Hi Nathan — I'm a senior full-stack engineer exploring new opportunities. Curious what kind of technical roles CGI is hiring for in Montreal.",
      createdAt: mockDate(38),
    },
    {
      id: mockId(),
      contactId: contactClosedIds[1]!,
      role: "THEM" as Role,
      text: "Hi Alex! We have several openings. Most of our roles involve working on government and banking projects — long-term contracts with established tech stacks. Interested?",
      createdAt: mockDate(35),
    },
    {
      id: mockId(),
      contactId: contactClosedIds[1]!,
      role: "YOU" as Role,
      text: "Thanks for the context! I think I'm looking for something more product-focused right now — smaller teams, newer tech stacks. But I appreciate you taking the time to explain.",
      createdAt: mockDate(32),
    },
    {
      id: mockId(),
      contactId: contactClosedIds[1]!,
      role: "THEM" as Role,
      text: "No problem at all, totally understand. Feel free to reach out if your priorities change. Good luck with the search!",
      createdAt: mockDate(15),
    },
  ],
};

// Collect all contacts
export const MOCK_CONTACTS: ContactWithMessages[] = [
  CONTACT_REQUESTED_1,
  CONTACT_REQUESTED_2,
  CONTACT_CONTACTED_1,
  CONTACT_CONTACTED_2,
  CONTACT_CONTACTED_3,
  CONTACT_REPLIED_1,
  CONTACT_REPLIED_2,
  CONTACT_REPLIED_3,
  CONTACT_TALKING_1,
  CONTACT_TALKING_2,
  CONTACT_CLOSED_1,
  CONTACT_CLOSED_2,
];

// ============================================================================
// MOCK DRAFT (pre-written, no Claude call)
// ============================================================================

export const MOCK_CONNECTION_DRAFT =
  "Hi — saw you've been at the company for a while. I'm exploring senior roles and curious what the path in looked like for you. Any advice on what to focus on or how to stand out?";

export const MOCK_REPLY_DRAFT =
  "Thanks for the context! That team structure sounds interesting — embedded platform engineers within product pods is a model I've been curious about. Would love to hear more about how that evolved. Happy to hop on a call whenever works for you.";

// ============================================================================
// SEARCHES (generated from mock profile + companies)
// These match the DailySearch type from search generator
// ============================================================================

export interface MockDailySearch {
  company: { id: string; name: string; tier: Tier };
  angle: "ALUM" | "STACK" | "RECRUITER";
  query: string;
  linkedinUrl: string;
}

export const MOCK_DAILY_SEARCHES: MockDailySearch[] = [
  {
    company: { id: "mock_google", name: "Google", tier: "LARGE" },
    angle: "ALUM",
    query: "Google software engineer Concordia",
    linkedinUrl:
      "https://www.linkedin.com/search/results/people/?keywords=Google%20software%20engineer%20Concordia",
  },
  {
    company: { id: "mock_stripe", name: "Stripe", tier: "MID" },
    angle: "STACK",
    query: "Stripe TypeScript React Node.js",
    linkedinUrl:
      "https://www.linkedin.com/search/results/people/?keywords=Stripe%20TypeScript%20React%20Node.js",
  },
  {
    company: { id: "mock_linear", name: "Linear", tier: "MID" },
    angle: "RECRUITER",
    query: "Linear recruiter engineering",
    linkedinUrl:
      "https://www.linkedin.com/search/results/people/?keywords=Linear%20recruiter%20engineering",
  },
];

// ============================================================================
// HELPER: type-safe query result wrapper
// ============================================================================

export function mockQuerySuccess<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    isPending: false,
    isSuccess: true,
    status: "success" as const,
    fetchStatus: "idle" as const,
  };
}
