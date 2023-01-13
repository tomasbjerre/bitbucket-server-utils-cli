import { PullRequest } from '../bitbucketserver/Model';

export interface BitbucketServerState {
  v1: BitbucketServerStateV1;
}
export interface BitbucketServerStateV1 {
  lastUpdated: number;
  pullRequests: PullRequest[];
}
