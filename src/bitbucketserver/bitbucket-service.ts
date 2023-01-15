import {
  BitbucketServer,
  Repository,
  Branch,
  RepositorySlug,
  Commit,
  PullRequest,
  PullRequestComment,
  PullRequestCommentId,
  Reviewer,
} from './Model';
import axios, { AxiosRequestConfig } from 'axios';
import log from '../utils/log';

export default class BitbucketService {
  private config: AxiosRequestConfig;

  constructor(private settings: BitbucketServer) {
    const maskedSettings = JSON.parse(
      JSON.stringify(settings)
    ) as BitbucketServer;
    maskedSettings.personalAccessToken = '<masked>';
    log('DEBUG', maskedSettings);
    this.config = settings.personalAccessToken
      ? {
          headers: {
            Authorization: `Bearer ${settings.personalAccessToken}`,
          },
        }
      : {};
  }

  async getRepositories(projects: string[]): Promise<Repository[]> {
    const categories = [];
    for (let project of projects) {
      const url = `${this.settings.url}/projects/${project}/repos?limit=9999`;
      log('DEBUG', '> ' + url);
      const response = await axios.get(url, this.config);
      //log('DEBUG','response: ' + JSON.stringify(response.data));
      categories.push(
        response.data.values.map((it: any) => {
          return {
            slug: {
              projectSlug: project,
              repoSlug: it.slug,
            },
            id: it.id,
            state: it.state,
            cloneUrl: it.links.clone //
              // Sort ssh before https
              .sort((a: any, b: any) => b.name.localeCompare(a.name))[0].href,
          } as Repository;
        })
      );
    }
    return categories
      .flat()
      .sort((a, b) =>
        `${a.projectSlug}-${a.repoSlug}`.localeCompare(
          `${b.projectSlug}-${b.repoSlug}`
        )
      );
  }

  async getBranches(repo: RepositorySlug): Promise<Branch[]> {
    const url = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/branches?limit=9999`;
    log('DEBUG', '> ' + url);
    const response = await axios.get(url, this.config);
    return response.data.values
      .map((data: any) => {
        return {
          displayId: data.displayId,
          latestCommit: data.latestCommit,
        } as Branch;
      })
      .sort((a: Branch, b: Branch) =>
        `${a.displayId}-${a.displayId}`.localeCompare(
          `${b.displayId}-${b.displayId}`
        )
      );
  }

  async getPullRequests(repo: RepositorySlug): Promise<PullRequest[]> {
    const url = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/pull-requests?limit=9999`;
    log('DEBUG', '> ' + url);
    const response = await axios.get(url, this.config);
    return response.data.values
      .map((data: any) => {
        return {
          id: data.id,
          title: data.title,
          state: data.state,
          createdDate: data.createdDate,
          updatedDate: data.updatedDate,
          author: {
            name: data.author.user.name,
            emailAddress: data.author.user.emailAddress,
            displayName: data.author.user.displayName,
            slug: data.author.user.slug,
          },
          reviewers: data.reviewers.map((reviewer: any) => {
            return {
              user: {
                displayName: reviewer.user.displayName,
                emailAddress: reviewer.user.emailAddress,
                name: reviewer.user.name,
                slug: reviewer.user.slug,
              },
              role: reviewer.role,
              status: reviewer.status,
            } as Reviewer;
          }),
        } as PullRequest;
      })
      .sort();
  }

  async getCommit(repo: RepositorySlug, commit: string): Promise<Commit> {
    const url = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/commits/${commit}`;
    log('DEBUG', '> ' + url);
    const response = await axios.get(url, this.config);
    return {
      displayId: response.data.displayId,
      author: {
        name: response.data.author.name,
        emailAddress: response.data.author.emailAddress,
        displayName: response.data.author.displayName,
        slug: response.data.author.slug,
      },
    } as Commit;
  }

  async findCommentsByCommentKey(
    repo: RepositorySlug,
    pullRequest: string,
    commentKey: string
  ): Promise<PullRequestCommentId[]> {
    const urlActivities = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/pull-requests/${pullRequest}/activities?limit=9999`;
    log('DEBUG', '> ' + urlActivities);
    const response = await axios.get(urlActivities, this.config);
    return response.data.values
      .filter((activity: any) => {
        return (
          activity.action == 'COMMENTED' &&
          activity.comment.text.indexOf(commentKey) != -1
        );
      })
      .filter((activity: any) => activity.comment);
  }

  async deletePullRequestCommentById(
    repo: RepositorySlug,
    pullRequest: string,
    comment: PullRequestCommentId
  ): Promise<void> {
    try {
      const version = comment.version ? `?version=${comment.version}` : '';
      const urlDelete = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/pull-requests/${pullRequest}/comments/${comment.id}${version}`;
      await axios.delete(urlDelete, this.config);
    } catch (e) {
      log(
        'DEBUG',
        `Was unable to delete ${comment.id} ${comment.version} ${e}`
      );
    }
  }

  async deletePullRequestCommentByCommentKey(
    repo: RepositorySlug,
    pullRequest: string,
    commentKey: string
  ): Promise<void> {
    const existingComments = await this.findCommentsByCommentKey(
      repo,
      pullRequest,
      commentKey
    );
    log('DEBUG', `Deleting old comments ${existingComments}`);
    for (let comment of existingComments) {
      await this.deletePullRequestCommentById(repo, pullRequest, comment);
    }
  }

  async postPullRequestComment(config: PullRequestComment): Promise<void> {
    let commentMessage = config.message;
    let identicalCommentFound = false;

    if (config.commentKey) {
      commentMessage = config.message + '\n\n' + config.commentKey;

      const existingComments = await this.findCommentsByCommentKey(
        config.repo,
        config.pullRequest,
        config.commentKey
      );
      const willDelete = existingComments.map((comment: any) => {
        if (comment.text.trim().indexOf(commentMessage.trim()) != -1) {
          identicalCommentFound = true;
        }
        return comment;
      });
      if (identicalCommentFound) {
        log('DEBUG', 'Identical comment exists, will not comment again.');
        return;
      }

      log('DEBUG', `Deleting old comments ${willDelete}`);
      for (let comment of willDelete) {
        await this.deletePullRequestCommentById(
          config.repo,
          config.pullRequest,
          comment
        );
      }
    }

    const commentsUrl = `${this.settings.url}/projects/${config.repo.projectSlug}/repos/${config.repo.repoSlug}/pull-requests/${config.pullRequest}/comments`;
    const postContent = {
      severity: config.severity,
      text: commentMessage,
    };
    log('DEBUG', '> ' + commentsUrl);
    await axios.post(commentsUrl, postContent, this.config);
  }
}
