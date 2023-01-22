const state = require('./state-file.json').v1;
import renderString from '../utils/render-string';
beforeAll(() => {
  jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2020);
  jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(1);
  jest.spyOn(Date.prototype, 'getDate').mockReturnValue(3);
  jest.spyOn(Date.prototype, 'getTime').mockReturnValue(1674410998939);
});

it('should render string with helpers', () => {
  const template = `
  year: {{dateYear lastUpdated}}
  month: {{dateMonth lastUpdated}}
  day: {{dateDay lastUpdated}}

  commit: {{#commit "222222d1d6c87172cf2dea0f3c18df6ed687ead4"}}
    Commit author slug: {{author.slug}}
  {{/commit}}


  Found {{length repositories}} repositories.
  {{#each repositories}}
    Repository: {{repository.slug.projectSlug}} / {{repository.slug.repoSlug}} with {{length commits}} commits.

    {{#ifEqual repository.slug.repoSlug "repo_2"}}
      This is Repo 2
    {{/ifEqual}}

    Found {{length branches}} branches:
    {{#each branches}}
      Branch: {{displayId}}
    {{/each}}

    Found {{length pullRequests}} pull-requests:
    {{#each pullRequests}}
      Pull-request: {{id}}
      From: {{fromRef.latestCommit}}
      {{#commit fromRef.latestCommit}}
        Commit author slug: {{author.slug}}
      {{/commit}}
    {{/each}}
  {{/each}}
  `;
  const actual = renderString({ state, context: state, template });

  expect(actual).toMatchInlineSnapshot(`
    "
      year: 2020
      month: 2
      day: 3

      commit: 
        Commit author slug: 123123123


      Found 2 repositories.
        Repository: PROJ_1 / repo_1 with 2 commits.


        Found 2 branches:
          Branch: master
          Branch: some-feature

        Found 2 pull-requests:
          Pull-request: 128
          From: 222222d1d6c87172cf2dea0f3c18df6ed687ead4
            Commit author slug: 123123123
          Pull-request: 129
          From: 222222d1d6c87172cf2dea0f3c18df6ed687ead4
            Commit author slug: 123123123
        Repository: PROJ_1 / repo_2 with 1 commits.

          This is Repo 2

        Found 1 branches:
          Branch: master

        Found 0 pull-requests:
      "
  `);
});
