import BitbucketService from '../bitbucketserver/bitbucket-service';

export default async function deletePrComment(
  bitbucketService: BitbucketService,
  options: any
) {
  if (!options.projects || options.projects.length != 1) {
    throw Error(`Must supply exactly one project-slug`);
  }
  const projectSlug = options.projects[0];
  if (options.pullRequestCommentId) {
    bitbucketService.deletePullRequestCommentById(
      {
        projectSlug,
        repoSlug: options.repositorySlug,
      },
      options.pullRequest,
      {
        id: options.pullRequestCommentId,
        version: options.pullRequestCommentVersion,
      }
    );
  }
  if (options.commentKey) {
    bitbucketService.deletePullRequestCommentByCommentKey(
      {
        projectSlug,
        repoSlug: options.repositorySlug,
      },
      options.pullRequest,
      options.commentKey
    );
  }
}
