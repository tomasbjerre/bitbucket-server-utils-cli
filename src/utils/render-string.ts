import Handlebars from 'handlebars';
import { BitbucketServerState } from '../state/Model';
import log from './log';
import registerHelpers from './registerHelpers';

export interface RenderStringOpts {
  state: BitbucketServerState;
  context: any;
  template: string;
}

export default function renderString(opts: RenderStringOpts) {
  try {
    registerHelpers(opts.state);

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
