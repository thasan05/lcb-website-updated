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

// Fallback verified baseline data directly from the official LCB structure sheet
export const fallbackStructureData: StructureData = {
  lastUpdated: "November 2026",
  depts: [
    [
      "HR & Talent Acquisition Team",
      "Md Junayed Islam Mahi",
      "Senior Executive, HR & Talent Acquisition",
      5,
      [
        ["LCB Star Award Initiative", 12],
        ["Onboarding & Organization Connect Initiative Team", 5],
      ],
    ],
    [
      "Marketing Team",
      "Md Abir Hossain",
      "Marketing Lead",
      9,
      [
        ["LCB Content Master Team", 5],
        ["LCB Digital Horizon (Website & SEO Initiative)", 4],
        ["LCB AI & Videography Excellence Team", 3],
      ],
    ],
    [
      "Operation Team",
      "Kayum Rosul Razu",
      "Deputy Manager, Operation",
      14,
      [["RAT Team (Reporting & Analytics Team)", 3]],
    ],
    [
      "Partnership Team",
      "Syed Istiak Hossen",
      "Deputy Manager, Partnership Team",
      10,
      [
        ["Campus Lead Catalyst Team (CLC Team)", 10],
        ["Collaboration & Alliances Initiative Team", 9],
      ],
    ],
    [
      "Creative Design & Social Media Team",
      "Md. Yasin Islam",
      "Creative Design & Social Media Lead",
      5,
      [
        ["Admin Initiative", 10],
        ["Birthday Celebration Initiative", 2],
        ["Instagram Growth Specialist", 1],
        ["LCB Ideation & Design Excellence", 6],
        ["LCB Spotlight Initiative", 4],
        ["Member's Branding Initiative", 3],
      ],
    ],
    [
      "Communication Team",
      "Jahid Hossain Sunny",
      "Communication Lead",
      9,
      [["Process & Communication Enhancement Team", 5]],
    ],
    [
      "Training & Development Team",
      "Mahmudur Rahman",
      "Assistant Director, Training & Development",
      9,
      [["LCB Intelligence & Research Initiative Team (IRI Team)", 5]],
    ],
    [
      "Corporate Relations & Job Placement Team",
      "Md. Ezaz Ahamed Khan",
      "Assistant Manager, Corporate Relations & Job Placement",
      7,
      [["JIVON Initiative", 3]],
    ],
    [
      "Innovation & Transformation Team",
      "Fabiya Ahsan Ahona",
      "Lead, Innovation & Transformation",
      4,
      [["LCB Strategic Development & Growth", 7]],
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
      17,
      [["Professional & Industry Nexus Initiative Team", 5]],
    ],
    [
      "Event Affairs",
      "S M Muqtadirul Huq",
      "Lead, Event Affairs",
      6,
      [
        ["LCB Certification & Recognition Excellence Initiative", 5],
        ["LCB Media & News Management Team", 2],
      ],
    ],
    [
      "Quality Assurance & Global Benchmarking",
      "Abdullah Kaosar",
      "Lead, Quality Assurance & Global Benchmarking",
      3,
      [],
    ],
  ],
  founder: [
    [
      "Initiative & Project Management and Execution Excellence Team",
      5,
    ],
    ["LCB Beyond Screen Initiative", 9],
    ["LCB Corporate Canvas Coordination Team", 6],
    ["LCB Event Architect", 0],
  ],
  unis: [
    ["Comilla University", 10],
    ["Jagannath University", 7],
    ["Southeast University", 6],
    ["University of Dhaka", 6],
    ["North South University", 5],
    ["American International University-Bangladesh (AIUB)", 4],
    ["Jashore University of Science and Technology", 4],
    ["Jatiya Kabi Kazi Nazrul Islam University", 4],
    ["Patuakhali Science And Technology University", 4],
    ["University of Barishal", 4],
    ["Bangladesh University of Textiles", 3],
    ["Begum Rokeya University", 3],
    ["Daffodil International University", 3],
    ["Hajee Mohammad Danesh Science and Technology University (HSTU)", 3],
    ["Islamic University, Bangladesh", 3],
    ["Jahangirnagar University", 3],
    ["Khulna University", 3],
    ["Mawlana Bhasani Science and Technology University (MSTU)", 3],
    ["Noakhali Science & Technology University (NSTU)", 3],
    ["Shahjalal University of Science and Technology", 3],
    ["United International University (UIU)", 3],
    ["University of Chittagong", 3],
    ["Army Institute of Business Administration", 2],
    ["Bangladesh Agricultural University", 2],
    ["Dhaka College", 2],
    ["East West University", 2],
    ["Green University Of Bangladesh", 2],
    ["International Islamic University Chittagong", 2],
    ["National Institute of Textile engineering & Research (NITER)", 2],
    ["Rangamati Science and Technology University", 2],
    ["University of Rajshahi (RU)", 2],
    ["University of Science and Technology Chittagong", 2],
    ["Bangladesh Army University Of Science And Technology (BAUST)", 1],
    ["Bangladesh University of Professionals", 1],
    ["BGC Trust University Bangladesh", 1],
    ["BGMEA University of Fashion and Technology, Dhaka", 1],
    ["Chittagong Textile Engineering College affiliated to Butex", 1],
    ["Dhaka Central University", 1],
    ["Dhaka International University", 1],
    ["Dhaka Mohanagar Mohila College, Affiliate with National University", 1],
    ["Dhaka University of Engineering & Technology, Gazipur", 1],
    ["East Delta University", 1],
    ["Eden College", 1],
    ["EXIM Bank Agricultural University Bangladesh", 1],
    ["Feni University", 1],
    ["Gopalganj Science and Technology University", 1],
    ["Gopalganj textile engineering college, Gopalganj (BUTEX)", 1],
    ["International University of Business Agriculture and Technology", 1],
    ["Khulna University of Engineering and Technology", 1],
    ["Pabna Textile Engineering College", 1],
    ["Pirojpur science and technology university", 1],
    ["Port City international university", 1],
    ["Rajshahi College", 1],
    ["Sk Borhanuddin Post Graduate College", 1],
    ["Stamford University Bangladesh", 1],
    ["Tangail Textile Engineering College -TTEC", 1],
    ["Tejgaon College", 1],
    ["University of Asia Pacific", 1],
    ["University Of Scholars", 1],
    ["World University of Bangladesh", 1],
  ],
  n_central: 98,
  n_cl: 174,
  n_uni: 67,
  n_ini: 25,
  n_roles: 129,
  n_people: 58,
};
