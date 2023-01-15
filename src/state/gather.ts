import BitbucketService from '../bitbucketserver/bitbucket-service';
import { Commit } from '../bitbucketserver/Model';
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
    const branches = await bitbucketService.getBranches(repository.slug);
    const key = repository.slug.projectSlug + '-' + repository.slug.repoSlug;
    const commits: Record<string, Commit> = {};
    for (let branchIndex = 0; branchIndex < branches.length; branchIndex++) {
      const branch = branches[branchIndex];
      log(
        'INFO',
        `    Branch ${branchIndex + 1} of ${branches.length} - ${
          branch.displayId
        }`
      );
      commits[branch.latestCommit] = await bitbucketService.getCommit(
        repository.slug,
        branch.latestCommit
      );
    }
    state.repositories[key] = {
      branches,
      pullRequests,
      repository,
      commits,
    };
  }
  return state;
}
