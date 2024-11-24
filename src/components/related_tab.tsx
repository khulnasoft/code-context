import { MRDetails } from "@/app/lib/actions/mr_analysis/actions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { AlertCircle } from "lucide-react";
import Markdown from "./ui/markdown";

export const AnalysisSection = ({ mrData }: {mrData: MRDetails}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-semibold mb-2">Related Issues</h3>
      <Accordion type="single" collapsible className="w-full">
        {mrData.relatedIssues?.map((issue, index) => (
          <AccordionItem value={`issue-${index}`} key={index}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>#{issue.id}: {issue.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Markdown contents={issue.summary}></Markdown>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
)
