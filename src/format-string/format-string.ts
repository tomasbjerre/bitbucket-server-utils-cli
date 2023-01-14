import Handlebars from 'handlebars';
import BitbucketService from '../bitbucketserver/bitbucket-service';
import { getState } from '../state/storage';
import log from '../utils/log';

export default async function formatString(
  bitbucketService: BitbucketService,
  options: any
) {
  const templateString = options.template;
  const templateHandlebars = Handlebars.compile(templateString);
  const context = getState(options.stateFile);
  const rendered = templateHandlebars(context);
  log('DEBUG', `Rendering context:\n\n${JSON.stringify(context, null, 4)}\n\n`);
  log('DEBUG', `Rendering template:\n\n${templateString}\n\n`);
  console.log(rendered);
}
