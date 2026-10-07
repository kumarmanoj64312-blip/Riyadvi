/**
 * Demo leads for the admin dashboard — FICTIONAL people, all @example.com.
 *
 *   npm run seed:demo           replace demo leads (safe to re-run)
 *   npm run seed:demo -- --clear  remove demo leads only
 *
 * Kept separate from `npm run seed` on purpose, so production never gets fake
 * leads by accident. Uses the real models + the real checkup scoring, so the
 * data looks exactly like genuine submissions. Only documents with an
 * @example.com email are ever touched — real leads are never modified.
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { ContactEnquiry } from "../models/ContactEnquiry.js";
import { ConsultationRequest } from "../models/ConsultationRequest.js";
import { HealthCheckupLead } from "../models/HealthCheckupLead.js";
import { LeadMagnetLead } from "../models/LeadMagnetLead.js";
import { CareerApplication, Job } from "../models/Career.js";
import { answersSchema, recommend, scoreAnswers } from "../services/healthCheckup.service.js";
import { deleteResume, saveResume } from "../services/resumeStorage.service.js";
import { logger } from "../utils/logger.js";

const DEMO = { email: /@example\.com$/i };
const UA = "seed:demo";

/** Date `days` days ago at `hour`:00 — spreads leads across recent weeks. */
const ago = (days, hour = 11) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d;
};
const dated = (doc, days, hour) => ({ ...doc, userAgent: UA, createdAt: ago(days, hour), updatedAt: ago(days, hour) });

/** A small valid one-page PDF so the resume download button works. */
function demoResumePdf(name, role) {
  const text = `${name} - ${role} - demo resume (fictional)`.replace(/[()\\]/g, "");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    null, // content stream, filled below
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const stream = `BT /F1 16 Tf 72 760 Td (${text}) Tj ET`;
  objects[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

/* ─── Demo data (fictional) ─────────────────────────────────────────────── */

const enquiries = [
  [{ name: "Ananya Sharma", email: "ananya.sharma@example.com", phone: "+91 98400 11201", company: "Sharma Dental Care", requirement: "web-development", message: "We need a modern clinic website with online appointment booking and Google reviews.", status: "new", sourcePage: "/contact" }, 0, 10],
  [{ name: "Rohit Verma", email: "rohit.verma@example.com", phone: "+91 98400 11202", company: "UrbanNest Realty", requirement: "ar-vr", message: "Interested in virtual tours for a new residential project launching next quarter.", status: "contacted", sourcePage: "/services/ar-vr" }, 2, 15],
  [{ name: "Meera Iyer", email: "meera.iyer@example.com", phone: "+91 98400 11203", company: "Iyer Organics", requirement: "digital-marketing", message: "Looking for SEO and Instagram ads to grow our D2C store sales.", status: "new", sourcePage: "/contact" }, 4, 12],
  [{ name: "Karthik Raj", email: "karthik.raj@example.com", phone: "+91 98400 11204", company: "FitZone Gyms", requirement: "app-development", message: "Need a member app for class booking and payments across 4 branches.", status: "closed", sourcePage: "/services/app-development" }, 9, 17],
  [{ name: "Fatima Khan", email: "fatima.khan@example.com", phone: "+91 98400 11205", company: "", requirement: "ui-ux-design", message: "Our SaaS dashboard feels cluttered — we'd like a UX audit and redesign.", status: "contacted", sourcePage: "/contact" }, 15, 9],
];

const consultations = [
  [{ name: "Vikram Nair", email: "vikram.nair@example.com", phone: "+91 98400 22301", preferredDate: ago(-3), preferredTime: "11:00-13:00", requirement: "web-development", notes: "Want to discuss migrating from WordPress.", status: "new", sourcePage: "/contact" }, 1, 14],
  [{ name: "Divya Menon", email: "divya.menon@example.com", phone: "+91 98400 22302", preferredDate: ago(-5), preferredTime: "14:00-16:00", requirement: "app-development", notes: "", status: "contacted", sourcePage: "/" }, 3, 11],
  [{ name: "Arjun Pillai", email: "arjun.pillai@example.com", phone: "+91 98400 22303", preferredDate: ago(-1), preferredTime: "09:00-11:00", requirement: "3d-modeling", notes: "Product renders for an e-commerce launch.", status: "closed", sourcePage: "/services/3d-modeling" }, 8, 16],
];

const checkupProfiles = [
  { contact: { name: "Dr. Kavya Rao", email: "kavya.rao@example.com", phone: "+91 98400 33401", company: "Rao Physio Clinic" }, days: 1, hour: 18, status: "new",
    answers: { industry: "healthcare", teamSize: "6-20", goal: "leads", hasWebsite: "outdated", websiteRating: 2, mobile: "partly", presence: ["google"], channels: ["offline"], tracking: "no", budget: "<25k", tools: ["spreadsheets"], automation: "mostly-manual", integrated: "no", appInterest: "maybe", challenges: ["leads", "website"], timeline: "1-3m" } },
  { contact: { name: "Sanjay Gupta", email: "sanjay.gupta@example.com", phone: "+91 98400 33402", company: "Gupta Electronics" }, days: 5, hour: 13, status: "contacted",
    answers: { industry: "retail", teamSize: "21-100", goal: "sales", hasWebsite: "modern", websiteRating: 4, mobile: "yes", presence: ["google", "instagram", "facebook"], channels: ["seo", "social-ads"], tracking: "partly", budget: "25k-1L", tools: ["ecommerce", "erp"], automation: "some", integrated: "some", appInterest: "yes", challenges: ["conversion", "scaling"], timeline: "asap" } },
  { contact: { name: "Neha Joshi", email: "neha.joshi@example.com", phone: "+91 98400 33403", company: "Joshi Learning Hub" }, days: 11, hour: 10, status: "new",
    answers: { industry: "education", teamSize: "1-5", goal: "brand", hasWebsite: "none", websiteRating: 1, mobile: "no", presence: ["instagram", "whatsapp"], channels: ["offline"], tracking: "no", budget: "none", tools: ["spreadsheets"], automation: "mostly-manual", integrated: "no", appInterest: "maybe", challenges: ["visibility", "website", "differentiation"], timeline: "exploring" } },
];

const guideLeads = [
  [{ name: "Priya Shah", email: "priya.shah@example.com", phone: "+91 98400 44501", company: "Shah Interiors", status: "new", sourcePage: "/software-project-planning-guide" }, 0, 16],
  [{ name: "Aditya Kulkarni", email: "aditya.kulkarni@example.com", phone: "+91 98400 44502", company: "Kulkarni Logistics", status: "contacted", sourcePage: "/" }, 6, 12],
  [{ name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "+91 98400 44503", company: "BloomCart", status: "new", sourcePage: "/software-project-planning-guide" }, 13, 19],
];

const applicants = [
  { name: "Rahul Krishnan", email: "rahul.krishnan@example.com", phone: "+91 98400 55601", jobSlug: "frontend-developer-react", message: "3 years of React/Next.js; built two WebGL product configurators.", status: "shortlisted", days: 2, hour: 10 },
  { name: "Pooja Desai", email: "pooja.desai@example.com", phone: "+91 98400 55602", jobSlug: "ui-ux-designer", message: "Product designer with a SaaS and healthcare portfolio.", status: "reviewing", days: 4, hour: 15 },
  { name: "Imran Sheikh", email: "imran.sheikh@example.com", phone: "+91 98400 55603", jobSlug: "backend-developer-node", message: "", status: "new", days: 7, hour: 11 },
];

/* ─── Seeder ────────────────────────────────────────────────────────────── */

async function clearDemo() {
  const apps = await CareerApplication.find(DEMO, { "resume.fileId": 1 }).lean();
  for (const a of apps) await deleteResume(a.resume.fileId).catch(() => {});
  const models = [ContactEnquiry, ConsultationRequest, HealthCheckupLead, LeadMagnetLead, CareerApplication];
  let removed = 0;
  for (const M of models) removed += (await M.deleteMany(DEMO)).deletedCount;
  logger.info(`Demo leads removed: ${removed}`);
}

async function insertDemo() {
  // timestamps:false keeps our spread-out createdAt dates instead of "now".
  const opts = { timestamps: false };
  await ContactEnquiry.insertMany(enquiries.map(([d, days, h]) => dated(d, days, h)), opts);
  await ConsultationRequest.insertMany(consultations.map(([d, days, h]) => dated(d, days, h)), opts);
  await LeadMagnetLead.insertMany(guideLeads.map(([d, days, h]) => dated(d, days, h)), opts);

  // Health checkups: validated + scored by the same code as real submissions.
  await HealthCheckupLead.insertMany(
    checkupProfiles.map(({ contact, answers, days, hour, status }) => {
      const valid = answersSchema.parse(answers);
      const score = scoreAnswers(valid);
      return dated({ ...contact, answers: valid, score, recommendations: recommend(valid, score.areas), status, sourcePage: "/business-health-checkup" }, days, hour);
    }),
    opts,
  );

  // Applications need the seeded jobs (run `npm run seed` first).
  let apps = 0;
  for (const a of applicants) {
    const job = await Job.findOne({ slug: a.jobSlug });
    if (!job) {
      logger.warn(`Job "${a.jobSlug}" not found — run "npm run seed" first; skipping ${a.name}`);
      continue;
    }
    const buffer = demoResumePdf(a.name, job.title);
    const filename = `${a.name.replace(/\s+/g, "-")}-resume.pdf`;
    const fileId = await saveResume({ originalname: filename, mimetype: "application/pdf", buffer }, { jobSlug: job.slug, applicantEmail: a.email });
    await CareerApplication.insertMany(
      [dated({ job: job._id, position: job.title, name: a.name, email: a.email, phone: a.phone, message: a.message, status: a.status, resume: { fileId, filename, contentType: "application/pdf", size: buffer.length } }, a.days, a.hour)],
      opts,
    );
    apps++;
  }
  logger.info(
    `Demo leads added: ${enquiries.length} enquiries, ${consultations.length} consultations, ${checkupProfiles.length} health checkups, ${guideLeads.length} guide downloads, ${apps} applications`,
  );
}

try {
  await connectDB();
  await clearDemo();
  if (!process.argv.includes("--clear")) await insertDemo();
} catch (err) {
  logger.error("Demo seed failed", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
