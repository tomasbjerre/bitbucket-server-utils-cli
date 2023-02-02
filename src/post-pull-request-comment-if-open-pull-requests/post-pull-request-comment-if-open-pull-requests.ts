import BitbucketService from '../bitbucketserver/bitbucket-service';
import { PullRequest } from '../bitbucketserver/Model';
import { getState } from '../state/storage';
import log from '../utils/log';
import { BitbucketServerState } from '../state/Model';
import renderString from '../utils/render-string';

interface Context {
  authorPullRequest: PullRequest;
  pullRequests: PullRequest[];
}

export default async function postPullRequestCommentIfOpenPullRequests(
  bitbucketService: BitbucketService,
  options: any
) {
  const template = options.template;
  const state = getState(options.stateFile);
  Object.values(state.repositories).forEach(
    (repositoryState, repositoryIndex) => {
      log(
        'INFO',
        `Repository ${repositoryIndex + 1} of ${
          Object.values(state.repositories).length
        }`
      );
      repositoryState.pullRequests.forEach(
        (authorPullRequest, pullRequestIndex) => {
          log(
            'INFO',
            `    Pull-request ${pullRequestIndex + 1} of ${
              Object.values(repositoryState.pullRequests).length
            } - ${authorPullRequest.id} - ${authorPullRequest.title}`
          );
          const pullRequests = pullRequestsToReviewBy(
            authorPullRequest.author.slug,
            state
          );
          if (pullRequests.length > 0) {
            log(
              'INFO',
              `        Commenting ${authorPullRequest.repository.projectSlug}/${
                authorPullRequest.repository.repoSlug
              }/${authorPullRequest.id} by ${
                authorPullRequest.author.displayName
              } (${authorPullRequest.author.slug}) should review ${pullRequests
                .map(
                  (it) =>
                    it.repository.projectSlug +
                    '/' +
                    it.repository.repoSlug +
                    '/' +
                    it.id
                )
                .join(' ')}`
            );
            const context: Context = {
              authorPullRequest,
              pullRequests,
            };
            const message = renderString({ state, context, template });
            bitbucketService.postPullRequestComment({
              message,
              repo: {
                projectSlug: authorPullRequest.repository.projectSlug,
                repoSlug: authorPullRequest.repository.repoSlug,
              },
              pullRequest: authorPullRequest.id,
              severity: options.severity,
              commentKey: `<comment-key has-open-pull-requests-to-review-${authorPullRequest.author.slug}>`,
            });
          }
        }
      );
    }
  );
}

function pullRequestsToReviewBy(
  authorSlug: string,
  state: BitbucketServerState
): PullRequest[] {
  return Object.values(state.repositories)
    .flatMap((it) => it.pullRequests)
    .filter((it) => it.author.slug != authorSlug)
    .filter((it) =>
      it.reviewers.find(
        (reviewer) =>
          reviewer.user.slug == authorSlug &&
          (!reviewer.status || reviewer.status == 'UNAPPROVED')
      )
    );
}
