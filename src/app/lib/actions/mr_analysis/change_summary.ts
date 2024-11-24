import { getReviewerPrompt, ReviewType } from "@/components/reviewer_prompts";
import { Change, MRDetails } from "./actions";
import { callAnthropic } from "../../anthropic";
import { extractProjectInfo } from "../../utils";

export async function getChangeSummaries(mrChanges: Change[], mrDetails: MRDetails, reviewType: ReviewType, customPromptCodeComments: string | null): Promise<Change[]> {
    const maxFiles = 10;
    const changesToProcess = mrChanges.slice(0, maxFiles);
  
    const summaryPromises = changesToProcess.map(async (change) => {
      const { diff, new_path, old_path } = change;
      const filePath = new_path || old_path;
      const maxDiffLength = 5000;
      const trimmedDiff = diff.length > maxDiffLength ? diff.slice(0, maxDiffLength) : diff;
      const prompt = `
        Please provide a concise summary of the changes described in the following diff and review the diff and the impact of these changes:
  
        ${getReviewerPrompt(reviewType)}
        
        This is the diff for the file that you need to review. If this file does not need to be reviewed, then respond with 'Not Applicable':
        New Name: ${new_path}
        Old Name: ${old_path}
        ---
        ${trimmedDiff}
        ---
  
        This is the overall diff for context (you do not need to review the entire diff). This is just for context:
        ---
        ${mrChanges.map(change => change.diff).join('\n')}
        ---
  
  
        Please also review the code diff thoroughly. Analyze it from the following perspectives:
  
        1. Correctness: Does the code function as intended? Are there any logical errors or bugs?
        2. Performance: Could the code be optimized for better performance? Are there any inefficient algorithms or operations?
        3. Security: Are there any security vulnerabilities or risks introduced? Does the code properly handle sensitive data and input validation?
        4. Readability and Maintainability: Is the code clean and easy to understand? Are the naming conventions and documentation appropriate? Will future developers be able to maintain or extend this code easily?
        5. Adherence to Best Practices and Standards: Does the code follow the project's coding standards and industry best practices? Are there any deprecated functions or patterns used?
        6. Test Coverage: Are there any tests added or modified to ensure the correctness of the changes? Are there any untested areas that need coverage? Please check that all code paths have been covered by tests (use the overall diff to confirm this).
        7. Code Best Practices: Are there any anti-patterns, magic numbers, or hard-coded values that could be improved? Are there any opportunities for refactoring or simplification?
        8. Documentation: Are there any comments, docstrings, or documentation needed to explain the purpose and functionality of the changes? If code documentation is missing then provide a code snippet on what needs to be added.
        9. Dependencies: Are there any new or modified dependencies
        10. Code Style: The code should match the style of the rest of the file and should adhere to the Ruby Style guide, the google golang style guide or the PEP 8 style guide for Python. If the code style does not match the rest of the file then provide a code snippet on how to fix it.
  
        For each perspective, provide specific feedback and suggestions for improvement. Please do include 1-2 examples of code to support your points if applicable.
  
        <summary>summary of changes in markdown format</summary>
        <impact>Respond with High/Medium/Low only</impact>
        <review>Code Review of the changes keeping in mind security and code best pratices</review>
  
        If this code file is applicable then analyze the code and response in the following format else respond with the following
        
        <summary>summary of changes in markdown format</summary>
        <impact>Not Applicable</impact>
        <review>Not Applicable</review>

        ${customPromptCodeComments ? `<special_instructions>${customPromptCodeComments}</special_instructions>`: ''}
        `;
  
      try {
        const response = await callAnthropic(prompt, 'claude-3-5-sonnet-latest', 8192);
  
        // Parse response using regular expressions. The tags could be spread across multiple lines
        const summaryMatch = response.match(/<summary>([\s\S]*?)<\/summary>/);
        const impactMatch = response.match(/<impact>([\s\S]*?)<\/impact>/);
        const reviewMatch = response.match(/<review>([\s\S]*?)<\/review>/);
  
        const responseStruct = {
          summary: summaryMatch ? summaryMatch[1].trim() : '',
          impact: impactMatch ? impactMatch[1].trim() : '',
          review: reviewMatch ? reviewMatch[1].trim() : ''
        };
  
        // Calculate path for the file
        const baseUrl = 'https://github.com';
        const { projectPath } = extractProjectInfo(mrDetails.web_url);
        const commitId = mrDetails.sha;
        const filePath = new_path || old_path;
  
        const codeChangeUrl = `${baseUrl}/${projectPath}/-/blob/${commitId}/${filePath}`;
  
        return { ...change, ...responseStruct, web_url: codeChangeUrl };
      } catch (error) {
        console.error('Error generating summary for', filePath, error);
        return { ...change, summary: 'Error generating summary' };
      }
    });
  
    return await Promise.all(summaryPromises);
  }