import { MRDetails } from "@/app/lib/actions/mr_analysis/actions";
import Markdown from "./ui/markdown";

export const SecuritySection = ({ mrData }: {mrData: MRDetails}) => (
  <div className="space-y-4">
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="space-y-2">
        {mrData.summary && (
          <div className="mt-3">
            <Markdown contents={mrData.securityReview} />
          </div>
        )}
      </div>
    </div>
  </div>
)
