import BitbucketService from '../bitbucketserver/BitbucketServerClient';

export default async function postPrComment(
  bitbucketService: BitbucketService,
  options: any
) {
  bitbucketService.postPullRequestComment({
    message: options.postPullRequestComment,
    repo: {
      projectSlug: options.projectSlug,
      repoSlug: options.repositorySlug,
    },
    pullRequest: options.pullRequest,
    severity: options.severity,
    commentKey: options.commentKey,
  });
}
