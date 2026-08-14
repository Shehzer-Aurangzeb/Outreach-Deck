import type { SearchProfile } from "./daily-search-generator";

export type RecruiterType = "AGENCY" | "VENDOR" | "EMBEDDED" | "INTERNAL";

export interface RecruiterSearch {
  id: string;
  label: string;
  description: string;
  query: string;
  googleUrl: string;
  linkedinUrl: string;
  type: RecruiterType;
}

const RECRUITER_TYPE_CONFIG: Record<
  RecruiterType,
  { label: string; description: string }
> = {
  AGENCY: {
    label: "Agency Recruiter",
    description: "Staffing firms with active reqs (S.i. Systems, Robert Half, etc.)",
  },
  VENDOR: {
    label: "Vendor/Contract",
    description: "High-volume contract roles, often remote-friendly",
  },
  EMBEDDED: {
    label: "Embedded/Fractional",
    description: "Work with 1-2 companies, more personal approach",
  },
  INTERNAL: {
    label: "In-house TA",
    description: "Direct company hires, talent acquisition teams",
  },
};

/**
 * Extract location for search (city or region)
 */
function extractLocationForSearch(location: string): string {
  if (!location || location.trim().length === 0) return "Canada";
  
  // Extract city name
  const city = location.split(",")[0]?.trim();
  return city || "Canada";
}

/**
 * Extract primary tech for search (1-2 keywords)
 */
function extractPrimaryTech(stack: string): string {
  if (!stack || stack.trim().length === 0) return "software";
  
  const techKeywords = ["React", "Angular", "Vue", "Node", "Python", "Java", "TypeScript", "JavaScript", "Full Stack", "Frontend", "Backend", "Mobile", "iOS", "Android", "React Native", "DevOps", "Cloud", "AWS", "Data", "ML"];
  
  const stackLower = stack.toLowerCase();
  const found = techKeywords.filter(t => stackLower.includes(t.toLowerCase()));
  
  return found.slice(0, 2).join(" ") || "software";
}

/**
 * Build Google search URL with site:linkedin.com
 */
export function buildGoogleLinkedInUrl(query: string): string {
  const fullQuery = `site:linkedin.com/in ${query}`;
  return `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}`;
}

/**
 * Build LinkedIn search URL
 */
export function buildLinkedInSearchUrl(query: string): string {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
}

/**
 * Generate recruiter search queries based on user profile
 */
export function generateRecruiterSearches(profile: SearchProfile): RecruiterSearch[] {
  const location = extractLocationForSearch(profile.role.includes("Montreal") || profile.role.includes("Toronto") ? profile.role : "Canada");
  const tech = extractPrimaryTech(profile.stack);
  
  // Get location from profile if available, otherwise use Canada
  const searchLocation = profile.education?.includes("Concordia") ? "Montreal" : 
                         profile.education?.includes("Waterloo") || profile.education?.includes("Toronto") ? "Toronto" : 
                         "Canada";

  const searches: RecruiterSearch[] = [
    // Agency recruiters
    {
      id: "agency-tech-canada",
      label: `Technical Recruiter ${tech}`,
      description: "Agency recruiters specializing in your stack",
      query: `technical recruiter ${tech} Canada`,
      googleUrl: buildGoogleLinkedInUrl(`technical recruiter ${tech} Canada`),
      linkedinUrl: buildLinkedInSearchUrl(`technical recruiter ${tech} Canada`),
      type: "AGENCY",
    },
    {
      id: "agency-staffing-firms",
      label: "Staffing Agency Canada",
      description: "Major staffing firms (S.i. Systems, Robert Half, etc.)",
      query: `recruiter staffing agency ${tech} developer ${searchLocation}`,
      googleUrl: buildGoogleLinkedInUrl(`recruiter staffing agency ${tech} developer ${searchLocation}`),
      linkedinUrl: buildLinkedInSearchUrl(`recruiter staffing agency ${tech} developer ${searchLocation}`),
      type: "AGENCY",
    },
    
    // Vendor/Contract recruiters
    {
      id: "vendor-contract",
      label: "Contract Recruiter",
      description: "Vendor recruiters for contract positions",
      query: `contract recruiter ${tech} developer remote Canada`,
      googleUrl: buildGoogleLinkedInUrl(`contract recruiter ${tech} developer remote Canada`),
      linkedinUrl: buildLinkedInSearchUrl(`contract recruiter ${tech} developer remote Canada`),
      type: "VENDOR",
    },
    {
      id: "vendor-consultancy",
      label: "IT Consultancy Recruiter",
      description: "Consulting firm recruiters",
      query: `IT consultancy recruiter ${tech} Canada`,
      googleUrl: buildGoogleLinkedInUrl(`IT consultancy recruiter ${tech} Canada`),
      linkedinUrl: buildLinkedInSearchUrl(`IT consultancy recruiter ${tech} Canada`),
      type: "VENDOR",
    },
    
    // Embedded/Fractional
    {
      id: "embedded-talent",
      label: "Talent Partner",
      description: "Embedded or fractional talent partners",
      query: `talent partner embedded recruiter ${tech} ${searchLocation}`,
      googleUrl: buildGoogleLinkedInUrl(`talent partner embedded recruiter ${tech} ${searchLocation}`),
      linkedinUrl: buildLinkedInSearchUrl(`talent partner embedded recruiter ${tech} ${searchLocation}`),
      type: "EMBEDDED",
    },
    
    // Internal TA
    {
      id: "internal-ta",
      label: "Talent Acquisition",
      description: "In-house company recruiters",
      query: `talent acquisition ${tech} engineer ${searchLocation}`,
      googleUrl: buildGoogleLinkedInUrl(`talent acquisition ${tech} engineer ${searchLocation}`),
      linkedinUrl: buildLinkedInSearchUrl(`talent acquisition ${tech} engineer ${searchLocation}`),
      type: "INTERNAL",
    },
    {
      id: "internal-tech-recruiter",
      label: "Tech Company Recruiter",
      description: "Technical recruiters at tech companies",
      query: `technical recruiter hiring ${tech} developer`,
      googleUrl: buildGoogleLinkedInUrl(`technical recruiter hiring ${tech} developer`),
      linkedinUrl: buildLinkedInSearchUrl(`technical recruiter hiring ${tech} developer`),
      type: "INTERNAL",
    },
  ];

  return searches;
}

/**
 * Generate a custom recruiter search
 */
export function generateCustomRecruiterSearch(
  customQuery: string,
  type: RecruiterType = "AGENCY"
): RecruiterSearch {
  return {
    id: `custom-${Date.now()}`,
    label: "Custom Search",
    description: customQuery,
    query: customQuery,
    googleUrl: buildGoogleLinkedInUrl(customQuery),
    linkedinUrl: buildLinkedInSearchUrl(customQuery),
    type,
  };
}

export { RECRUITER_TYPE_CONFIG };
