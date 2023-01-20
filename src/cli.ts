#!/usr/bin/env node

import { Command } from 'commander';
import BitbucketService from './bitbucketserver/bitbucket-service';
import formatString from './format-string/format-string';
import gatherState from './state/gather';
import { saveState } from './state/storage';
import log, { LOG_LEVEL, setLogLevel } from './utils/log';
import postPrComment from './post-pr-comment/post-pr-comment';
import deletePrComment from './delete-pr-comment/delete-pr-comment';
import postPullRequestCommentIfOpenPullRequests from './post-pull-request-comment-if-open-pull-requests/post-pull-request-comment-if-open-pull-requests';

const pkgJson = require('../package.json');

function commaSeparatedList(value: string) {
  return value.split(',');
}

const program = new Command()
  .version(pkgJson.version)
  .command(pkgJson.name)
  .option('-at, --access-token <token>', 'Bitbucket Server access token')
  .option('-u, --username <username>', 'Bitbucket Server username')
  .option('-p, --password <password>', 'Bitbucket Server password')
  .option(
    '-u, --url <url>',
    'Bitbucket Server to use for REST integration (https://bitbucket-server/rest/api/latest)'
  )
  .option(
    '-p, --projects <projects>',
    'Bitbucket Server projects. Example: PROJ_1,PROJ_2,PROJ_3',
    commaSeparatedList
  )
  .option('-rs, --repository-slug <rs>')
  .option('-prid, --pull-request <prid>')
  .option('-prcid, --pull-request-comment-id <id>')
  .option('-prcv, --pull-request-comment-version <version>')
  .option('-sf, --state-file <filename>', 'File to read, and write, state to.')
  .option('-t, --template <string>', 'String containing Handlebars template.')
  .option('-sev, --severity <rs>', 'BLOCKER or NORMAL', 'NORMAL')
  .option(
    '-ck, --comment-key <rs>',
    'Some string that identifies the comment. Will ensure same comment is not re-posted if unchanged and replaced if changed.'
  )
  .option(
    '--log-level <level>',
    'Log level DEBUG, INFO or ERROR',
    'INFO' as LOG_LEVEL
  )
  .option(
    '-gss, --sleep-time <milliseconds>',
    'Milliseconds to sleep between HTTP requests.',
    '300'
  )
  .option('-dr, --dry-run', 'Dry run, no POST/PUT/DELETE requests.', false)
  /**
   * Gather state
   */
  .option(
    '-gs, --gather-state',
    'Gather state from Bitbucket Server and store it in a file.'
  )
  /**
   * Format string
   */
  .option(
    '-fc, --format-string',
    'Format a string by rendering a Handlebars-template with the state as context.'
  )
  /**
   * Post pull-request comment
   */
  .option(
    '-pprc, --post-pull-request-comment <comment>',
    'Post a pull-request comment'
  )
  /**
   * Post pull-request comment if author has open pull-requests to review
   */
  .option(
    '-pprciopr, --post-pull-request-comment-if-open-pull-requests',
    'Post pull-request comment if author has open pull-requests to review'
  )
  /**
   * Delete pull-request comment
   */
  .option(
    '-dprc, --delete-pull-request-comment',
    'Delete pull-request comment with given ID'
  );

program.parse(process.argv);

const options = program.opts();

setLogLevel(options.logLevel as LOG_LEVEL);
log('DEBUG', options);

const bitbucketService = new BitbucketService({
  personalAccessToken: options.accessToken,
  username: options.username,
  password: options.password,
  url: options.url,
  sleepTime: options.sleepTime,
  dryRun: options.dryRun,
});

if (options.gatherState) {
  gatherState(bitbucketService, options).then((state) => {
    saveState(state, options.stateFile);
  });
} else if (options.formatString) {
  formatString(options);
} else if (options.postPullRequestComment) {
  postPrComment(bitbucketService, options);
} else if (options.deletePullRequestComment) {
  deletePrComment(bitbucketService, options);
} else if (options.postPullRequestCommentIfOpenPullRequests) {
  postPullRequestCommentIfOpenPullRequests(bitbucketService, options);
} else {
  console.error(JSON.stringify(options));
  console.error(program.help());
  process.exit(1);
}
