import type { Metadata } from "next";
import CognitionClient from "./CognitionClient";

export const metadata: Metadata = {
  title: "Cognition | Zaeem Patel",
  description: "A daily card puzzle: make 24 from four playing cards using + − × ÷. Four new hands every day, from Easy to Expert.",
};

export default function CognitionPage() {
  return <CognitionClient />;
}
