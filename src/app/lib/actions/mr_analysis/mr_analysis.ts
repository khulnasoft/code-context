import { getReviewerPrompt, ReviewType } from "@/components/reviewer_prompts";
import { callAnthropic } from "../../anthropic";
import { Analysis, MRDetails } from "./actions";

export async function generateMRAnalysis(mrDetails: MRDetails, reviewType: ReviewType): Promise<Analysis | null> {
    const prompt = `${getReviewerPrompt(reviewType)}
  
      Can you provide a deep analysis of the merge request with the following details:- 
      
      Title: ${mrDetails.title}- 
      Description: ${mrDetails.description}
  
      Discussions:
      ${mrDetails.discussions.map(discussion => `
        Message: ${discussion.message}
      `).join('\n')}
  
      Code Changes
      ------------
      ${mrDetails.codeChanges.map(change => `
        Diff: ${change.diff}
      `).join('\n')}
      
      Analyze the MR and Code and respond in the following format:
  
      <reviewApproach>How will I go about reviewing this MR. Can you revese engineer the MR and come up with an approach</reviewApproach>
      <breakdown>If the MR is too large, how can I break it down into smaller MRs. This is not required if the MR is small enough.</breakdown>
      <testingStrategy>What is the testing strategy for this MR. How do I test various scenarios? What are the edge cases?</testingStrategy>
      <suggestedQuestions>Suggest questions to ask the autor of the MR? Make sure that there are no assumptions.</suggestedQuestions>
      <architecturalComponents>A markdown table defining the architectural components. The following 5 columns should be present: Component, Description, Type (class, method, module, struct, interface, service, etc), Dependencies, Key Functions/Methods. If there are no architectural components then respond with "No architectural components found"</architecturalComponents>
      <testingDocumentation>A markdown table defining the various covered scenarios. The following columns Test Name, Description, Tested Method/Function, Expected Output should be present.</testingDocumentation>
      `
    try {
      const response = await callAnthropic(prompt, 'claude-3-5-sonnet-latest', 8192);
      // Extract the fields from the response
      
      const reviewApproachMatch = response.match(/<reviewApproach>([\s\S]*?)<\/reviewApproach>/);
      const breakdownMatch = response.match(/<breakdown>([\s\S]*?)<\/breakdown>/);
      const testingStrategyMatch = response.match(/<testingStrategy>([\s\S]*?)<\/testingStrategy>/);
      const suggestedQuestionsMatch = response.match(/<suggestedQuestions>([\s\S]*?)<\/suggestedQuestions>/);
      const architecturalComponentsMatch = response.match(/<architecturalComponents>([\s\S]*?)<\/architecturalComponents>/);
      const testingDocumentationMatch = response.match(/<testingDocumentation>([\s\S]*?)<\/testingDocumentation>/);
  
      const analysis: Analysis = {
        reviewApproach: reviewApproachMatch ? reviewApproachMatch[1].trim() : 'No review approach available',
        testingStrategy: testingStrategyMatch ? testingStrategyMatch[1].trim() : 'No testing strategy available',
        suggestedQuestions: suggestedQuestionsMatch ? suggestedQuestionsMatch[1].trim() : 'No suggested questions available',
        architecturalComponents: architecturalComponentsMatch ? architecturalComponentsMatch[1].trim() : 'No architectural components found',
        testingDocumentation: testingDocumentationMatch ? testingDocumentationMatch[1].trim() : 'No testing documentation found',
        breakdown: breakdownMatch ? breakdownMatch[1].trim() : 'Breakdown not applicable', 
      }; 
  
      return analysis;
  
    } catch (error) {
      console.error('Error generating MR summary:', error);
      return null;
    }
  }