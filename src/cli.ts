#!/usr/bin/env node

import { Command } from 'commander';
import BitbucketService from './bitbucketserver/bitbucket-service';
import formatString from './format-string/format-string';
import gatherState from './state/gather';
import { saveState } from './state/storage';
import log, { LOG_LEVEL, setLogLevel } from './utils/log';
import postPrComment from './post-pr-comment/post-pr-comment';

const pkgJson = require('../package.json');

function commaSeparatedList(value: string) {
  return value.split(',');
}

const program = new Command()
  .version(pkgJson.version)
  .command(pkgJson.name)
  .option('-at, --access-token <token>', 'Bitbucket Server access token')
  .option(
    '-u, --url <url>',
    'Bitbucket Server to use for REST integration (https://bitbucket-server/rest/api/latest)'
  )
  .option(
    '-p, --projects <projects>',
    'Bitbucket Server projects. Example: PROJ_1,PROJ_2,PROJ_3',
    commaSeparatedList
  )
  .option('-sf, --state-file <filename>', 'File to read, and write, state to.')
  .option('-t, --template <string>', 'String containing Handlebars template.')
  .option('-rs, --repository-slug <rs>')
  .option('-sev, --severity <rs>', 'BLOCKER or NORMAL', 'NORMAL')
  .option(
    '-ck, --comment-key <rs>',
    'Some string that identifies the comment. Will ensure same comment is not re-posted if unchanged and replaced if changed.'
  )
  .option('-prid, --pull-request <prid>')
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
  );

program.parse(process.argv);

const options = program.opts();

setLogLevel(options.logLevel as LOG_LEVEL);
log('DEBUG', options);

const bitbucketService = new BitbucketService({
  personalAccessToken: options.accessToken,
  url: options.url,
});

if (options.gatherState) {
  gatherState(bitbucketService, options).then((state) => {
    saveState(state, options.stateFile);
  });
} else if (options.formatString) {
  formatString(bitbucketService, options);
} else if (options.postPullRequestComment) {
  postPrComment(bitbucketService, options);
} else {
  console.error(JSON.stringify(options));
  console.error(program.help());
  process.exit(1);
}
