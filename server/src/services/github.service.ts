import { Octokit } from '@octokit/rest';
import { env } from '../config/env.js';

const INCLUDED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs',
  '.css', '.html', '.json', '.prisma', '.sql', '.md', '.yaml', '.yml',
  '.toml', '.cfg', '.env.example', '.sh', '.dockerfile',
]);

const EXCLUDED_DIRS = new Set([
  'node_modules', 'dist', 'build', '.next', '.git', 'coverage',
  '.cache', '.turbo', '__pycache__', 'venv', '.venv', '.idea', '.vscode',
]);

const EXCLUDED_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
]);

const BATCH_SIZE = 5;
const MAX_CHARS_PER_FILE = 10000;

function parseRepoUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repo');
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

function shouldIncludeFile(path: string): boolean {
  const parts = path.split('/');
  for (const part of parts) {
    if (EXCLUDED_DIRS.has(part)) return false;
  }
  const filename = parts[parts.length - 1];
  if (EXCLUDED_FILES.has(filename)) return false;
  const ext = '.' + filename.split('.').pop();
  return INCLUDED_EXTENSIONS.has(ext);
}

function smartTruncate(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content;

  // Keep imports/top section and function signatures at bottom
  const lines = content.split('\n');
  const result: string[] = [];
  let charCount = 0;

  // Keep first 40% of budget for the top of the file (imports, types, setup)
  const topBudget = Math.floor(maxChars * 0.4);
  for (const line of lines) {
    if (charCount + line.length > topBudget) break;
    result.push(line);
    charCount += line.length + 1;
  }

  result.push('\n// ... [MIDDLE SECTION TRUNCATED FOR BREVITY] ...\n');

  // Keep last 40% of budget for the bottom (main logic, exports)
  const bottomBudget = Math.floor(maxChars * 0.4);
  const bottomLines: string[] = [];
  let bottomCount = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (bottomCount + lines[i].length > bottomBudget) break;
    bottomLines.unshift(lines[i]);
    bottomCount += lines[i].length + 1;
  }
  result.push(...bottomLines);

  return result.join('\n');
}

function createOctokit() {
  return new Octokit({ auth: env.GITHUB_TOKEN || undefined });
}

export interface RepoTree {
  owner: string;
  repo: string;
  files: { path: string; sha: string; size?: number }[];
}

/**
 * Stage 1: Fetch the repo tree + metadata files (package.json, README)
 * Returns the full tree listing and content of key config files.
 */
export async function surveyRepository(repoUrl: string): Promise<{
  tree: RepoTree;
  metadataSnapshot: string;
  allPaths: string[];
}> {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const octokit = createOctokit();

  // Get the default branch name from repo metadata
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  const { data: refData } = await octokit.git.getRef({
    owner, repo, ref: `heads/${defaultBranch}`,
  });

  const commitSha = refData.object.sha;
  const { data: commitData } = await octokit.git.getCommit({
    owner, repo, commit_sha: commitSha,
  });

  const { data: treeData } = await octokit.git.getTree({
    owner, repo, tree_sha: commitData.tree.sha, recursive: 'true',
  });

  if (!treeData.tree.length) {
    throw new Error('Repository is empty. No files found.');
  }

  // All includable files
  const allFiles = treeData.tree
    .filter((item) => item.type === 'blob' && item.path && shouldIncludeFile(item.path))
    .map((item) => ({
      path: item.path!,
      sha: item.sha!,
      size: item.size,
    }));

  const allPaths = allFiles.map(f => f.path);

  // Fetch metadata files (package.json, README, etc.) for context
  const metadataNames = ['package.json', 'README.md', 'readme.md', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pyproject.toml'];
  const metadataFiles = allFiles.filter(f => {
    const filename = f.path.split('/').pop() || '';
    return metadataNames.includes(filename) && f.path.split('/').length <= 2; // root or one level deep
  });

  const metadataParts: string[] = [];
  for (const file of metadataFiles.slice(0, 5)) {
    try {
      const content = await fetchFileContent(octokit, owner, repo, file.sha);
      metadataParts.push(`--- FILE: ${file.path} ---\n${content}`);
    } catch { /* skip */ }
  }

  return {
    tree: { owner, repo, files: allFiles },
    metadataSnapshot: metadataParts.join('\n\n'),
    allPaths,
  };
}

/**
 * Stage 2: Fetch specific files by path, in parallel batches.
 */
export async function fetchTargetedFiles(
  tree: RepoTree,
  targetPaths: string[],
): Promise<string> {
  const octokit = createOctokit();
  const { owner, repo, files } = tree;

  // Map paths to their SHAs
  const fileMap = new Map(files.map(f => [f.path, f.sha]));
  const validTargets = targetPaths.filter(p => fileMap.has(p));

  const parts: string[] = [];

  // Fetch in parallel batches
  for (let i = 0; i < validTargets.length; i += BATCH_SIZE) {
    const batch = validTargets.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (filePath) => {
        try {
          const sha = fileMap.get(filePath)!;
          const content = await fetchFileContent(octokit, owner, repo, sha);
          const truncated = smartTruncate(content, MAX_CHARS_PER_FILE);
          return `--- FILE: ${filePath} ---\n${truncated}`;
        } catch {
          return null;
        }
      })
    );
    for (const r of results) {
      if (r) parts.push(r);
    }
  }

  return parts.join('\n\n');
}

async function fetchFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
): Promise<string> {
  const { data: blobData } = await octokit.git.getBlob({
    owner, repo, file_sha: sha,
  });

  if (blobData.encoding === 'base64') {
    return Buffer.from(blobData.content, 'base64').toString('utf-8');
  }
  return blobData.content;
}
