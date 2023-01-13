import BitbucketService from '../bitbucketserver/bitbucket-service';
import { RepositorySlug } from '../bitbucketserver/Model';
import log from '../utils/log';
import sleep from '../utils/sleep';
import { BitbucketServerState } from './Model';
import { getState } from './storage';

export default async function gatherState(
  bitbucketService: BitbucketService,
  options: any
): Promise<BitbucketServerState> {
  const state: BitbucketServerState = {
    v1: {
      lastUpdated: new Date().getTime(),
      pullRequests: [],
    },
  };

  const sleepTime = parseInt(options.gatherInformationSleep);
  log(
    'INFO',
    `Using ${options.informationFile} and waiting ${sleepTime}ms between HTTP requests.`
  );

  const repositories = await bitbucketService.getRepositories();
  await sleep(sleepTime);
  for (let repoIndex = 0; repoIndex < repositories.length; repoIndex++) {
    const repositorySlug = repositories[repoIndex];
    log(
      'INFO',
      `Repository ${repoIndex + 1} of ${repositories.length} - ${
        repositorySlug.projectSlug
      }/${repositorySlug.repoSlug}`
    );
    const pullRequests = await bitbucketService.getPullRequests(repositorySlug);
    for (let prIndex = 0; prIndex < pullRequests.length; prIndex++) {
      const pullRequestId = pullRequests[prIndex];
      log(
        'INFO',
        `    Pull Request ${prIndex + 1} of ${
          pullRequests.length
        } - ${pullRequestId}`
      );
      const pullRequest = await bitbucketService.getPullRequest(
        repositorySlug,
        pullRequestId
      );
      state.v1.pullRequests.push(pullRequest);
      await sleep(sleepTime);
    }
    await sleep(sleepTime);
  }
  return state;
}
