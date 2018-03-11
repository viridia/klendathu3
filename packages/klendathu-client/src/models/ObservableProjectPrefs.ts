import { ProjectPrefs, Filter } from 'klendathu-json-types';
import { action, IObservableArray, observable } from 'mobx';
import { session } from './Session';

const DEFAULT_COLUMNS = [
  'updated',
  'type',
  'owner',
  'state',
];

export class ObservableProjectPrefs implements ProjectPrefs {
  @observable public loaded = true;
  @observable.shallow public readonly filters = [] as IObservableArray<Filter>;
  @observable.shallow public readonly columns = [...DEFAULT_COLUMNS] as IObservableArray<string>;
  @observable.shallow public readonly labels = [] as IObservableArray<string>;

  private record: deepstreamIO.Record;

  constructor(account: string, project: string) {
    if (!account) {
      throw Error('Missing account');
    }
    if (!project) {
      throw Error('Missing project');
    }
    this.record = session.connection.record.getRecord(
        `project-prefs/${account}/${project}/${session.userId}`);
    this.record.subscribe(this.onUpdate, true);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  /** Returns true if we should display this label in hotlists. */
  public showLabel(label: string) {
    return this.labels.indexOf(label) >= 0;
  }

  @action.bound
  private onUpdate(data: ProjectPrefs) {
    this.loaded = true;
    this.filters.replace(data.filters);
    if (data.columns !== null) {
      this.columns.replace(data.columns);
    } else {
      this.columns.replace(DEFAULT_COLUMNS);
    }
    this.labels.replace(data.labels);
  }
}
