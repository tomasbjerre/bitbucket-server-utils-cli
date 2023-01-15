export interface BitbucketServer {
  personalAccessToken: string;
  url: string;
}

export interface RepositorySlug {
  projectSlug: string;
  repoSlug: string;
}

export interface Repository {
  slug: RepositorySlug;
  cloneUrl: string;
  id: string;
  state: string;
}
export interface Branch {
  displayId: string;
  latestCommit: string;
}

export interface PullRequest {
  id: string;
  repository: RepositorySlug;
  title: string;
  state: 'OPEN' | 'DECLINED' | 'MERGED';
  author: User;
  reviewers: Reviewer[];
  createdDate: string;
  updatedDate: string;
}

export interface Reviewer {
  role: 'REVIEWER' | 'AUTHOR' | 'PARTICIPANT';
  status: 'UNAPPROVED' | 'NEEDS_WORK' | 'APPROVED' | undefined;
  user: User;
}

export interface User {
  name: string;
  emailAddress: string;
  displayName: string;
  slug: string;
}
export interface Commit {
  displayId: string;
  author: User;
}

export interface PullRequestComment {
  repo: RepositorySlug;
  pullRequest: string;
  message: string;
  commentKey?: string;
  severity: 'NORMAL' | 'BLOCKER';
}

export interface PullRequestCommentId {
  id: string;
  version?: string;
}
