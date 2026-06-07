import type { Metadata } from "next";
import { ShoutGenerator } from "./ShoutGenerator";

export const metadata: Metadata = {
  title: "Shout Out · LinkedIn Community Bangladesh",
  description:
    "Recognise someone who made a difference. Create a personalised LCB Shout-Out card and share it in seconds.",
  openGraph: {
    title: "LCB Shout Out — Recognise Your People",
    description: "Create a personalised LCB recognition card.",
    url: "https://shout.linkedincommunitybangladesh.com",
  },
};

export default function ShoutPage() {
  return <ShoutGenerator />;
}
