export type ClubDomain =
  | "AI"
  | "Quant"
  | "Finance"
  | "Robotics"
  | "Music"
  | "Sports"
  | "Development"
  | "Other";

export interface Club {
  id: string;
  name: string;
  domain: ClubDomain;
  description: string;
  recruitmentStatus: "Open Now" | "Waitlist" | "Closed";
  matchScore: number;
}

export const CLUBS: Club[] = [
  {
    id: "ai-lab",
    name: "Campus AI Lab",
    domain: "AI",
    description:
      "Research-driven community exploring machine learning, LLMs, and applied AI projects.",
    recruitmentStatus: "Open Now",
    matchScore: 92,
  },
  {
    id: "quant-finance",
    name: "Quant & Finance Society",
    domain: "Quant",
    description:
      "Student-run group focused on trading, quantitative research, and financial markets.",
    recruitmentStatus: "Open Now",
    matchScore: 88,
  },
  {
    id: "dev-club",
    name: "Developer Collective",
    domain: "Development",
    description:
      "Build real products with peers across web, mobile, and open-source projects.",
    recruitmentStatus: "Waitlist",
    matchScore: 84,
  },
  {
    id: "robotics-club",
    name: "Robotics & Automation Club",
    domain: "Robotics",
    description:
      "Hands-on robotics, embedded systems, and competition teams for all experience levels.",
    recruitmentStatus: "Open Now",
    matchScore: 79,
  },
  {
    id: "music-collective",
    name: "Campus Music Collective",
    domain: "Music",
    description:
      "Band, production, and events for musicians and music enthusiasts across campus.",
    recruitmentStatus: "Waitlist",
    matchScore: 73,
  },
  {
    id: "sports-council",
    name: "Sports Council",
    domain: "Sports",
    description:
      "Organises tournaments, pick-up games, and fitness events across multiple sports.",
    recruitmentStatus: "Open Now",
    matchScore: 76,
  },
  {
    id: "fin-literacy",
    name: "Finance & Investing Circle",
    domain: "Finance",
    description:
      "Learn investing, personal finance, and markets through peer-led sessions.",
    recruitmentStatus: "Closed",
    matchScore: 68,
  },
  {
    id: "makers-guild",
    name: "Makers Guild",
    domain: "Other",
    description:
      "Interdisciplinary builders working on hardware, art, and everything in between.",
    recruitmentStatus: "Open Now",
    matchScore: 81,
  },
];

