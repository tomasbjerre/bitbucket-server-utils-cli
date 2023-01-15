import BitbucketService from '../bitbucketserver/bitbucket-service';

export default async function deletePrComment(
  bitbucketService: BitbucketService,
  options: any
) {
  if (!options.projects || options.projects.length != 1) {
    throw Error(`Must supply exactly one project-slug`);
  }
  const projectSlug = options.projects[0];
  bitbucketService.deletePullRequestComment({
    repo: {
      projectSlug,
      repoSlug: options.repositorySlug,
    },
    pullRequest: options.pullRequest,
    comment: {
      id: options.pullRequestCommentId,
      version: options.pullRequestCommentVersion,
    },
  });
}
