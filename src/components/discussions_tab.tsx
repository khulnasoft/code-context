import { MRDetails } from "@/app/lib/actions/mr_analysis/actions";
import { ArrowUpRight } from "lucide-react";
import Markdown from "./ui/markdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

const navigateToDiscussion = (discussionUrl: string) => {
  window.open(discussionUrl, '_blank');
};

const getButtonVariantBySentiment = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case 'candid':
      return 'secondary';
    case 'constructive':
      return 'destructive';
    case 'cautionary':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const DiscussionsSection = ({ mrData }: {mrData: MRDetails}) => (
  <div className="space-y-4">
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Discussion Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-2xl font-bold">{mrData.discussionsAnalysis.totalDiscussions}</p>
              <p className="text-sm text-muted-foreground">Total Discussions</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-2xl font-bold text-green-600">{mrData.discussionsAnalysis.actions.length}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discussion Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{mrData.discussionsAnalysis.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {mrData.discussionsAnalysis?.actions.map((item) => (
              <li key={item.action} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label htmlFor={`action-${item.action}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {item.action}
                  </label>
                </div>
                <Badge variant={item.owner === "You" ? "default" : "secondary"}>{item.owner}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Actions for You</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {actions.map((action) => (
              <li key={action.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{action.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Discussions</CardTitle>
          <CardDescription>Recent discussions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="pr-4">
          {mrData.discussions?.map((discussion, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{discussion.author}</CardTitle>
              </CardHeader>
              <CardContent>
                <Markdown contents={discussion.message}></Markdown>
                <Badge variant={getButtonVariantBySentiment(discussion.sentiment)} className="mt-2">
                  {discussion.sentiment}
                </Badge>
                <button
                  className="ml-2 p-1 rounded-md hover:bg-muted transition-colors"
                  onClick={() => navigateToDiscussion(discussion.web_url)}
                >
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  </div>
)
