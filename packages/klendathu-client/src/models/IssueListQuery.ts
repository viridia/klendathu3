import { Project } from './Project';
import { Issue as IssueData } from 'klendathu-json-types';
// import { Issue } from './Issue';
// import { Name } from './Name';
import { action, computed, IObservableArray, observable } from 'mobx';

type Issue = IssueData;

// type Comparator = (l: Issue, r: Issue) => number;
//
// function getComparator(fieldName: string, descending: boolean): Comparator {
//   return (l, r) => {
//     const lval = (l as any)[fieldName];
//     const rval = (r as any)[fieldName];
//     const result = lval < rval ? -1 : (rval < lval ? 1 : 0);
//     return descending ? -result : result;
//   };
// }
//
// function nameComparator(fieldName: string, descending: boolean): Comparator {
//   return (l, r) => {
//     const lval: Name = (l as any)[fieldName];
//     const rval: Name = (r as any)[fieldName];
//     const lname = (lval && lval.name) || '';
//     const rname = (rval && rval.name) || '';
//     const result = lname < rname ? -1 : (rname < lname ? 1 : 0);
//     return descending ? -result : result;
//   };
// }

export class IssueListQuery {
  @observable public loading = true;
  @observable public error: string = null;
  @observable public sort: string = 'id';
  @observable public descending: boolean = true;
  @observable.shallow private issues = [] as IObservableArray<Issue>;
  private idMap = new Map<number, Issue>();
  private project: Project;
  // private unsubscribe: () => void;

  constructor(project: Project) {
    this.project = project;
    // this.unsubscribe = db
    //     .collection('database').doc(project.owner)
    //     .collection('projects').doc(project.id)
    //     .collection('issues')
    //     .onSnapshot({
    //   next: this.onNext,
    //   error: this.onError,
    // });
  }

  public release() {
    // this.unsubscribe();
  }

  public get length(): number {
    return this.issues.length;
  }

  public get list(): Issue[] {
    return this.issues;
  }

  public byId(id: number): Issue {
    return this.idMap.get(id);
  }

  // public search(token: string): Issue[] {
  //   const words = token.split(/\s+/).filter(w => w.length >= 2);
  //   const patterns = words.map(word => {
  //     const p = word.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  //     return new RegExp(`\\b${p}`);
  //   });
  //   if (patterns.length === 0) {
  //     return [];
  //   }
  //   return this.issues.filter(issue => {
  //     let all = true;
  //     for (const pattern of patterns) {
  //       if (!pattern.test(issue.summary) &&
  //           !pattern.test(issue.description) &&
  //           !pattern.test(String(issue.id))) {
  //         all = false;
  //         break;
  //       }
  //     }
  //     return all;
  //   });
  // }

  // @computed
  // public get sorted(): Issue[] {
  //   return this.issues.sort(this.comparator);
  // }

  // @computed
  // public get comparator(): Comparator {
  //   const field = this.project.template.fields.get(this.sort);
  //   if (!field) {
  //     if (this.sort === 'ownerName' || this.sort === 'reporterName') {
  //       return nameComparator(this.sort, this.descending);
  //     }
  //     return getComparator(this.sort, this.descending);
  //   }
  //   return getComparator('id', true);
  // }
  //
  // public get size(): number {
  //   return this.issues.length;
  // }

  // @action.bound
  // private onNext(record: firebase.firestore.QuerySnapshot) {
  //   this.idMap.clear();
  //   this.issues.replace(record.docs.map(doc => {
  //     const issue = new Issue(doc.data() as IssueRecord);
  //     this.idMap.set(issue.id, issue);
  //     return issue;
  //   }));
  //   this.loading = false;
  //   this.error = null;
  // }
  //
  // @action.bound
  // private onError(error: Error) {
  //   this.issues.clear();
  //   this.loading = false;
  //   this.error =
  //       `Error loading issues ${this.project.owner}/${this.project.id}: ${error.message}.`;
  //   console.error('Error loading issues:', error);
  // }
}
