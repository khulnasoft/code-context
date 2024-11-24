import { Issue } from "../common/entities/issue";
import { callAnthropic } from "../../anthropic";

const ISSUE_SECURITY_ANALYSIS_MODEL = "claude-3-5-sonnet-latest"
const ISSUE_SECURITY_ANALYSIS_MAX_TOKENS = 8192

export async function getIssueSecurityRecommendations(issue: Issue): Promise<string> {
  const prompt = `
    Analyze the following issue and hightlight and security considerations and risks:

    Title: ${issue.title}
    Description: ${issue.description}

    These are some of the areas that you need to think about:

    Check each of the following areas, and provide any security recommendations that may apply:
    
    1. Input Validation and Sanitization: Are all user inputs validated and sanitized to prevent injection attacks (e.g., SQL, command, or script injections)? Is input properly filtered, escaped, or validated before processing?
    2. Authentication and Authorization: Does this MR ensure that only authenticated and authorized users can access or modify sensitive data or resources? Are there checks to prevent privilege escalation or unauthorized access?
    3. Data Storage and Handling: Is sensitive data (e.g., personal information, passwords) securely stored, encrypted, or hashed as needed? Are strong encryption standards (e.g., AES, SHA-256) used, and is sensitive data never stored in plaintext?
    4. Data Transmission: Does this MR ensure secure transmission of sensitive data (e.g., using HTTPS or encrypted protocols)? Are APIs or external calls secure and authenticated?
    5. Error Handling and Logging: Are errors handled securely without exposing sensitive information or system details to the user? Are logging practices compliant with security standards, avoiding logging sensitive data in plaintext?
    6. Third-Party Dependencies and Libraries: Are any third-party libraries up-to-date and free from known vulnerabilities? Have new dependencies been checked to ensure they meet security best practices?
    7. Session Management: Are session tokens and cookies managed securely, with protections against session fixation, hijacking, and CSRF? Does this MR enforce session timeouts and proper invalidation upon logout?
    8. Access Control and Least Privilege: Are access permissions configured according to the principle of least privilege? Does this MR restrict access to sensitive data and functionality based on user roles?
    9. Security Headers and Browser Protections: Are security headers (e.g., Content-Security-Policy, X-Frame-Options, X-XSS-Protection) in place to protect against common vulnerabilities? Does this MR prevent content injection and clickjacking by setting appropriate headers?
    10. File Uploads and Downloads: If files are handled, are they scanned and validated to prevent processing or storing of malicious files? Are download paths or links secured to prevent unauthorized access to files?

    Only provide a recommendation if its related to the issue description and not a general advice.

    Security recommendation:
    
    `;
  
  const response = await callAnthropic(prompt, ISSUE_SECURITY_ANALYSIS_MODEL, ISSUE_SECURITY_ANALYSIS_MAX_TOKENS);
  return response;
}