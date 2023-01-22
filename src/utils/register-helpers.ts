import Handlebars from 'handlebars';
import { BitbucketServerState } from '../state/Model';

export default function registerHelpers(state: BitbucketServerState) {
  Handlebars.registerHelper('dateYear', (it) => new Date(it).getFullYear());

  Handlebars.registerHelper('dateMonth', (it) => new Date(it).getMonth() + 1);

  Handlebars.registerHelper('dateDay', (it) => new Date(it).getDate());

  Handlebars.registerHelper('commit', (commitIdContext, options) => {
    for (let repository of Object.values(state.repositories)) {
      const commit = repository.commits[commitIdContext];
      if (commit) {
        return options.fn(commit);
      }
    }
    throw Error(`No such commitId ${commitIdContext}`);
  });

  Handlebars.registerHelper('ifEqual', (a, b, options) => {
    if (a == b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('length', (it) => {
    const typeOf = typeof it;
    if (typeOf == 'object') {
      return Object.keys(it).length;
    }
    return it.length;
  });
}
