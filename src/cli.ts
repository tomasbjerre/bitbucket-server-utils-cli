#!/usr/bin/env node

import { Command, Option } from 'commander';
import BitbucketService from './bitbucketserver/BitbucketServerClient';
const figlet = require('figlet');
const pkgJson = require('../package.json');

console.log(
  figlet.textSync(pkgJson.name.replaceAll('-', ' '), {
    horizontalLayout: 'fitted',
    width: 80,
    whitespaceBreak: true,
  })
);

function commaSeparatedList(value: string) {
  return value.split(',');
}

const program = new Command()
  .version(pkgJson.version)
  .command(pkgJson.name)
  .option(
    '-bbsat, --bitbucket-server-access-token <token>',
    'Bitbucket Server access token'
  )
  .option(
    '-bbsu, --bitbucket-server-url <url>',
    'Bitbucket Server to use for REST integration (https://bitbucket-server/rest/api/latest)'
  )
  .option(
    '-bbsp, --bitbucket-server-projects <projects>',
    'Bitbucket Server projects. Empty will include all projects.',
    commaSeparatedList
  )
  /** Gather information */
  .option(
    '-gi, --gather-information',
    'Gather information from Bitbucket Server and store it in a file.'
  )
  .option(
    '-if, --information-file <filename>',
    'File to read, and write, information to.'
  )
  /** Format comment */
  .option(
    '-fc, --format-user-comment',
    'Format a comment that may be presented to the user. A context is provided that is rendered with a supplied Handlebars-template.'
  )
  .option('-t, --template <filename>', 'File containing Handlebars template.')
  /** Pull Request */
  .option(
    '-pprc, --post-pull-request-comment',
    'Post a file as a pull-request comment'
  )
  .option('-ps, --project-slug <ps>')
  .option('-rs, --repository-slug <rs>')
  .option('-prid, --pull-request-id <prid>')
  .option('-s, --severity <severity>', 'BLOCKER or NORMAL', 'NORMAL');

program.parse(process.argv);
const bitbucketServerClient = new BitbucketService({
  personalAccessToken: program.opts().bitbucketServerAccessToken,
  projects: program.opts().bitbucketServerProjects,
  url: program.opts().bitbucketServerUrl,
});

/*
bitbucketServerClient
  .postPullRequestComment({
    repo: {
      projectSlug: 'PROJ_1',
      repoSlug: 'repo_1',
    },
    commentKey: 'my-comment-key',
    message: 'blocker comment 2',
    pullRequest: '461',
    severity: 'BLOCKER',
  })
  .then(() => {
    console.log('done');
    process.exit();
  })
  .catch((e) => {
    console.log('e', e);
    process.exit();
  });

bitbucketServerClient.getRepositories().then((data) => {
  //console.log(JSON.stringify(data, null, 4));
});

bitbucketServerClient
  .getRepository({
    projectSlug: 'PROJ_1',
    repoSlug: 'repo_1',
  })
  .then((data) => {
    //console.log(JSON.stringify(data, null, 4));
  });

bitbucketServerClient
  .getBranches({
    projectSlug: 'PROJ_1',
    repoSlug: 'repo_1',
  })
  .then((data) => {
    //console.log(JSON.stringify(data, null, 4));
  });

bitbucketServerClient
  .getCommit(
    {
      projectSlug: 'PROJ_1',
      repoSlug: 'repo_1',
    },
    '11111113e79ca6d4cce2dfea56f0cf381bdcc94e'
  )
  .then((data) => {
    //console.log(JSON.stringify(data, null, 4));
  });

bitbucketServerClient
  .getPullRequests({
    projectSlug: 'PROJ_1',
    repoSlug: 'repo_1',
  })
  .then((data) => {
    //console.log(JSON.stringify(data, null, 4));
  });

bitbucketServerClient
  .getPullRequest(
    {
      projectSlug: 'PROJ_1',
      repoSlug: 'repo_1',
    },
    '128'
  )
  .then((data) => {
    //console.log(JSON.stringify(data, null, 4));
  });
*/
