import {
  BitbucketServer,
  Repository,
  Branch,
  RepositorySlug,
  Commit,
  PullRequest,
  PullRequestComment,
} from './Model';
import axios, { AxiosRequestConfig } from 'axios';
import log from '../log/log';

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

  async getRepositories(): Promise<RepositorySlug[]> {
    const categories = [];
    for (let project of this.settings.projects) {
      const url = `${this.settings.url}/projects/${project}/repos?limit=9999`;
      log('DEBUG', '> ' + url);
      const response = await axios.get(url, this.config);
      //log('DEBUG','response: ' + JSON.stringify(response.data));
      categories.push(
        response.data.values.map((it: any) => {
          return {
            projectSlug: project,
            repoSlug: it.slug,
          } as RepositorySlug;
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

  async getRepository(repo: RepositorySlug): Promise<Repository> {
    const url = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}?limit=9999`;
    log('DEBUG', '> ' + url);
    const response = await axios.get(url, this.config);
    return {
      slug: response.data.slug,
      cloneUrl: response.data.links.clone //
        // Sort ssh before https
        .sort((a: any, b: any) => b.name.localeCompare(a.name))[0].href,
    };
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

  async getPullRequests(repo: RepositorySlug): Promise<string[]> {
    const url = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/pull-requests?limit=9999`;
    log('DEBUG', '> ' + url);
    const response = await axios.get(url, this.config);
    return response.data.values
      .map((data: any) => {
        return data.id;
      })
      .sort();
  }

  async getPullRequest(repo: RepositorySlug, id: string): Promise<PullRequest> {
    const url = `${this.settings.url}/projects/${repo.projectSlug}/repos/${repo.repoSlug}/pull-requests/${id}`;
    log('DEBUG', '> ' + url);
    const response = await axios.get(url, this.config);
    return {
      id: response.data.id,
      title: response.data.title,
      state: response.data.state,
      createdDate: response.data.createdDate,
      updatedDate: response.data.updatedDate,
      author: {
        name: response.data.author.user.name,
        emailAddress: response.data.author.user.emailAddress,
        displayName: response.data.author.user.displayName,
        slug: response.data.author.user.slug,
      },
    } as PullRequest;
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

  async postPullRequestComment(config: PullRequestComment): Promise<void> {
    let commentMessage = config.message;
    let identicalCommentFound = false;

    if (config.commentKey) {
      commentMessage = config.message + '\n\n' + config.commentKey;

      const urlActivities = `${this.settings.url}/projects/${config.repo.projectSlug}/repos/${config.repo.repoSlug}/pull-requests/${config.pullRequest}/activities?limit=9999`;
      log('DEBUG', '> ' + urlActivities);
      const response = await axios.get(urlActivities, this.config);
      const willDelete: any[] = response.data.values
        .filter((activity: any) => {
          return (
            activity.action == 'COMMENTED' &&
            activity.comment.text.indexOf(config.commentKey) != -1
          );
        })
        .map((activity: any) => {
          if (
            activity.comment.text.trim().indexOf(commentMessage.trim()) != -1
          ) {
            identicalCommentFound = true;
          }
          return activity.comment;
        });
      if (identicalCommentFound) {
        log('DEBUG', 'Identical comment exists, will not comment again.');
        return;
      }

      log('DEBUG', `Deleting old comments ${willDelete}`);
      for (let comment of willDelete) {
        try {
          const urlDelete = `${this.settings.url}/projects/${config.repo.projectSlug}/repos/${config.repo.repoSlug}/pull-requests/${config.pullRequest}/comments/${comment.id}?version=${comment.version}`;
          await axios.delete(urlDelete, this.config);
        } catch (e) {
          log(
            'DEBUG',
            `Was unable to delete ${comment.id} ${comment.version} ${e}`
          );
        }
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
