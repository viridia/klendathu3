import { action, observable } from 'mobx';
import {
  IssueType,
  Template as TemplateData,
  FieldType,
  Workflow,
  WorkflowState,
} from 'klendathu-json-types';
import { session } from '../models';

interface ReadableMap<K, V> {
  get(key: K): V;
}

/** A reference to a project template by it's name. */
export class Template {
  public readonly id: string;
  @observable public loaded = false;

  @observable.shallow private fieldMap = new Map<string, FieldType>();
  @observable.shallow private stateMap = new Map<string, WorkflowState>();
  @observable.ref private data: TemplateData = null;
  private record: deepstreamIO.Record;

  constructor(templateId: string) {
    if (!templateId) {
      throw Error('missing template id');
    }
    this.id = templateId;
    this.record = session.connection.record.getRecord(`template/${templateId}`);
    this.record.subscribe(this.onUpdate);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  get types(): IssueType[] {
    return this.data ? this.data.types : [];
  }

  get states(): WorkflowState[] {
    return this.data ? this.data.states : [];
  }

  get fields(): ReadableMap<string, FieldType> {
    return this.fieldMap;
  }

  public getIssueType(id: string): IssueType {
    return this.data && this.data.types.find(ty => ty.id === id);
  }

  public getState(id: string): WorkflowState {
    return this.stateMap.get(id);
  }

  public getWorkflow(id: string): Workflow {
    return this.data && this.data.workflows.find(wf => wf.name === id);
  }

  public getInheritedIssueType(id: string): IssueType {
    let iType: IssueType = this.data && this.data.types.find(ty => ty.id === id);
    if (iType) {
      if (iType.extends) {
        const base = this.getInheritedIssueType(iType.extends);
        if (base) {
          const fieldList: FieldType[] = Array.from(base.fields || []);
          if (iType.fields) {
            for (const field of iType.fields) {
              const index = fieldList.findIndex(f => f.id === field.id);
              if (index < 0) {
                fieldList.push(field);
              }
            }
          }
          iType = {
            ...base, ...iType, fields: fieldList,
          };
        }
      }
    }
    return iType;
  }

  @action.bound
  private onUpdate(data: TemplateData) {
    this.data = data;
    this.loaded = true;

    this.fieldMap.clear();
    for (const type of this.data.types) {
      for (const field of type.fields || []) {
        this.fieldMap.set(field.id, field);
      }
    }

    this.stateMap.clear();
    for (const state of this.data.states) {
      this.stateMap.set(state.id, state);
    }
  }
}
