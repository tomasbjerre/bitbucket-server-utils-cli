import Handlebars from 'handlebars';
import BitbucketService from '../bitbucketserver/bitbucket-service';
import { getState } from '../state/storage';
import log from '../utils/log';

export default async function formatString(
  bitbucketService: BitbucketService,
  options: any
) {
  const templateString = options.template;
  let context = undefined;
  try {
    const templateHandlebars = Handlebars.compile(templateString);
    context = getState(options.stateFile);
    const rendered = templateHandlebars(context);
    console.log(rendered);
  } catch (e) {
    log(
      'ERROR',
      `Rendering context:\n\n${JSON.stringify(context, null, 4)}\n\n`
    );
    log('ERROR', `Rendering template:\n\n${templateString}\n\n`);
    throw e;
  }
}
