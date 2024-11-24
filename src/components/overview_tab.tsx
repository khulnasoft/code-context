import { Commit, MRDetails } from "@/app/lib/actions/mr_analysis/actions";
import Markdown from "./ui/markdown";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ExternalLink, GitCommit } from "lucide-react";
import { calculateDaysSince } from "@/app/lib/utils";
import { FailedJobsComponent } from "./failed_jobs";

export const OverviewSection = ({ mrData }: {mrData: MRDetails}) => (
  <div className="space-y-4">
    <div className="bg-muted/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Summary</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Changes: {mrData.codeChanges?.length || 0} files</Badge>
          <Badge variant="outline">Commits: {mrData.commits?.length || 0}</Badge>
          <Badge variant="outline">Comments: {mrData.discussions?.length || 0}</Badge>
          <Badge variant={calculateDaysSince(mrData.created_at) > 7 ? "destructive" : "outline"}>MR Age: {calculateDaysSince(mrData.created_at) || 0}</Badge>
        </div>
        {mrData.summary && (
          <div className="mt-3">
            <Markdown contents={mrData.summary.summary} />
          </div>
        )}
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-4 mt-4 font-semibold">Key Code Changes</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <Markdown contents={mrData.summary.keyChanges} />
          </ul>
        </div>
      </div>
    </div>
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="description">
        <AccordionTrigger className="text-lg font-semibold">
          Original MR Description
        </AccordionTrigger>
        <AccordionContent>
          <Markdown contents={mrData.description} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <div>
      <h3 className="text-lg font-semibold mb-2">Status</h3>
      <div className="flex items-center gap-2">
        <Badge variant={mrData.state === 'open' ? 'default' : 'secondary'}>
          {mrData.state}
        </Badge>
        <Badge variant={mrData.pipeline?.status === 'success' ? 'default' : 'destructive'}>
          Pipeline: {mrData.pipeline?.status || 'unknown'}
        </Badge>
      </div>
    </div>
    {mrData.pipeline?.status === 'failed' && mrData.failingJobs && (
      <FailedJobsComponent failedJobs={mrData.failingJobs} />
    )}
    <div>
      <h3 className="text-lg font-semibold mb-2">Commits ({mrData.commits?.length || 0})</h3>
      <div className="space-y-2">
        {mrData.commits?.map((commit: Commit, index) => (
          <a
            key={index}
            href={commit.web_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors group"
          >
            <GitCommit className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex-grow">{commit.message}</span>
            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  </div>
)
