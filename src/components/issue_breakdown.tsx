'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Issue, BaseIssue, CreatedIssue } from '@/app/lib/actions/common/entities/issue';
import { createIssues } from '@/app/lib/actions/issues/create';
import Markdown from './ui/markdown'
import { ExternalLink, BookOpen, Link, Gavel, MessageSquare, LockKeyhole, ChevronUp, ChevronDown } from 'lucide-react'

export default function IssueBreakdownTool({ issue, setError }: {issue: Issue, setError: (err: string | null) => void }) {
  const [selectedIssues, setSelectedIssues] = useState<BaseIssue[]>([])
  const [createdIssues, setCreatedIssues] = useState<CreatedIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tab, setTab] = useState("suggested");
  const [convertToEpic, setConvertToEpic] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<{ [key: number]: boolean }>({});
  const [expandedMRs, setExpandedMRs] = useState<{ [key: number]: boolean }>({});

  const analysis = issue.analysis;

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

  const handleIssueSelection = (item: BaseIssue) => {
    setSelectedIssues(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const handleCreateIssues = async () => {
    setIsLoading(true)
    setError(null)

    if (!issue) return

    try {
      const result = await createIssues(selectedIssues, issue, convertToEpic)
      setCreatedIssues(result)
      setTab("created")
    } catch (err) {
      setError('Failed to create issues. Please try again.'+ err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`grid grid-cols-1 gap-6 flex-grow`}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Issue Overview</CardTitle>
          <CardDescription>
            View, analyze, and understand the issue
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Tabs defaultValue="understanding" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="understanding">
              <BookOpen className="w-4 h-4 mr-2" />
              Understanding
            </TabsTrigger>
            <TabsTrigger value="original">
              <BookOpen className="w-4 h-4 mr-2" />
              Original Issue
            </TabsTrigger>
            <TabsTrigger value="related">
              <Link className="w-4 h-4 mr-2" />
              Related Items
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="breakdown">
              <Gavel className="w-4 h-4 mr-2" />
              Issue Breakdown
            </TabsTrigger>
            <TabsTrigger value="security">
              <LockKeyhole className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original">
            <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border p-4">
              <div className="space-y-6">
                <section>
                <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">ID: {issue.id}</p>
                  <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border p-4 mb-4">
                    <Markdown contents={issue.description} />
                  </ScrollArea>
                </section>
              </div>
            </ScrollArea>
          </TabsContent>

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

          <TabsContent value="breakdown">
            <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border p-4">
              <section>
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="suggested">Suggested Breakdown</TabsTrigger>
                    <TabsTrigger value="created">Created Issues</TabsTrigger>
                  </TabsList>
                  <TabsContent value="suggested">
                    {issue.breakdown.length > 0 ? (
                      <>
                        <ScrollArea className="h-[calc(100vh-500px)] w-full rounded-md border p-4 mb-4">
                          <p className="text-sm text-muted-foreground mb-4" style={{ whiteSpace: 'pre-line' }}>This is a suggested approach for resolving the issue, along with the steps to follow. If you see a step that you would like to break out into its own issue for iterative development, you can check the checkbox next to it. Note that not all checkboxes are meant to be checked—this setup gives you the flexibility to decide if you want to break down an issue into smaller MVCs, providing guidance on where logical breakpoints might be. In essence, this tool serves two purposes: it suggests a potential step by step approach to resolving the issue and offers ideas for where the issue could logically be broken down. Feel free to adopt or adapt it as you see fit. This tool is intended as an idea generator, not a mandatory solution.</p>
                          <ul className="space-y-4">
                            {issue.breakdown.map((item, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`issue-${index}`}
                                  checked={selectedIssues.includes(item)}
                                  onCheckedChange={() => handleIssueSelection(item)}
                                  className="mt-1"
                                />
                                <label
                                  htmlFor={`issue-${index}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  <h4 className="font-semibold mb-1">{item.title}</h4>
                                  <Markdown contents={item.description} />
                                </label>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                        <div className="mb-4 p-4 bg-muted rounded-md">
                          <h4 className="font-semibold mb-2">Selected Issues: {selectedIssues.length}</h4>
                          {selectedIssues.length > 0 && (
                            <ul className="list-disc list-inside">
                              {selectedIssues.map((issue, index) => (
                                <li key={index} className="text-sm truncate">{issue.title}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Switch
                            id="convert-to-epic"
                            checked={convertToEpic}
                            onCheckedChange={setConvertToEpic}
                          />
                          <Label htmlFor="convert-to-epic">Convert to Epic</Label>
                        </div>
                        <Button
                          onClick={handleCreateIssues}
                          disabled={isLoading || selectedIssues.length === 0}
                        >
                          {convertToEpic ? 'Create Epic and Issues' : 'Create Selected Issues'}
                        </Button>
                      </>
                    ) : (
                      <div>
                        <p className="text-muted-foreground">The author of this issue has done a fantastic job providing clear context, actionable steps, and relevant information, making it easy for the team to understand and address.</p>
                        <p className="text-muted-foreground">No further breakdown is needed— Great job!</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="created">
                    {createdIssues.length > 0 ? (
                      <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border p-4">
                        <ul className="space-y-4">
                          {createdIssues.map((issue, index) => (
                            <li key={index} className="border-b pb-2 last:border-b-0">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold">{issue.title}</span>
                                <a href={issue.web_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  <ExternalLink className="w-4 h-4 inline mr-1" aria-label="Open issue in new tab" />
                                  {issue.id}
                                </a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <p className="text-muted-foreground">No issues created yet. Select and create issues from the suggested breakdown.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </section>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      </Card>
    </div>
  )
}