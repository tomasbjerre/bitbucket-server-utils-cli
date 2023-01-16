import { getState } from '../state/storage';
import renderString from '../utils/render-string';

export default function formatString(options: any) {
  const rendered = getFormattedString(options);
  console.log(rendered);
}

export function getFormattedString(options: any) {
  const template = options.template;
  const state = getState(options.stateFile);
  return renderString({ state, context: state, template });
}
