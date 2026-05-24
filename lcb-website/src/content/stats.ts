export type Stat = {
  value: string;
  suffix?: string;
  label: string;
  description: string;
};

export const stats: Stat[] = [
  {
    value: "24",
    suffix: "K+",
    label: "Lives Impacted",
    description: "Students, professionals & creators reached nationwide.",
  },
  {
    value: "40",
    suffix: "+",
    label: "Campus Leads",
    description: "Across leading universities from Dhaka to Chittagong.",
  },
  {
    value: "120",
    suffix: "+",
    label: "Sessions Hosted",
    description: "Masterclasses, workshops & networking nights.",
  },
  {
    value: "1",
    suffix: "st",
    label: "In Bangladesh",
    description: "The nation's first LinkedIn-based professional community.",
  },
];
