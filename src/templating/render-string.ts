import Handlebars from 'handlebars';
import log from '../utils/log';

export default function renderString(context: any, templateString: string) {
  try {
    const templateHandlebars = Handlebars.compile(templateString);
    log(
      'DEBUG',
      `Context:\n\n${JSON.stringify(
        context,
        null,
        4
      )}\n\nTemplate:\n\n${templateString}\n\n`
    );
    const rendered = templateHandlebars(context);
    return rendered;
  } catch (e) {
    log(
      'ERROR',
      `Context:\n\n${JSON.stringify(
        context,
        null,
        4
      )}\n\nTemplate:\n\n${templateString}\n\n`
    );
    throw e;
  }
}
