export interface InitiativeItem {
  name: string;
  roles: number;
}

export interface DepartmentItem {
  name: string;
  head: string;
  designation: string;
  members: number;
  initiatives: [string, number][];
}

export interface StructureData {
  lastUpdated: string;
  depts: [string, string, string, number, [string, number][]][];
  founder: [string, number][];
  unis: [string, number][];
  n_central: number;
  n_cl: number;
  n_uni: number;
  n_ini: number;
  n_roles: number;
  n_people: number;
}

// Fallback verified baseline data directly from the official LCB structure artifact
export const fallbackStructureData: StructureData = {
  lastUpdated: "November 2026",
  depts: [
    [
      "HR & Talent Acquisition Team",
      "Md Junayed Islam Mahi",
      "Senior Executive, HR & Talent Acquisition",
      4,
      [["Onboarding & Organization Connect Initiative Team", 4]],
    ],
    [
      "Marketing Team",
      "Md Abir Hossain",
      "Marketing Lead",
      9,
      [["LCB Content Master Team", 3]],
    ],
    [
      "Operation Team",
      "Kayum Rosul Razu",
      "Deputy Manager, Operation",
      9,
      [["RAT Team (Reporting & Analytics Team)", 3]],
    ],
    [
      "Partnership Team",
      "Syed Istiak Hossen",
      "Deputy Manager, Partnership Team",
      6,
      [
        ["Collaboration & Alliances Initiative Team", 5],
        ["Campus Lead Catalyst Team (CLC Team)", 4],
      ],
    ],
    [
      "Creative Design & Social Media Team",
      "Md. Yasin Islam",
      "Creative Design & Social Media Lead",
      3,
      [
        ["Admin Initiative", 6],
        ["LCB Ideation & Design Excellence", 5],
        ["LCB Spotlight Initiative", 4],
        ["Birthday Celebration Initiative", 2],
        ["Member’s Branding Initiative", 2],
        ["Instagram Growth Specialist", 1],
      ],
    ],
    [
      "Communication Team",
      "Jahid Hossain Sunny",
      "Communication Lead",
      8,
      [["Process & Communication Enhancement Team", 3]],
    ],
    [
      "Training & Development Team",
      "Mahmudur Rahman",
      "Assistant Director, Training & Development",
      8,
      [],
    ],
    [
      "Corporate Relations & Job Placement Team",
      "Md. Ezaz Ahamed Khan",
      "Assistant Manager, Corporate Relations & Job Placement",
      3,
      [["JIVON Initiative", 2]],
    ],
    [
      "Innovation & Transformation Team",
      "Fabiya Ahsan Ahona",
      "Lead, Innovation & Transformation",
      4,
      [["LCB Strategic Development & Growth", 5]],
    ],
    [
      "Campus Outreach & Lead Management",
      "Md Abu Talha",
      "Assistant Manager, Partnership",
      0,
      [],
    ],
    [
      "Mentor & Industry Connect Team",
      "Abu Helal Rashid Reza",
      "Assistant Director, Mentor & Industry Connect",
      12,
      [["Professional & Industry Nexus Initiative Team", 2]],
    ],
    [
      "Event Affairs",
      "S M Muqtadirul Huq",
      "Lead, Event Affairs",
      3,
      [],
    ],
    [
      "Quality Assurance & Global Benchmarking",
      "Abdullah Kaosar",
      "Lead, Quality Assurance & Global Benchmarking",
      2,
      [],
    ],
  ],
  founder: [
    ["LCB Star Award Initiative", 10],
    ["LCB Event Architect", 9],
    ["LCB Beyond Screen Initiative", 7],
    ["Initiative & Project Management and Execution Excellence Team", 5],
    ["LCB Certification & Recognition Excellence Initiative", 4],
    ["LCB Digital Horizon (Website & SEO Initiative)", 4],
    ["LCB Intelligence & Research Initiative Team (IRI Team)", 4],
    ["LCB AI & Videography Excellence Team", 1],
    ["LCB Corporate Canvas Coordination Team", 1],
    ["LCB Media & News Management Team", 1],
  ],
  unis: [
    ["Jagannath University", 8],
    ["Patuakhali S&T University", 5],
    ["Shahjalal University of Science and Technology", 4],
    ["Jatiya Kabi Kazi Nazrul Islam University", 4],
    ["University of Chittagong", 4],
    ["University of Dhaka", 4],
    ["Army Institute of Business Administration", 4],
    ["Begum Rokeya University", 3],
    ["Khulna University", 3],
    ["United International University (UIU)", 3],
    ["Islamic University, Bangladesh", 3],
    ["University of Barishal", 3],
    ["Hajee Mohammad Danesh S&T University", 3],
    ["North South University", 3],
    ["Noakhali S&T University", 3],
    ["Mawlana Bhasani Science and Technology University (MSTU)", 3],
    ["Chittagong Textile Engineering College affiliated to Butex", 3],
    ["Dhaka College", 2],
    ["NITER", 2],
    ["Bangladesh University of Textiles", 2],
    ["International Islamic University Chittagong", 2],
    ["Bangladesh Agricultural University", 2],
    ["Rangamati S&T University", 2],
    ["Jashore University of Science and Technology", 2],
    ["University of Rajshahi (RU)", 2],
    ["Comilla University", 2],
    ["American International University-Bangladesh (AIUB)", 2],
    ["University of Science and Technology Chittagong", 2],
    ["Daffodil international university", 1],
    ["Gopalganj textile engineering college, Gopalganj (BUTEX)", 1],
    ["Jahangirnagar University", 1],
    ["University Of Scholars", 1],
    ["Tejgaon College", 1],
    ["Pabna Textile Engineering College", 1],
    ["Green University Of Bangladesh", 1],
    ["BGC Trust University Bangladesh", 1],
    ["Islamic university kushtia", 1],
    ["World University of Bangladesh", 1],
    ["East Delta University", 1],
    ["East West University", 1],
    ["Tangail Textile Engineering College -TTEC", 1],
    ["Eden College", 1],
    ["EXIM Bank Agricultural University Bangladesh", 1],
    ["Dhaka Mohanagar Mohila College, Affiliate with National University", 1],
    ["Port City international university", 1],
    ["Bangladesh Army University Of Science And Technology (BAUST)", 1],
    ["Rajshahi Collage", 1],
    ["Sk Borhanuddin Post Graduate College", 1],
    ["Gopalganj Science and Technology University", 1],
    ["Stamford University Bangladesh", 1],
    ["Dhaka Central University", 1],
    ["Southeast University", 1],
    ["Feni University", 1],
    ["BGMEA University of Fashion and Technology, Dhaka", 1],
    ["Dhaka University of Engineering & Technology, Gazipur", 1],
    ["Dhaka International University", 1],
    ["University of Asia Pacific", 1],
  ],
  n_central: 71,
  n_cl: 114,
  n_uni: 57,
  n_ini: 25,
  n_roles: 97,
  n_people: 53,
};
