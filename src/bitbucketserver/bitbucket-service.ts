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
import sleep from '../utils/sleep';

function authString(settings: BitbucketServer): string {
  if (settings.personalAccessToken) {
    return `Bearer ${settings.personalAccessToken}`;
  }
  if (settings.username && settings.password) {
    const userAndPass = `${settings.username}:${settings.password}`;
    const authString = Buffer.from(userAndPass, 'binary').toString('base64');
    return `Basic ${authString}`;
  }
  throw Error(`No credentials supplied`);
}

export default class BitbucketService {
  private config: AxiosRequestConfig;

  constructor(private settings: BitbucketServer) {
    const maskedSettings = JSON.parse(
      JSON.stringify(settings)
    ) as BitbucketServer;
    maskedSettings.personalAccessToken = '<masked>';
    maskedSettings.username = '<masked>';
    maskedSettings.password = '<masked>';
    log('DEBUG', maskedSettings);
    const authorization = authString(settings);
    this.config = {
      headers: {
        Authorization: authorization,
      },
    };
  }

  async getRepositories(projects: string[]): Promise<Repository[]> {
    const categories = [];
    for (let project of projects) {
      const url = `${this.settings.url}/projects/${project}/repos?limit=9999`;
      log('DEBUG', '> ' + url);
      const response = await axios.get(url, this.config);
      await sleep(this.settings.sleepTime);
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
    await sleep(this.settings.sleepTime);
    return response.data.values
      .map((data: any) => {
        return {
          displayId: data.displayId,
          latestCommit: data.latestCommit,
          isDefault: data.isDefault,
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
    await sleep(this.settings.sleepTime);
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
          repository: {
            projectSlug: repo.projectSlug,
            repoSlug: repo.repoSlug,
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
          fromRef: {
            displayId: data.fromRef.displayId,
            latestCommit: data.fromRef.latestCommit,
          },
        } as PullRequest;
      })
      .sort();
  }

  async getCommit(repo: RepositorySlug, commit: string): Promise<Commit> {
    const url = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/commits/${commit}`;
    log('DEBUG', '> ' + url);
    const response = await axios.get(url, this.config);
    await sleep(this.settings.sleepTime);
    return {
      displayId: response.data.displayId,
      authorTimestamp: response.data.authorTimestamp,
      committerTimestamp: response.data.committerTimestamp,
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
    await sleep(this.settings.sleepTime);
    return response.data.values
      .filter((activity: any) => {
        return (
          activity.action == 'COMMENTED' &&
          activity.comment.text.indexOf(commentKey) != -1
        );
      })
      .map((activity: any) => activity.comment);
  }

  async deletePullRequestCommentById(
    repo: RepositorySlug,
    pullRequest: string,
    comment: PullRequestCommentId
  ): Promise<void> {
    try {
      const version = comment.version ? `?version=${comment.version}` : '';
      const urlDelete = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/pull-requests/${pullRequest}/comments/${comment.id}${version}`;
      if (!this.settings.dryRun) {
        await axios.delete(urlDelete, this.config);
      }
      await sleep(this.settings.sleepTime);
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
    for (let comment of existingComments) {
      log('DEBUG', `Deleting old comment ${comment.id}`);
      await this.deletePullRequestCommentById(repo, pullRequest, comment);
    }
  }

  async postPullRequestComment(config: PullRequestComment): Promise<void> {
    log('DEBUG', `Commenting ${JSON.stringify(config)}`);
    let commentMessage = config.message;

    if (config.commentKey) {
      commentMessage = config.message + '\n\n' + config.commentKey;

      const existingComments = await this.findCommentsByCommentKey(
        config.repo,
        config.pullRequest,
        config.commentKey
      );
      const notIdentialComments = existingComments.filter(
        (comment: PullRequestCommentId) =>
          (comment.text?.trim() ?? '').indexOf(commentMessage.trim()) == -1
      );

      for (let comment of notIdentialComments) {
        log(
          'DEBUG',
          `Deleting not identical comment ${JSON.stringify(comment)}`
        );
        await this.deletePullRequestCommentById(
          config.repo,
          config.pullRequest,
          comment
        );
      }

      if (notIdentialComments.length != existingComments.length) {
        log('DEBUG', `Identical comment found, not commenting again`);
        return;
      }
    }

    const commentsUrl = `${this.settings.url}/projects/${config.repo.projectSlug}/repos/${config.repo.repoSlug}/pull-requests/${config.pullRequest}/comments`;
    const postContent = {
      severity: config.severity,
      text: commentMessage,
    };
    log('DEBUG', '> ' + commentsUrl);
    if (!this.settings.dryRun) {
      await axios.post(commentsUrl, postContent, this.config);
    }
    await sleep(this.settings.sleepTime);
  }
}
