import Home from "@/components/pages/public/Home/Home";
import { getPortfolioServerData } from "@/lib/server/portfolioData";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const data = await getPortfolioServerData();

  const baseUrl = getSiteUrl();
  const fullName = data.settings.siteName || "Md Abu Rayhan";
  const role = data.settings.tagline || "Frontend Developer";
  const bio =
    data.settings.bio ||
    "Frontend Developer specialized in building high-performance Next.js applications, responsive user interfaces, and modern web products.";

  const socialLinks = [
    data.settings.githubUrl,
    data.settings.linkedinUrl,
    data.settings.twitterUrl,
    data.settings.blogUrl,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${baseUrl}/#person`,
        name: fullName,
        alternateName: ["Abu Rayhan", "Rayhan", "aburayhandev", "Md. Abu Rayhan"],
        url: baseUrl,
        image: `${baseUrl}/logo.svg`,
        jobTitle: role,
        worksFor: {
          "@type": "Organization",
          name: "SM Technology",
        },
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "Bogura Polytechnic Institute",
          department: "Computer Technology",
        },
        hasCredential: [
          {
            "@type": "EducationalOccupationalCredential",
            name: "Complete Web Development Course",
            recognizedBy: {
              "@type": "Organization",
              name: "Programming Hero",
            },
          },
          {
            "@type": "EducationalOccupationalCredential",
            name: "Fundamentals of Webpage Design",
            recognizedBy: {
              "@type": "Organization",
              name: "NACTAR",
            },
          },
          {
            "@type": "EducationalOccupationalCredential",
            name: "Web Development Specialization",
            recognizedBy: {
              "@type": "Organization",
              name: "Nova Institute of Technology & Management",
            },
          },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sherpur",
          addressRegion: "Bogura",
          addressCountry: "Bangladesh",
        },
        email: `mailto:${data.settings.primaryEmail || "aburayhan.bpi@gmail.com"}`,
        telephone: data.settings.whatsapp || "+880 171 985 7898",
        sameAs: socialLinks.length > 0 ? socialLinks : ["https://github.com", "https://linkedin.com"],
        knowsLanguage: ["Bangla", "English"],
        knowsAbout: [
          "React.js",
          "Next.js",
          "TypeScript",
          "JavaScript (ES6+)",
          "Redux Toolkit",
          "RTK Query",
          "Tailwind CSS",
          "Shadcn UI",
          "Node.js",
          "Express.js",
          "MongoDB",
          "RESTful APIs",
          "JWT Authentication",
          "Figma",
          "Responsive UI Design",
          "Zod",
          "Framer Motion",
        ],
        description: bio,
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: `${fullName} | ${role} Portfolio`,
        description: bio,
        publisher: {
          "@id": `${baseUrl}/#person`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "ProfilePage",
        "@id": `${baseUrl}/#profilepage`,
        url: baseUrl,
        name: `${fullName} — Developer Profile`,
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        about: {
          "@id": `${baseUrl}/#person`,
        },
        mainEntity: {
          "@id": `${baseUrl}/#person`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Home initialData={data} />
    </>
  );
}
