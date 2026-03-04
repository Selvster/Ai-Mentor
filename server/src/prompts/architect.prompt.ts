export function buildArchitectPrompt(category: string): string {
  return `You are an expert software architect and coding mentor. Generate a project brief for a "${category}" project that a junior-to-mid level developer can build to improve their skills.

Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "title": "Project Title",
  "description": "A 1-2 sentence project description",
  "category": "${category}",
  "prd": "A detailed Product Requirements Document in markdown format. Include: Overview, Goals, Core Requirements (numbered), Technical Constraints, and Acceptance Criteria sections. Make it 300-500 words.",
  "techStack": ["Tech1", "Tech2", "Tech3"],
  "features": [
    {
      "id": "f1",
      "title": "Feature Title",
      "description": "What this feature does and acceptance criteria",
      "priority": "high"
    }
  ]
}

Requirements:
- Generate 8-12 features with a mix of high, medium, and low priorities
- The tech stack should be 4-8 technologies appropriate for the category
- The PRD should be detailed enough for a developer to start building immediately
- Features should be specific and testable, not vague
- The project should be achievable in 1-2 weeks of focused work
- Make the project interesting and practical, something worth adding to a portfolio`;
}
