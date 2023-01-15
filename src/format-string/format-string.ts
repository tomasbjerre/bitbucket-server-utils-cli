import { getState } from '../state/storage';
import renderString from '../templating/render-string';

export default async function formatString(options: any) {
  const templateString = options.template;
  const context = getState(options.stateFile);
  const rendered = renderString(context, templateString);
  console.log(rendered);
}
