import { MRDetails } from "@/app/lib/actions/mr_analysis/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { OverviewSection } from "./overview_tab";
import { CodeChangesSection } from "./code_changes_tab";
import { DiscussionsSection } from "./discussions_tab";
import { AnalysisSection } from "./related_tab";
import AnalysisTab from "./analysis_tab";
import { SecuritySection } from "./security_tab";

export const MRAnalysis = ({ mrData }: {mrData: MRDetails}) => (
  <Card>
    <CardHeader>
      <CardTitle>MR-{mrData.id}: {mrData.title}</CardTitle>
      <CardDescription>Created by {mrData.author.name} on {new Date(mrData.created_at).toLocaleDateString()}</CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="code-changes">Code Changes</TabsTrigger>
          <TabsTrigger value="related">Related Items</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <OverviewSection mrData={mrData} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="code-changes">
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <CodeChangesSection mrData={mrData} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="discussions">
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <DiscussionsSection mrData={mrData} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="related">
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <AnalysisSection mrData={mrData} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="analysis">
          <AnalysisTab mrData={mrData} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySection mrData={mrData} />
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
)
