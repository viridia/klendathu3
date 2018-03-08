import * as LRU from 'lru-cache';
import { ObservableLabel } from './ObservableLabel';
import { session } from '../models';

export class LabelStore {
  private cache: LRU.Cache<string, ObservableLabel>;

  constructor() {
    this.cache = LRU({ max: 1000, dispose: this.onDispose });
  }

  /** Look up an account by it's database id. Returns an observable object which changes in
      response to database mutations. */
  public get(uid: string): ObservableLabel {
    let label = this.cache.get(uid);
    if (label) {
      label.acquire();
      return label;
    }
    const record = session.connection.record.getRecord(`label/${uid}`);
    label = new ObservableLabel(record);
    label.acquire();
    this.cache.set(uid, label);
    return label;
  }

  private onDispose(id: string, label: ObservableLabel) {
    label.release();
  }
}

export const labels = new LabelStore();
