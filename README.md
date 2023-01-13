# Bitbucket Server Utils CLI

[![NPM](https://img.shields.io/npm/v/bitbucket-server-utils-cli.svg?style=flat-square)](https://www.npmjs.com/package/bitbucket-server-utils-cli)

**Work in progress.**

Bitbucket Server utilities packaged as a standalone command line tool. Can be used in CI pipelines and similar things.

Using [Bitbucket Server REST API](https://developer.atlassian.com/server/bitbucket/how-tos/command-line-rest/)

## Usage

You will need to create a token:
https://bitbucket-server/plugins/servlet/access-tokens/manage

The CLI can be run from this repo with:

```sh
npm run start -- \
 -bbsat asd...asd \
 -bbsu http://localhost:8080/rest/api/latest \
 -bbsp PROJ_1
```

Or standalone with:

```sh
npx bitbucket-server-utils-cli \
 -bbsat asd...asd \
 -bbsu http://localhost:8080/rest/api/latest \
 -bbsp PROJ_1
```

### Gather state

Gather state and store it in a file. This allows other features to quickly have access to the state. You may, for example, want to have this state file versioned in a Git repository to have access to it in CI pipelines.

```sh
npx bitbucket-server-utils-cli \
 --bitbucket-server-url http://localhost:8080/rest/api/latest \
 --bitbucket-server-access-token asd...asd \
 --bitbucket-server-projects PROJ_1 \
 --gather-state \
 --state-file /tmp/some-file.json
```

### Comment pull-request

Comment a pull-request:

```sh
npx bitbucket-server-utils-cli \
 --bitbucket-server-url http://localhost:8080/rest/api/latest \
 --bitbucket-server-access-token asd...asd \
 --project-slug PROJ_1 \
 --repository-slug repo_1 \
 --pull-request 461 \
 --severity BLOCKER \
 --comment-key somethingunique \
 --post-pull-request-comment "this is the comment"
```

## Command line arguments

```shell
Options:
  -bbsat, --bitbucket-server-access-token <token>  Bitbucket Server access token
  -bbsu, --bitbucket-server-url <url>              Bitbucket Server to use for REST integration (https://bitbucket-server/rest/api/latest)
  -bbsp, --bitbucket-server-projects <projects>    Bitbucket Server projects. Example: PROJ_1,PROJ_2,PROJ_3
  -gs, --gather-state                              Gather state from Bitbucket Server and store it in a file.
  -gss, --gather-state-sleep <milliseconds>        Milliseconds to sleep between HTTP requests. (default: "300")
  -sf, --state-file <filename>                     File to read, and write, state to.
  -fc, --format-user-comment                       Format a comment that may be presented to the user. A context is provided that is
                                                   rendered with a supplied Handlebars-template.
  -t, --template <filename>                        File containing Handlebars template.
  -pprc, --post-pull-request-comment <comment>     Post a pull-request comment
  -ps, --project-slug <ps>
  -rs, --repository-slug <rs>
  -sev, --severity <rs>                            BLOCKER or NORMAL (default: "NORMAL")
  -ck, --comment-key <rs>                          Some string that identifies the comment. Will ensure same comment is not re-posted if
                                                   unchanged and replaced if changed.
  -prid, --pull-request <prid>
  --log-level <level>                              Log level DEBUG, INFO or ERROR (default: "INFO")
  -h, --help                                       display help for command
```
