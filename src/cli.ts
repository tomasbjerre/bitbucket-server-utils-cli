#!/usr/bin/env node

import { Command } from 'commander';
import BitbucketService from './bitbucketserver/bitbucket-service';
import formatString from './format-string/format-string';
import gatherState from './state/gather';
import { saveState } from './state/storage';
import { LOG_LEVEL, setLogLevel } from './utils/log';
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
    '-gs, --gather-state',
    'Gather state from Bitbucket Server and store it in a file.'
  )
  .option(
    '-gss, --gather-state-sleep <milliseconds>',
    'Milliseconds to sleep between HTTP requests.',
    '300'
  )
  .option('-sf, --state-file <filename>', 'File to read, and write, state to.')
  .option(
    '-fc, --format-string',
    'Format a string by rendering a Handlebars-template with the state as context.'
  )
  .option('-t, --template <string>', 'String containing Handlebars template.')
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
  .option('-prid, --pull-request <prid>')
  .option(
    '--log-level <level>',
    'Log level DEBUG, INFO or ERROR',
    'INFO' as LOG_LEVEL
  );

program.parse(process.argv);

const options = program.opts();

setLogLevel(options.logLevel as LOG_LEVEL);

const bitbucketService = new BitbucketService({
  personalAccessToken: options.bitbucketServerAccessToken,
  projects: options.bitbucketServerProjects,
  url: options.bitbucketServerUrl,
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
