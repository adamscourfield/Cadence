import { PageHeader } from "@/components/ui";
import { LiveSession } from "./LiveSession";

export const metadata = { title: "Live lesson · Cadence" };

export default function LivePage() {
  return (
    <>
      <PageHeader eyebrow="Live" title={<>Teaching, <span className="glow-text">heard clearly.</span></>} />
      <LiveSession />
    </>
  );
}
