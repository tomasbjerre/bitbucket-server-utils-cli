import { PullRequest } from '../bitbucketserver/Model';

export interface BitbucketServerState {
  lastUpdated: number;
  pullRequests: PullRequest[];
}
