import { BitbucketServerState, RepositoryState } from './Model';
import log from '../utils/log';
import fs from 'fs';
import { Commit } from '../bitbucketserver/Model';

interface StorageState {
  v1: BitbucketServerState;
}

export function getEmptyState(): BitbucketServerState {
  return {
    lastUpdated: new Date().getTime(),
    commits: {} as Record<string, Commit>,
    repositories: {} as Record<string, RepositoryState>,
  };
}
export function getState(filename: string): BitbucketServerState {
  log('DEBUG', `Reading state from ${filename}`);
  if (!filename) {
    throw new Error(`No filename supplied`);
  }
  if (!fs.existsSync(filename)) {
    throw new Error(`Filename does not exist: ${filename}`);
  }
  const storageStateJson = fs.readFileSync(filename, 'utf-8');
  const storageState = JSON.parse(storageStateJson) as StorageState;
  return storageState.v1;
}

export function getOrCreateState(filename: string): BitbucketServerState {
  try {
    return getState(filename);
  } catch (e) {
    return getEmptyState();
  }
}

export function saveState(state: BitbucketServerState, filename: string) {
  log('INFO', `Storing state in ${filename}`);
  const storageState: StorageState = {
    v1: state,
  };
  const jsonState = JSON.stringify(storageState, null, 4);
  fs.writeFileSync(filename, jsonState);
}
