import { Discussion } from "./discussions";
import { Issue } from "./issue";

export interface Epic {
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  issues: Issue[];
  childEpics: Epic[];
  discussions: Discussion[];
  summary?: EpicSummary;
  releaseNotes?: EpicReleaseNotes[];
}

export interface EpicReleaseNotes {
  milestone: string;
  summary: string;
}

export interface EpicSummary {
  summary: string;
  keyPoints: string;
  discussionSummary: string;
  closedIssues: string;
  pendingIssues: string;
};

export interface GraphQLEpicResponse {
  data: {
    group: {
      workItem: {
        title: string;
        description: string;
        createdAt: string;
        closedAt: string | null;
        widgets: Array<
          GQWorkItemWidgetHierarchy | GQWorkItemWidgetNotes | object
        >;
      };
    };
  };
  correlationId: string;
}

export interface GQWorkItemWidgetHierarchy {
  parent?: {
    title: string;
    description: string;
  };
  children?: {
    nodes: Array<GQChildNode>;
  };
}

export interface GQChildNode {
  iid: number;
  id: string;
  title: string;
  description?: string | null;
  state: string;
  widgets: Array<GQWorkItemWidgetMilestone | object>;
  workItemType: {
    name: string;
  };
  project: {
    id: string;
  }
}

export interface GQWorkItemWidgetMilestone {
  milestone?: {
    title?: string;
  } | null;
}

export interface GQWorkItemWidgetNotes {
  discussions: {
    nodes: Array<GQDiscussionNode>;
  };
}

export interface GQDiscussionNode {
  notes: {
    edges: Array<GQNoteEdge>;
  };
}

export interface GQNoteEdge {
  node: {
    body: string;
    id: string;
    author: {
      name: string;
    };
  };
}

/* eslint @typescript-eslint/no-explicit-any: 0 */  // --> OFF
// Type Guards
function isGQWorkItemWidgetNotes(
  widget: any
): widget is GQWorkItemWidgetNotes {
  return widget && 'discussions' in widget;
}

function isGQWorkItemWidgetHierarchy(
  widget: any
): widget is GQWorkItemWidgetHierarchy {
  return widget && ('children' in widget || 'parent' in widget);
}

function isGQWorkItemWidgetMilestone(
  widget: any
): widget is GQWorkItemWidgetMilestone {
  return widget && 'milestone' in widget;
}
/* eslint @typescript-eslint/no-explicit-any: 1 */  // --> ON

// Mapping Function
export function mapGraphQLResponseToEpic(response: GraphQLEpicResponse): Epic {
  const workItem = response.data.group.workItem;

  const epic: Epic = {
    iid: 0, // Update this if you have an ID in your data
    title: workItem.title,
    description: workItem.description,
    createdAt: workItem.createdAt, 
    closedAt: workItem.closedAt || 'Till Date',
    issues: [],
    childEpics: [],
    discussions: [],
  };

  for (const widget of workItem.widgets) {
    if (isGQWorkItemWidgetNotes(widget)) {
      // Map discussions
      epic.discussions = widget.discussions.nodes.map(mapDiscussionNode);
    } else if (isGQWorkItemWidgetHierarchy(widget)) {
      // Map child issues and epics
      if (widget.children) {
        widget.children.nodes.forEach((childNode) => {
          if (childNode.workItemType.name === 'Issue') {
            const issue = mapGQChildNodeToIssue(childNode);
            epic.issues.push(issue);
          } else if (childNode.workItemType.name === 'Epic') {
            const childEpic = mapGQChildNodeToEpic(childNode);
            epic.childEpics.push(childEpic);
          }
        });
      }
    }
  }

  return epic;
}

function mapDiscussionNode(node: GQDiscussionNode): Discussion {
  return node.notes.edges.length > 0 ? {
    message: node.notes.edges[0].node.body,
    id: parseInt(node.notes.edges[0].node.id.replace('gid://github/Note/', '')),
    author: node.notes.edges[0].node.author.name,
    web_url: "",
    resolved: false,
    sentiment: "",
    notes: []
  } : { message: "", id: 0, author: "", web_url: "", resolved: false, sentiment: "", notes: []};
}

function mapGQChildNodeToIssue(childNode: GQChildNode): Issue {
  return {
    id: parseInt(childNode.id, 10),
    iid: childNode.iid,
    title: childNode.title,
    description: childNode.description || '',
    state: childNode.state,
    milestone: childNode.widgets.find(isGQWorkItemWidgetMilestone)?.milestone,
    project_id: extractIDFromGID(childNode.project.id)
  } as unknown as Issue;
}

function mapGQChildNodeToEpic(childNode: GQChildNode): Epic {
  return {
    iid: childNode.iid,
    title: childNode.title,
    description: childNode.description || '',
  } as unknown as Epic;
}

function extractIDFromGID(string: string): string | undefined {
  const regex = /gid:\/\/github\/Project\/(\d+)/;
  const match = string.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return undefined;
}