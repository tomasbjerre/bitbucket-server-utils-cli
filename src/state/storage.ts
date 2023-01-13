import { BitbucketServerState } from './Model';
import log from '../utils/log';
import fs from 'fs';

export function getState(filename: string): BitbucketServerState {
  log('DEBUG', `Reading state from ${filename}`);
  const jsonState = fs.readFileSync(filename, 'utf-8');
  const state = JSON.parse(jsonState);
  return state as BitbucketServerState;
}

export function saveState(state: BitbucketServerState, filename: string) {
  log('INFO', `Storing state in ${filename}`);
  const jsonState = JSON.stringify(state, null, 4);
  fs.writeFileSync(filename, jsonState);
}
