import { Milestone as MilestoneData, MilestoneStatus } from 'klendathu-json-types';
import { session } from './Session';
import { action, computed, observable, ObservableMap } from 'mobx';

// function compareMilestonesByName(a: MilestoneData, b: MilestoneData): number {
//   if (a.name < b.name) { return -1; }
//   if (a.name > b.name) { return 1; }
//   return 0;
// }

const STATUS_ORDER = {
  [MilestoneStatus.ACTIVE]: 0,
  [MilestoneStatus.PENDING]: 1,
  [MilestoneStatus.STATIC]: 2,
  [MilestoneStatus.CONCLUDED]: 3,
};

function compareMilestonesByStatus(a: MilestoneData, b: MilestoneData): number {
  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
}

// function compareMilestonesByDate(a: MilestoneData, b: MilestoneData): number {
//   if (a.startDate < b.startDate) { return -1; }
//   if (a.startDate > b.startDate) { return 1; }
//   return 0;
// }

/** Live query that returns the list of all projects that the user is a member of. */
export class MilestoneListQuery {
  @observable public loaded = false;
  @observable private milestones = new ObservableMap<MilestoneData>();
  private record: deepstreamIO.Record;

  constructor(account: string, project: string) {
    this.record = session.connection.record.getRecord(`milestones/${account}/${project}`);
    this.record.subscribe(this.onUpdate, true);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  public byId(id: string) {
    return this.milestones.get(id);
  }

  @computed
  get asList(): MilestoneData[] {
    const labels = Array.from(this.milestones.values());
    labels.sort(compareMilestonesByStatus);
    return labels;
  }

  get length() {
    return this.milestones.size;
  }

  @action.bound
  private onUpdate(args: { [id: string]: MilestoneData }) {
    const map = new Map<string, MilestoneData>();
    Object.getOwnPropertyNames(args).forEach(id => {
      if (args[id]) {
        map.set(id, args[id]);
      }
    });
    this.milestones.replace(map);
    this.loaded = true;
  }
}
