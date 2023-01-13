#!/usr/bin/env node

import { Command } from 'commander';
import BitbucketService from './bitbucketserver/BitbucketServerClient';
import formatComment from './format-comment/format-comment';
import gatherInformation from './gather-information/gather-information';
import postPrComment from './post-pr-comment/post-pr-comment';

const pkgJson = require('../package.json');

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
    'Bitbucket Server projects. Example: PROJ_1,PROJ_2,PROJ_3',
    commaSeparatedList
  )
  .option(
    '-gi, --gather-information',
    'Gather information from Bitbucket Server and store it in a file.'
  )
  .option(
    '-if, --information-file <filename>',
    'File to read, and write, information to.'
  )
  .option(
    '-fc, --format-user-comment',
    'Format a comment that may be presented to the user. A context is provided that is rendered with a supplied Handlebars-template.'
  )
  .option('-t, --template <filename>', 'File containing Handlebars template.')
  .option(
    '-pprc, --post-pull-request-comment <comment>',
    'Post a pull-request comment'
  )
  .option('-ps, --project-slug <ps>')
  .option('-rs, --repository-slug <rs>')
  .option('-sev, --severity <rs>', 'BLOCKER or NORMAL', 'NORMAL')
  .option(
    '-ck, --comment-key <rs>',
    'Some string that identifies the comment. Will ensure same comment is not re-posted if unchanged and replaced if changed.'
  )
  .option('-prid, --pull-request <prid>');

program.parse(process.argv);

const options = program.opts();

const bitbucketService = new BitbucketService({
  personalAccessToken: options.bitbucketServerAccessToken,
  projects: options.bitbucketServerProjects,
  url: options.bitbucketServerUrl,
});

if (options.gatherInformation) {
  gatherInformation(bitbucketService, options);
} else if (options.formatComment) {
  formatComment(bitbucketService, options);
} else if (options.postPullRequestComment) {
  postPrComment(bitbucketService, options);
}
