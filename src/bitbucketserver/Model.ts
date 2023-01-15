export interface BitbucketServer {
  personalAccessToken: string;
  url: string;
}

export interface RepositorySlug {
  projectSlug: string;
  repoSlug: string;
}

export interface Repository {
  slug: string;
  cloneUrl: string;
}
export interface Branch {
  displayId: string;
  latestCommit: string;
}

export interface PullRequest {
  id: string;
  repository: RepositorySlug;
  title: string;
  state: string;
  author: Author;
  createdDate: string;
  updatedDate: string;
}

export interface Author {
  name: string;
  emailAddress: string;
  displayName: string;
  slug: string;
}
export interface Commit {
  displayId: string;
  author: Author;
}

export interface PullRequestComment {
  repo: RepositorySlug;
  pullRequest: string;
  message: string;
  commentKey?: string;
  severity: 'NORMAL' | 'BLOCKER';
}
