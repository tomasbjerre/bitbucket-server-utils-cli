const state = require('./state-file.json').v1;
import renderString from '../utils/render-string';

it('should render string with helpers', () => {
  const template = `
  year: {{dateYear lastUpdated}}
  month: {{dateMonth lastUpdated}}
  day: {{dateDay lastUpdated}}

  commit: {{#commit "222222d1d6c87172cf2dea0f3c18df6ed687ead4"}}
    Commit author slug: {{author.slug}}
  {{/commit}}


  {{#each repositories}}
    Repository: {{repository.slug.projectSlug}} / {{repository.slug.repoSlug}}

    {{#ifEqual repository.slug.repoSlug "repo_2"}}
      This is Repo 2
    {{/ifEqual}}

    {{#each branches}}
      Branch: {{displayId}}
    {{/each}}

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
      year: 2023
      month: 1
      day: 21

      commit: 
        Commit author slug: 123123123


        Repository: PROJ_1 / repo_1


          Branch: master
          Branch: some-feature

          Pull-request: 128
          From: 222222d1d6c87172cf2dea0f3c18df6ed687ead4
            Commit author slug: 123123123
          Pull-request: 129
          From: 222222d1d6c87172cf2dea0f3c18df6ed687ead4
            Commit author slug: 123123123
        Repository: PROJ_1 / repo_2

          This is Repo 2

          Branch: master

      "
  `);
});
