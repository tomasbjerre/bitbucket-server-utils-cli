export type LOG_LEVEL = 'INFO' | 'DEBUG' | 'ERROR';

let logLevel: LOG_LEVEL = 'ERROR';

export function setLogLevel(level: LOG_LEVEL) {
  logLevel = level;
}

export default function log(level: LOG_LEVEL, entry: any) {
  if (
    logLevel == 'DEBUG' || //
    (logLevel == 'INFO' && ['INFO', 'ERROR'].includes(level)) || //
    (logLevel == 'ERROR' && level == 'ERROR')
  ) {
    const str = typeof entry == 'object' ? JSON.stringify(entry) : `${entry}`;
    console.log(`${level} - ${str}`);
  }
}
