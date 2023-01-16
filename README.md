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
  -at asd...asd \
  -u http://localhost:8080/rest/api/latest \
  -p PROJ_1
```

Or standalone with:

```sh
npx bitbucket-server-utils-cli \
  -at asd...asd \
  -u http://localhost:8080/rest/api/latest \
  -p PROJ_1
```

### Gather state

Gather state and store it in a file. This allows other features to quickly have access to the state. You may, for example, want to have this state file versioned in a Git repository to have access to it in CI pipelines.

```sh
npx bitbucket-server-utils-cli \
  --gather-state \
  --url http://localhost:8080/rest/api/latest \
  --access-token asd...asd \
  --projects PROJ_1 \
  --state-file /tmp/some-file.json
```

### Format string

Format a string by rendering a [Handlebars-template](https://handlebarsjs.com/) with the state as context.

```sh
template=$(cat <<-END
 {{#each pullRequests}}
   <p>
     <b>Last updated:</b> <i>{{lastUpdated}}</i>
   </p>
 {{/each}}
END
)
renderedString=$(npx bitbucket-server-utils-cli \
  --format-string \
  --state-file /tmp/some-file.json \
  --template "$template")
echo "The rendered string is: $renderedString"
```

_Or get the template from a file with `--template "$(</tmp/template.hbs)"`._

Now the `$renderedString` can perhaps be used as a comment, or maby it is rendered HTML that you want to write to a file.

### Comment pull-request

Comment a pull-request:

```sh
npx bitbucket-server-utils-cli \
  --post-pull-request-comment "this is the comment" \
  --url http://localhost:8080/rest/api/latest \
  --access-token asd...asd \
  --projects PROJ_1 \
  --repository-slug repo_1 \
  --pull-request 461 \
  --severity BLOCKER \
  --comment-key somethingunique
```

### Delete comment in pull-request by id

Delete comment in pull-request:

```sh
npx bitbucket-server-utils-cli \
  --delete-pull-request-comment \
  --url http://localhost:8080/rest/api/latest \
  --access-token asd...asd \
  --projects PROJ_1 \
  --repository-slug repo_1 \
  --pull-request 461 \
  --pull-request-comment-id 999
```

### Delete comment in pull-request by comment key

Delete any comments in pull-request if they contain the comment key:

```sh
npx bitbucket-server-utils-cli \
  --delete-pull-request-comment \
  --url http://localhost:8080/rest/api/latest \
  --access-token asd...asd \
  --projects PROJ_1 \
  --repository-slug repo_1 \
  --pull-request 461 \
  --comment-key somethingunique
```

### Comment any pull-request where the author has pull-requests to review

A comment with specific message to authors who has other pull-requests to review.

```sh
template=$(cat <<-END
You, **{{authorPullRequest.author}}**, have pull-requests that are waiting for your feedback:
{{#each pullRequests}}
  - [{{title}}](http://bitbucket-server/projects/{{repository.projectSlug}}/repos/{{repository.repoSlug}}/pull-requests/{{id}}/)
{{/each}}
END
)
npx bitbucket-server-utils-cli \
  --post-pull-request-comment-if-open-pull-requests \
  --url http://localhost:8080/rest/api/latest \
  --access-token asd...asd \
  --state-file /tmp/some-file.json \
  --severity BLOCKER \
  --template "$template"
```

## Command line arguments

```shell
Options:
  -at, --access-token <token>                                   Bitbucket Server access token
  -u, --url <url>                                               Bitbucket Server to use for REST integration
                                                                (https://bitbucket-server/rest/api/latest)
  -p, --projects <projects>                                     Bitbucket Server projects. Example: PROJ_1,PROJ_2,PROJ_3
  -rs, --repository-slug <rs>
  -prid, --pull-request <prid>
  -prcid, --pull-request-comment-id <id>
  -prcv, --pull-request-comment-version <version>
  -sf, --state-file <filename>                                  File to read, and write, state to.
  -t, --template <string>                                       String containing Handlebars template.
  -sev, --severity <rs>                                         BLOCKER or NORMAL (default: "NORMAL")
  -ck, --comment-key <rs>                                       Some string that identifies the comment. Will ensure same comment is not
                                                                re-posted if unchanged and replaced if changed.
  --log-level <level>                                           Log level DEBUG, INFO or ERROR (default: "INFO")
  -gss, --sleep-time <milliseconds>                             Milliseconds to sleep between HTTP requests. (default: "300")
  -dr, --dry-run                                                Dry run, no POST/PUT/DELETE requests. (default: false)
  -gs, --gather-state                                           Gather state from Bitbucket Server and store it in a file.
  -fc, --format-string                                          Format a string by rendering a Handlebars-template with the state as
                                                                context.
  -pprc, --post-pull-request-comment <comment>                  Post a pull-request comment
  -pprciopr, --post-pull-request-comment-if-open-pull-requests  Post pull-request comment if author has open pull-requests to review
  -dprc, --delete-pull-request-comment                          Delete pull-request comment with given ID
  -h, --help                                                    display help for command
```
