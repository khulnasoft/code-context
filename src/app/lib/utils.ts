export function extractProjectInfo(url: string) : {projectPath: string; mrIid: string} {
  const parsedUrl = new URL(url);
  const pathnameParts = parsedUrl.pathname.split('/');
  const index = pathnameParts.indexOf('-');
  if (index === -1 || index + 2 >= pathnameParts.length) {
    throw new Error('Invalid GitHub MR URL');
  }
  
  const projectPath = pathnameParts.slice(1, index).join('/');
  const mrIid = pathnameParts[index + 2];
  
  return { projectPath, mrIid };
}

/**
 * Parses the GitHub issue URL to extract project ID and issue IID.
 * Example URL: "https://github.com/khulnasoft/khulnasoft/-/issues/502414"
 */
export function parseGithubIssueUrl(url: string) {
  const urlPattern = /https:\/\/github\.com\/(.+?)\/-\/issues\/(\d+)/;
  const match = url.match(urlPattern);
  
  if (!match) {
    throw new Error("Invalid GitHub issue URL format");
  }
  
  const projectId = encodeURIComponent(match[1]); // URL-encode the project path
  const issueIid = match[2];
  
  return { projectId, issueIid };
}

export function parseGithubEpicUrl(url: string) {
  const urlPattern = /https:\/\/github\.com\/groups\/(.+?)\/-\/epics\/(\d+)/;
  const match = url.match(urlPattern);
  
  if (!match) {
    throw new Error("Invalid GitHub epic URL format");
  }
  
  const groupId = encodeURIComponent(match[1]); // URL-encode the group path
  const epicIid = match[2];
  
  return { groupId, epicIid };
}

export const calculateDaysSince = (date: string) => {
  const targetDate = new Date(date);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - targetDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return daysDifference;
};

export function formatDateForUI(isoDate: string): string {
  if (isoDate === 'Till Date') {
    return isoDate
  }

  const date = new Date(isoDate);

  // Extract year, month, and day
  const year = date.getUTCFullYear();
  const month = date.toLocaleString('default', { month: 'long', timeZone: 'UTC' }); // e.g., "November"
  const day = date.getUTCDate();

  // Construct the friendly date format
  return `${month} ${day}, ${year}`;
}