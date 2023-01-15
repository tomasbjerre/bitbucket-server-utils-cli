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
}

export interface BitbucketServerState {
  lastUpdated: number;
  repositories: Record<string, RepositoryState>;
  commits: Record<string, Commit>;
}
