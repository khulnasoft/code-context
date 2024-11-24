export const EPIC_QUERY = `query EpicsAsWorkItem($groupFullPath: ID!, $workItemIID: String!) {
  group(fullPath: $groupFullPath) {
    workItem(iid: $workItemIID) {
      title
      description
      createdAt
      closedAt
      widgets {
        ... on WorkItemWidgetHierarchy {
          parent {
            title
            description
          }
          children {
            nodes {
              iid
              id
              title
              description
              state
              workItemType {
                name
              }
              project {
                id
              }
              widgets {
                ... on WorkItemWidgetMilestone {
                  milestone {
                    title
                  }
                }
              }
            }
          }
        }
        ... on WorkItemWidgetNotes {
          discussions {
            nodes {
              notes {
                edges {
                  node {
                    body
                    id
                    author {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`