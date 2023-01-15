import {
  Branch,
  Commit,
  PullRequest,
  Repository,
} from '../bitbucketserver/Model';

export interface RepositoryState {
  repository: Repository;
  pullRequests: PullRequest[];
  branches: Branch[];
  commits: Record<string, Commit>;
}

export interface BitbucketServerState {
  lastUpdated: number;
  repositories: Record<string, RepositoryState>;
  commits: Record<string, Commit>;
}
