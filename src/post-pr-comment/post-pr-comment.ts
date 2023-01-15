import BitbucketService from '../bitbucketserver/bitbucket-service';

export default async function postPrComment(
  bitbucketService: BitbucketService,
  options: any
) {
  if (!options.projects || options.projects.length != 1) {
    throw Error(`Must supply exactly one project-slug`);
  }
  const projectSlug = options.projects[0];
  bitbucketService.postPullRequestComment({
    message: options.postPullRequestComment,
    repo: {
      projectSlug,
      repoSlug: options.repositorySlug,
    },
    pullRequest: options.pullRequest,
    severity: options.severity,
    commentKey: options.commentKey,
  });
}
