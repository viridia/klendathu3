import { Project as ProjectData } from 'klendathu-json-types';
import { session } from './Session';
import { action, computed, observable, ObservableMap } from 'mobx';
import * as qs from 'qs';

function compareProjects(a: ProjectData, b: ProjectData): number {
  if (a.title < b.title) { return -1; }
  if (a.title > b.title) { return 1; }
  return 0;
}

/** Live query that returns the list of all projects that the user is a member of. */
export class ProjectListQuery {
  @observable private projects = new ObservableMap<ProjectData>();
  private ownedProjectsRecord: deepstreamIO.Record;

  constructor() {
    this.ownedProjectsRecord = session.connection.record.getRecord(
        `projects?${qs.stringify({ owner: session.userId })}`);
    this.ownedProjectsRecord.subscribe(this.onUpdateOwned);
  }

  public release() {
    this.ownedProjectsRecord.discard();
  }

  @computed
  get asList(): ProjectData[] {
    const projects = Array.from(this.projects.values());
    projects.sort(compareProjects);
    return projects;
  }

  @action.bound
  private onUpdateOwned(args: { [id: string]: ProjectData }) {
    const map = new Map<string, ProjectData>();
    Object.getOwnPropertyNames(args).forEach(id => {
      if (args[id]) {
        map.set(id, args[id]);
      }
    });
    this.projects.replace(map);
  }
}
