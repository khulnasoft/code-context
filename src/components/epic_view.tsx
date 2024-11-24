'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, Clock, AlertTriangle, XCircle, ChevronRight, ChevronDown } from 'lucide-react'
import { Epic } from '@/app/lib/actions/common/entities/epic'
import { formatDateForUI } from '@/app/lib/utils'
import Markdown from './ui/markdown'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

export default function EpicView({ epicData }: { epicData: Epic }) {
  const [expandedEpics, setExpandedEpics] = useState<number[]>([])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return <CheckCircle className="text-green-500" />
      case 'in_progress':
        return <Clock className="text-blue-500" />
      case 'blocked':
        return <AlertTriangle className="text-red-500" />
      case 'OPEN':
        return <XCircle className="text-gray-500" />
    }
  }

  const toggleEpicExpansion = (epicId: number) => {
    setExpandedEpics(prev => 
      prev.includes(epicId) 
        ? prev.filter(id => id !== epicId)
        : [...prev, epicId]
    )
  }

  const calculateProgress = (epic: Epic) => {
    const totalIssues = epic.issues.length;
    if (totalIssues === 0) return 0;

    const completedIssues = epic.issues.filter(issue => issue.state === 'CLOSED').length;
    return Math.round((completedIssues / totalIssues) * 100);
  }

  const renderEpic = (epic: Epic, depth = 0) => (
    <div key={epic.iid} className={`mb-4 ${depth > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6"
          onClick={() => toggleEpicExpansion(epic.iid)}
        >
          {expandedEpics.includes(epic.iid) ? <ChevronDown /> : <ChevronRight />}
        </Button>
        <h3 className="font-semibold">{epic.title}</h3>
      </div>
      {expandedEpics.includes(epic.iid) && (
        <div className="ml-6">
          <Markdown contents={epic.description} />
          {epic.childEpics?.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold mb-1 mt-4">Child Epics:</h4>
              {epic.childEpics?.map(childEpic => renderEpic(childEpic, depth + 1))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{epicData.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-500" />
            <span>{formatDateForUI(epicData.createdAt)} - {formatDateForUI(epicData.closedAt)}</span>
          </div>
          <div className="w-1/3">
            <Progress value={calculateProgress(epicData)} />
            <span className="text-sm text-gray-600">{calculateProgress(epicData)}% complete</span>
          </div>
        </div>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="structure">Epic Structure</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Epic Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mt-4 mb-2">Summary:</h3>
                <Markdown contents={epicData.summary?.summary || ''} />
                <h3 className="font-semibold mt-4 mb-2">Key Points:</h3>
                <Markdown contents={epicData.summary?.keyPoints || ''} />
                <h3 className="font-semibold mt-4 mb-2">Discussion Summary:</h3>
                <Markdown contents={epicData.summary?.discussionSummary || ''} />
                <h3 className="font-semibold mt-4 mb-2">Closed Issues:</h3>
                <Markdown contents={epicData.summary?.closedIssues || ''} />
                <h3 className="font-semibold mt-4 mb-2">Pending Issues:</h3>
                <Markdown contents={epicData.summary?.pendingIssues || ''} />
                <h3 className="font-semibold mt-4 mb-2">Stats:</h3>
                <ul className="list-disc pl-5">
                  <li>Total issues: {epicData.issues.length}</li>
                  <li>Completed: {epicData.issues.filter(issue => issue.state === 'CLOSED').length}</li>
                  <li>Pending: {epicData.issues.filter(issue => issue.state === 'OPEN').length}</li>
                  <li>Child Epics: {epicData.childEpics.length}</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Issue Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {epicData.issues.map((issue, index) => (
                    <AccordionItem value={`item-${index}`} key={issue.iid}>
                      <AccordionTrigger>
                        <div className="flex justify-between items-center w-full">
                          <span>{issue.title}</span>
                          <div className="flex items-center space-x-2">
                            <Badge>{issue.state}</Badge>
                            <Badge variant="secondary">Release {issue.milestone?.title || 'Not Assigned'}</Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Markdown contents={issue.summary} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="releases">
            <Card>
              <CardHeader>
                <CardTitle>What has been/is being delivered in each release?</CardTitle>
              </CardHeader>
              <CardContent>
                {epicData.releaseNotes?.map(({ milestone: release, summary }) => (
                  <div key={release} className="mb-4">
                    <h3 className="font-semibold mb-2">Release {release}</h3>
                    <Markdown contents={summary} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Issue Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {(['CLOSED', 'OPEN']).map(status => (
                    <div key={status} className="border rounded p-4">
                      <h3 className="font-semibold mb-2 flex items-center">
                        {getStatusIcon(status)}
                        <span className="ml-2 capitalize">{status.replace('_', ' ')}</span>
                      </h3>
                      <ul className="list-disc pl-5">
                        {epicData.issues.filter(issue => issue.state === status).map(issue => (
                          <li key={issue.id}>{issue.title} (Release {issue.milestone?.title || 'Not Assigned'})</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="structure">
            <Card>
              <CardHeader>
                <CardTitle>Epic Structure</CardTitle>
              </CardHeader>
              <CardContent>
                {renderEpic(epicData)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}