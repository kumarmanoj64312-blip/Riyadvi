/**
 * Business Health Checkup — the whole questionnaire as DATA.
 *
 * One config drives three things:
 *   1. the multi-step form UI (frontend renders questions from it)
 *   2. server-side validation (backend builds Zod rules from the exported JSON)
 *   3. scoring + recommendations (option `score`, question `area`, `recommends`)
 * Adding/changing a question = editing this file (+ `npm run export:content`).
 *
 * Scoring: each scored question contributes 0–10 points to its `area`;
 * area score = points / max × 100; overall = average of the areas.
 */

export type CheckupArea = "website" | "marketing" | "technology" | "operations";

export type CheckupOption = {
  value: string;
  label: string;
  /** 0–10 points (single/select). For multi, points add up (capped at 10). */
  score?: number;
  /** Service slug this answer suggests (used for recommendations). */
  recommends?: string;
};

export type CheckupQuestion = {
  id: string;
  label: string;
  help?: string;
  type: "single" | "multi" | "select" | "rating" | "text";
  options?: CheckupOption[];
  required?: boolean;
  /** multi: maximum selections. */
  max?: number;
  /** text: maximum length. */
  maxLength?: number;
  /** Which score area this question feeds (unscored if omitted). */
  area?: CheckupArea;
};

export type CheckupStep = { id: string; title: string; description: string; questions: CheckupQuestion[] };

export const AREA_LABELS: Record<CheckupArea, string> = {
  website: "Website & presence",
  marketing: "Marketing",
  technology: "Technology",
  operations: "Operations",
};

/** Services suggested when an area scores below the threshold. */
export const AREA_RECOMMENDATIONS: Record<CheckupArea, string[]> = {
  website: ["web-development", "ui-ux-design"],
  marketing: ["digital-marketing"],
  technology: ["app-development", "web-development"],
  operations: ["app-development"],
};

export const checkupSteps: CheckupStep[] = [
  {
    id: "business",
    title: "Business information",
    description: "A quick picture of where your business is today.",
    questions: [
      {
        id: "industry",
        label: "Which industry are you in?",
        type: "select",
        required: true,
        options: [
          { value: "healthcare", label: "Healthcare & wellness" },
          { value: "retail", label: "Retail & e-commerce" },
          { value: "real-estate", label: "Real estate & construction" },
          { value: "beauty", label: "Beauty & lifestyle" },
          { value: "education", label: "Education & training" },
          { value: "manufacturing", label: "Manufacturing & B2B" },
          { value: "services", label: "Professional services" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "teamSize",
        label: "How big is your team?",
        type: "single",
        required: true,
        options: [
          { value: "1-5", label: "1–5" },
          { value: "6-20", label: "6–20" },
          { value: "21-100", label: "21–100" },
          { value: "100+", label: "100+" },
        ],
      },
      {
        id: "goal",
        label: "What's your #1 goal for the next 12 months?",
        type: "single",
        required: true,
        options: [
          { value: "leads", label: "More leads & enquiries", recommends: "digital-marketing" },
          { value: "sales", label: "More online sales", recommends: "web-development" },
          { value: "efficiency", label: "Save time with better systems", recommends: "app-development" },
          { value: "brand", label: "A stronger, more premium brand", recommends: "ui-ux-design" },
          { value: "launch", label: "Launch a new product or app", recommends: "app-development" },
        ],
      },
    ],
  },
  {
    id: "website",
    title: "Website & digital presence",
    description: "How customers find and experience you online.",
    questions: [
      {
        id: "hasWebsite",
        label: "Do you have a website today?",
        type: "single",
        required: true,
        area: "website",
        options: [
          { value: "modern", label: "Yes, and it's modern", score: 10 },
          { value: "outdated", label: "Yes, but it's outdated", score: 4, recommends: "web-development" },
          { value: "none", label: "No website yet", score: 0, recommends: "web-development" },
        ],
      },
      {
        id: "websiteRating",
        label: "How well does your website turn visitors into enquiries?",
        help: "1 = barely at all · 5 = it's our best salesperson",
        type: "rating",
        required: true,
        area: "website",
      },
      {
        id: "mobile",
        label: "Does it work well on mobile phones?",
        type: "single",
        required: true,
        area: "website",
        options: [
          { value: "yes", label: "Yes", score: 10 },
          { value: "partly", label: "Partly", score: 5, recommends: "ui-ux-design" },
          { value: "no", label: "No / not sure", score: 1, recommends: "ui-ux-design" },
        ],
      },
      {
        id: "presence",
        label: "Where else can customers find you?",
        help: "Select all that apply",
        type: "multi",
        area: "website",
        options: [
          { value: "google", label: "Google Business Profile", score: 3 },
          { value: "instagram", label: "Instagram", score: 2 },
          { value: "facebook", label: "Facebook", score: 1 },
          { value: "linkedin", label: "LinkedIn", score: 2 },
          { value: "youtube", label: "YouTube", score: 2 },
          { value: "whatsapp", label: "WhatsApp Business", score: 2 },
          { value: "marketplaces", label: "Marketplaces (Amazon, Practo…)", score: 2 },
        ],
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "How you attract and convert new customers.",
    questions: [
      {
        id: "channels",
        label: "Which marketing channels do you actively use?",
        help: "Select all that apply",
        type: "multi",
        area: "marketing",
        options: [
          { value: "seo", label: "SEO / content", score: 3 },
          { value: "search-ads", label: "Google Ads", score: 3 },
          { value: "social-ads", label: "Social media ads", score: 3 },
          { value: "email", label: "Email / WhatsApp campaigns", score: 2 },
          { value: "offline", label: "Offline & word of mouth", score: 1 },
        ],
      },
      {
        id: "tracking",
        label: "Do you know which channel brings your customers?",
        type: "single",
        required: true,
        area: "marketing",
        options: [
          { value: "yes", label: "Yes, we track it", score: 10 },
          { value: "partly", label: "Roughly", score: 5, recommends: "digital-marketing" },
          { value: "no", label: "Not really", score: 0, recommends: "digital-marketing" },
        ],
      },
      {
        id: "budget",
        label: "Monthly marketing budget",
        type: "single",
        required: true,
        options: [
          { value: "none", label: "Not yet" },
          { value: "<25k", label: "Under ₹25k" },
          { value: "25k-1L", label: "₹25k – ₹1L" },
          { value: "1L+", label: "Over ₹1L" },
        ],
      },
    ],
  },
  {
    id: "technology",
    title: "Technology",
    description: "The systems your team runs the business on.",
    questions: [
      {
        id: "tools",
        label: "Which tools do you use today?",
        help: "Select all that apply",
        type: "multi",
        area: "technology",
        options: [
          { value: "crm", label: "CRM", score: 3 },
          { value: "erp", label: "ERP / accounting software", score: 2 },
          { value: "booking", label: "Online booking / ordering", score: 3 },
          { value: "ecommerce", label: "E-commerce platform", score: 2 },
          { value: "custom", label: "Custom-built software", score: 3 },
          { value: "spreadsheets", label: "Mostly spreadsheets", score: 0 },
        ],
      },
      {
        id: "automation",
        label: "How much of your day-to-day work is manual?",
        type: "single",
        required: true,
        area: "operations",
        options: [
          { value: "mostly-manual", label: "Most of it", score: 1, recommends: "app-development" },
          { value: "some", label: "Some of it", score: 6 },
          { value: "automated", label: "Very little — it's automated", score: 10 },
        ],
      },
      {
        id: "integrated",
        label: "Do your systems share data with each other?",
        type: "single",
        required: true,
        area: "operations",
        options: [
          { value: "yes", label: "Yes, they're integrated", score: 10 },
          { value: "some", label: "Some of them", score: 5 },
          { value: "no", label: "No — lots of copy-paste", score: 0, recommends: "web-development" },
        ],
      },
      {
        id: "appInterest",
        label: "Would a mobile app help your customers or team?",
        type: "single",
        required: true,
        options: [
          { value: "yes", label: "Yes, definitely", recommends: "app-development" },
          { value: "maybe", label: "Maybe" },
          { value: "no", label: "Not right now" },
        ],
      },
    ],
  },
  {
    id: "challenges",
    title: "Business challenges",
    description: "What's getting in the way of growth right now?",
    questions: [
      {
        id: "challenges",
        label: "Pick your top challenges",
        help: "Up to 3",
        type: "multi",
        required: true,
        max: 3,
        options: [
          { value: "leads", label: "Not enough leads", recommends: "digital-marketing" },
          { value: "conversion", label: "Visitors don't convert", recommends: "ui-ux-design" },
          { value: "manual", label: "Too much manual work", recommends: "app-development" },
          { value: "website", label: "Outdated website", recommends: "web-development" },
          { value: "visibility", label: "Low online visibility", recommends: "digital-marketing" },
          { value: "scaling", label: "Tech can't keep up with growth", recommends: "web-development" },
          { value: "differentiation", label: "Hard to stand out", recommends: "ar-vr" },
        ],
      },
      {
        id: "details",
        label: "Anything else we should know?",
        type: "text",
        maxLength: 500,
      },
      {
        id: "timeline",
        label: "When would you like to start?",
        type: "single",
        required: true,
        options: [
          { value: "asap", label: "As soon as possible" },
          { value: "1-3m", label: "In 1–3 months" },
          { value: "3-6m", label: "In 3–6 months" },
          { value: "exploring", label: "Just exploring" },
        ],
      },
    ],
  },
];
