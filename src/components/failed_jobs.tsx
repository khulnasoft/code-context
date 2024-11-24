import { ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Button } from "./ui/button";
import { useState } from "react";
import { Job } from "@/app/lib/actions/common/entities/pipelines";

export const FailedJobsComponent = ({ failedJobs }: { failedJobs: Job[] }) => {
    const [expandedJob, setExpandedJob] = useState<number | null>(null);
  
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Failed Jobs</h3>
        {failedJobs.map((job) => (
          <div key={job.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium">{job.name}</h4>
              <a
                href={job.web_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
              >
                View Job <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <Badge variant="destructive">Failed</Badge>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`analysis-job-${job.id}`}>
                <AccordionTrigger>Analysis</AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-muted p-2 rounded-md max-h-40 overflow-y-auto">
                    {job.reason}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`job-${job.id}`}>
                <AccordionTrigger>Job Log</AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-muted p-2 rounded-md max-h-40 overflow-y-auto">
                    {job.log}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
            >
              {expandedJob === job.id ? "Hide Details" : "Show Details"}
            </Button>
            {expandedJob === job.id && (
              <div className="mt-2 space-y-2">
                <p className="text-sm"><strong>Stage:</strong> {job.stage}</p>
                <p className="text-sm"><strong>Duration:</strong> {job.duration} seconds</p>
                <p className="text-sm"><strong>Started At:</strong> {new Date(job.started_at).toLocaleString()}</p>
                <p className="text-sm"><strong>Finished At:</strong> {new Date(job.finished_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };