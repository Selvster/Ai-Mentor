export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  prd: string;
  techStack: string[];
  features: Feature[];
  createdAt: string;
}

export interface CriticalFix {
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  file: string;
  code: string;
  suggestion: string;
}

export interface MentorReport {
  strengths: string[];
  weaknesses: string[];
  criticalFixes: CriticalFix[];
  codeQualityScore: number;
  securityScore: number;
  performanceScore: number;
  bestPracticesScore: number;
}

export interface FeatureVerification {
  featureId: string;
  featureTitle: string;
  implemented: boolean;
  details: string;
}

export interface Review {
  id: string;
  projectId: string;
  repoUrl: string;
  overallScore: number;
  featureCompletion: FeatureVerification[];
  mentorReport: MentorReport;
  createdAt: string;
}
