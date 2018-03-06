import { Label as LabelData } from 'klendathu-json-types';
import { session } from './Session';
import { action, computed, observable, ObservableMap } from 'mobx';

function compareLabels(a: LabelData, b: LabelData): number {
  if (a.name < b.name) { return -1; }
  if (a.name > b.name) { return 1; }
  return 0;
}

/** Live query that returns the list of all projects that the user is a member of. */
export class LabelListQuery {
  @observable public loaded = false;
  @observable private labels = new ObservableMap<LabelData>();
  private record: deepstreamIO.Record;

  constructor(account: string, project: string) {
    this.record = session.connection.record.getRecord(`labels/${account}/${project}`);
    this.record.subscribe(this.onUpdate, true);
  }

  public release() {
    this.record.discard();
  }

  @computed
  get asList(): LabelData[] {
    const labels = Array.from(this.labels.values());
    labels.sort(compareLabels);
    return labels;
  }

  get length() {
    return this.labels.size;
  }

  @action.bound
  private onUpdate(args: { [id: string]: LabelData }) {
    const map = new Map<string, LabelData>();
    Object.getOwnPropertyNames(args).forEach(id => {
      if (args[id]) {
        map.set(id, args[id]);
      }
    });
    this.labels.replace(map);
    this.loaded = true;
  }
}
