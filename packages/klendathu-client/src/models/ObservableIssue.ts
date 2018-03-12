import { Issue, IssueBase, CustomValues } from 'klendathu-json-types';
import { action, computed, observable } from 'mobx';

/** Represents the displayable info for a user or organization. */
export class ObservableIssue implements IssueBase {
  public id: string;
  @observable public type: string;
  @observable public state: string;
  @observable public summary: string = '';
  @observable public description: string = '';
  @observable public reporter: string;
  @observable public owner: string;
  @observable public cc: string[];
  @observable public labels: string[];
  @observable public custom: CustomValues;
  @observable public created: Date;
  @observable public updated: Date;
  @observable public loaded = false;

  private record: deepstreamIO.Record;
  private refCount: number;

  constructor(record: deepstreamIO.Record) {
    this.id = record.name.split('/').slice(1, 4).join('/');
    this.refCount = 1;
    this.record = record;
    record.subscribe(this.onUpdate, true);
  }

  /** Numeric index of issue. */
  @computed
  get index(): number {
    const idString = this.record.name.split('/', 4)[3];
    return idString ? parseInt(idString, 10) : 0;
  }

  public acquire() {
    this.refCount += 1;
  }

  public release() {
    this.refCount -= 1;
    if (this.refCount === 0) {
      this.record.unsubscribe(this.onUpdate);
      this.record.discard();
    }
  }

  @action.bound
  private onUpdate(recordData: Issue) {
    if (recordData.id) {
      this.id = recordData.id;
      this.type = recordData.type;
      this.state = recordData.state;
      this.summary = recordData.summary;
      this.description = recordData.description;
      this.reporter = recordData.reporter;
      this.owner = recordData.owner;
      this.cc = recordData.cc;
      this.labels = recordData.labels;
      this.custom = recordData.custom;
      this.created = new Date(recordData.created);
      this.updated = new Date(recordData.updated);
      this.loaded = true;
    }
  }
}
