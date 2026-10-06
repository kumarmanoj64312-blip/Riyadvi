import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobTemplate } from "@/components/templates/JobTemplate";
import { getJob, getJobs } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export async function generateStaticParams() {
  return (await getJobs()).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const job = await getJob((await params).slug);
  if (!job) return { title: "Role not found" };
  return { title: `${job.title} — Careers`, description: job.summary };
}

/** /careers/[slug] — data → JobTemplate, plus JobPosting structured data (Google Jobs). */
export default async function JobPage({ params }: PageProps<"/careers/[slug]">) {
  const job = await getJob((await params).slug);
  if (!job || !job.open) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [job.summary, ...job.responsibilities, ...job.requirements].join(" "),
    datePosted: job.postedAt,
    employmentType: job.type === "Full-time" ? "FULL_TIME" : job.type === "Internship" ? "INTERN" : "CONTRACTOR",
    hiringOrganization: { "@type": "Organization", name: siteConfig.name, sameAs: siteConfig.url },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "IN" } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <JobTemplate job={job} />
    </>
  );
}
