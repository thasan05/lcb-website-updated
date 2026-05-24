export type Social = {
  linkedin?: string;
  github?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social: Social;
  featured?: boolean;
};

export const team: TeamMember[] = [
  {
    id: "altaf-hossain-raj",
    name: "Altaf Hossain Raj",
    role: "Founder & Lead",
    bio:
      "Building the country's first LinkedIn-based professional community. Obsessed with networks, narrative and the next generation of Bangladeshi leaders.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      facebook: "https://facebook.com",
    },
    featured: true,
  },
  {
    id: "sumaiya-rahman",
    name: "Sumaiya Rahman",
    role: "Co-Lead · Programs",
    bio:
      "Designs LCB's flagship events and masterclasses. Believes great communities are built one thoughtful gathering at a time.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    social: { linkedin: "https://linkedin.com" },
  },
  {
    id: "rafi-ahmed",
    name: "Rafi Ahmed",
    role: "Head of Engineering",
    bio:
      "Open-source contributor. Lives at the intersection of community and code. Building the systems that power LCB.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    social: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    },
  },
  {
    id: "nusrat-jahan",
    name: "Nusrat Jahan",
    role: "Head of Partnerships",
    bio:
      "Bridges campuses, companies and creators. Architect of LCB's collaborations with universities across Bangladesh.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    social: { linkedin: "https://linkedin.com" },
  },
  {
    id: "tanvir-hasan",
    name: "Tanvir Hasan",
    role: "Lead · Content & Brand",
    bio:
      "Storyteller-in-residence. Translates the LCB movement into words, frames and feeds you actually want to follow.",
    image:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=600&q=80",
    social: { linkedin: "https://linkedin.com" },
  },
  {
    id: "anika-chowdhury",
    name: "Anika Chowdhury",
    role: "Community Operations",
    bio:
      "The reason every session runs on time. Coordinates campus leads, mentors and the daily rhythm of LCB.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
    social: { linkedin: "https://linkedin.com" },
  },
];
