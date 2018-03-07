import { ProjectPrefs as ProjectPrefsData } from 'klendathu-json-types';
import { observable } from 'mobx';

const DEFAULT_COLUMNS = [
  'updated',
  'type',
  'owner',
  'state',
];

export class ProjectPrefs {
  @observable public loading = true;
  @observable public error: string = null;
  @observable.ref private prefs: ProjectPrefsData = null;
  private unsubscribe: () => void;
  private account: string;
  private project: string;

  constructor(account: string, project: string) {
    this.account = account;
    this.project = project;
    // this.unsubscribe = db
    //     .collection('database').doc(owner)
    //     .collection('projects').doc(id)
    //     .collection('settings').doc(authModel.userId)
    //     .onSnapshot({
    //   next: this.onNext,
    //   error: this.onError,
    // });
  }

  public release() {
    // this.unsubscribe();
  }

  public get value(): ProjectPrefsData {
    return this.prefs;
  }

  public get columns(): string[] {
    return this.prefs && this.prefs.columns !== undefined ? this.prefs.columns : DEFAULT_COLUMNS;
  }

  // @action.bound
  // private onNext(record: firebase.firestore.DocumentSnapshot) {
  //   this.prefs = record.exists ? record.data() as ProjectPrefs : null;
  //   this.loading = false;
  //   this.error = null;
  // }
  //
  // @action.bound
  // private onError(error: Error) {
  //   this.prefs = null;
  //   this.loading = false;
  //   this.error = `Error loading prefs ${this.owner}/${this.id}: ${error.message}.`;
  //   console.error('Error loading prefs:', error);
  // }
}
