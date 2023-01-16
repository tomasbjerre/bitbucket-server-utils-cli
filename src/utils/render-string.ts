import Handlebars from 'handlebars';
import { BitbucketServerState } from '../state/Model';
import log from './log';

export interface RenderStringOpts {
  state: BitbucketServerState;
  context: any;
  template: string;
}

export default function renderString(opts: RenderStringOpts) {
  try {
    Handlebars.registerHelper('dateYear', (it) => new Date(it).getFullYear());
    Handlebars.registerHelper('dateMonth', (it) => new Date(it).getMonth() + 1);
    Handlebars.registerHelper('dateDay', (it) => new Date(it).getDate());
    Handlebars.registerHelper('commit', (commitIdContext, options) => {
      for (let repository of Object.values(opts.state.repositories)) {
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

    const templateHandlebars = Handlebars.compile(opts.template);
    log(
      'DEBUG',
      `Context:\n\n${JSON.stringify(opts.context, null, 4)}\n\nTemplate:\n\n${
        opts.template
      }\n\n`
    );
    const rendered = templateHandlebars(opts.context);
    return rendered;
  } catch (e) {
    log(
      'ERROR',
      `Context:\n\n${JSON.stringify(opts.context, null, 4)}\n\nTemplate:\n\n${
        opts.template
      }\n\n`
    );
    throw e;
  }
}
