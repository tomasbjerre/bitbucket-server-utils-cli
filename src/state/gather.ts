import BitbucketService from '../bitbucketserver/bitbucket-service';
import log from '../utils/log';
import { BitbucketServerState } from './Model';
import { getEmptyState } from './storage';

export default async function gatherState(
  bitbucketService: BitbucketService,
  options: any
): Promise<BitbucketServerState> {
  const state: BitbucketServerState = getEmptyState();

  const sleepTime = parseInt(options.sleepTime);
  log(
    'INFO',
    `Using ${options.stateFile} and waiting ${sleepTime}ms between HTTP requests.`
  );

  const repositories = await bitbucketService.getRepositories(options.projects);
  for (let repoIndex = 0; repoIndex < repositories.length; repoIndex++) {
    const repository = repositories[repoIndex];
    log(
      'INFO',
      `Repository ${repoIndex + 1} of ${repositories.length} - ${
        repository.slug.projectSlug
      }/${repository.slug.repoSlug}`
    );
    const pullRequests = await bitbucketService.getPullRequests(
      repository.slug
    );
    const key = repository.slug.projectSlug + '-' + repository.slug.repoSlug;
    state.repositories[key] = {
      branches: [],
      pullRequests,
      repository: repository,
    };
  }
  return state;
}
