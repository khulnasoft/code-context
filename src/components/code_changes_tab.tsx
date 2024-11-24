import { MRDetails } from "@/app/lib/actions/mr_analysis/actions";
import { ArrowUpRight, FileCode } from "lucide-react";
import Markdown from "./ui/markdown";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

const getImpactColor = (impact: string) => {
  switch (impact.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    default:
      return 'default';
  }
};

const navigateToCodeChange = (codeChangeUrl: string) => {
  window.open(codeChangeUrl, '_blank');
};

export const CodeChangesSection = ({ mrData }: {mrData: MRDetails}) => (
  <div className="space-y-4">
    <Accordion type="multiple" className="w-full space-y-4">
      {mrData.codeChanges?.map((change, index) => (
        <AccordionItem value={`change-${index}`} key={index} className="border rounded-lg">
          <AccordionTrigger className="px-4">
            <div className="flex items-center gap-3 w-full">
              <FileCode className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{change.new_path}</span>
              <Badge variant={getImpactColor(change.impact)} className="ml-auto">
                Impact: {change.impact}
              </Badge>
              <button
                className="ml-2 p-1 rounded-md hover:bg-muted transition-colors"
                onClick={() => navigateToCodeChange(change.web_url)}
              >
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Changes Explained</h4>
                <Markdown contents={change.summary}></Markdown>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Review Notes</h4>
                <Markdown contents={change.review}></Markdown>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
)
