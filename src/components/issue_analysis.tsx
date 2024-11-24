import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Link, MessageSquare, ChevronDown, ChevronUp, LockKeyhole } from 'lucide-react';
import type { Issue } from '@/app/lib/actions/common/entities/issue'
import Markdown from '@/components/ui/markdown';

const IssueAnalysis = ({ issue }: {issue: Issue}) => {

  const analysis = issue.analysis;
  const [expandedIssues, setExpandedIssues] = useState<{ [key: number]: boolean }>({});
  const [expandedMRs, setExpandedMRs] = useState<{ [key: number]: boolean }>({});

  const toggleIssueExpansion = (index: number) => {
    setExpandedIssues((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleMRExpansion = (index: number) => {
    setExpandedMRs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Tabs defaultValue="understanding" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="understanding">
          <BookOpen className="w-4 h-4 mr-2" />
          Understanding
        </TabsTrigger>
        <TabsTrigger value="related">
          <Link className="w-4 h-4 mr-2" />
          Related Items
        </TabsTrigger>
        <TabsTrigger value="comments">
          <MessageSquare className="w-4 h-4 mr-2" />
          Comments
        </TabsTrigger>
        <TabsTrigger value="security">
          <LockKeyhole className="w-4 h-4 mr-2" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="understanding">
        <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border p-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Main Problem & Outcome</h3>
              <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{analysis.understanding.mainProblem}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Requirements & Details</h3>
              <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{analysis.understanding.requirements}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Use Case Analysis</h3>
              <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{analysis.understanding.useCase}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Unfamiliar Terms</h3>
              <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{analysis.understanding.unfamiliarTerms}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Key Terms & Concepts</h3>
              <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{analysis.understanding.keyTerms}</p>
            </section>
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="related">
        <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border p-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-4">Related Issues</h3>
              {issue.linkedIssues.map((issue, index) => (
                <div key={index} className="border rounded-md p-4 space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium "><span className="font-semibold">Title: </span>{issue.title}</div>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => toggleIssueExpansion(index)}
                    >
                      {expandedIssues[index] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expandedIssues[index] && (
                    <Markdown contents={issue.summary} />
                  )}
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4">Related Merge Requests</h3>
              {issue.mergeRequests.map((mr, index) => (
                <div key={index} className="border rounded-md p-4 space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium "><span className="font-semibold">Title: </span>{mr.title}</div>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => toggleMRExpansion(index)}
                    >
                      {expandedMRs[index] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expandedMRs[index] && (
                    <Markdown contents={mr.summary} />
                  )}
                </div>
              ))}
            </section>
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="comments">
        <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border p-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
              <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{analysis.comments.insights}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Concerns & Suggestions</h3>
              <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{analysis.comments.concerns}</p>
            </section>
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="security">
        <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border p-4">
            <Markdown contents={issue.securityRecommentations} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default IssueAnalysis;