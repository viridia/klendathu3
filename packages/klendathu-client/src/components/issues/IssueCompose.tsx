import * as React from 'react';
import { Account, IssueListQuery, Project, session, Template } from '../../models';
import { StateSelector } from './input/StateSelector';
import { TypeSelector } from './input/TypeSelector';
import { LabelSelector } from './input/LabelSelector';
import { IssueSelector } from './input/IssueSelector';
import { AutoNavigate } from '../common/AutoNavigate';
import { UserAutocomplete } from '../common/UserAutocomplete';
import { IssueLinks } from './IssueLinks';
import { relationNames } from '../common/relationNames';
// import { RequestError, RequestErrorCode } from '../../requests/RequestError';
import {
  Button,
  Checkbox,
  ControlLabel,
  DropdownButton,
  FormControl,
  MenuItem,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { action, computed, IObservableArray, observable } from 'mobx';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';
import {
  IssueInput,
  Issue as IssueRecord,
  IssueType,
  Label,
  Relation,
  Workflow,
} from 'klendathu-json-types';

import './IssueCompose.scss';

const RELATIONS: Relation[] = [
  Relation.BLOCKS,
  Relation.BLOCKED_BY,
  Relation.DUPLICATE,
  Relation.HAS_PART,
  Relation.PART_OF,
  Relation.RELATED,
];

interface Props {
  project: Project;
  issues: IssueListQuery;
  issue?: IssueRecord;
  onSave: (input: IssueInput) => Promise<any>;
}

@observer
export class IssueCompose extends React.Component<Props> {
  @observable private type: string = '';
  @observable private issueState: string = '';
  @observable private summary: string = '';
  @observable private description: string = '';
  @observable private public: boolean = false;
  @observable private another: boolean = false;
  @observable private owner: Account = null;
  @observable.shallow private cc = [] as IObservableArray<Account>;
  @observable.shallow private labels = [] as IObservableArray<Label>;
  @observable private relation: Relation = Relation.BLOCKED_BY;
  @observable private issueToLink: IssueRecord = null;
  @observable.shallow private issueLinkMap = new Map<string, Relation>();
  @observable private busy = false;
  private prevState: string = '';

  public componentWillUpdate() {
    this.resetType();
  }

  public render() {
    // const project = this.props.projectRef.value;
    const template = this.template;
    if (!template) {
      return null;
    }
    const issue: any = null;
    const canSave = !this.busy && this.type && this.issueState && this.summary;
    const backLink = '/foo/bar';
    return (
      <section className="kdt issue-compose">
        <div className="card">
          <header>
            {issue
              ? <span>Edit Issue #{issue.id}</span>
              : <span>New Issue: {this.props.project.uname}</span>}
          </header>
          <form
              name="lastpass-disable-search"
              className="content create-issue"
              onSubmit={this.onSubmit}
          >
            <AutoNavigate />
            <section className="left">
              <table className="create-issue-table form-table">
                <tbody>
                  <tr>
                    <th className="header"><ControlLabel>Issue Type:</ControlLabel></th>
                    <td>
                      <TypeSelector
                          value={this.type}
                          template={template}
                          onChange={this.onChangeType}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Summary:</ControlLabel></th>
                    <td>
                      <FormControl
                          className="summary"
                          type="text"
                          value={this.summary}
                          placeholder="one-line summary of this issue"
                          onChange={this.onChangeSummary}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Description:</ControlLabel></th>
                    <td>
                      <FormControl
                          className="description"
                          componentClass="textarea"
                          value={this.description}
                          placeholder="description of this issue (markdown format supported)"
                          onChange={this.onChangeDescription}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Reporter:</ControlLabel></th>
                    <td className="reporter single-static">
                      <span>{session.account && session.account.uname}</span>
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Assign to:</ControlLabel></th>
                    <td className="owner">
                      <UserAutocomplete
                          className="assignee ac-single"
                          placeholder="(unassigned)"
                          selection={this.owner}
                          onSelectionChange={this.onChangeOwner}
                      />
                      <a className="assign-to-me">Assign to me</a>
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>CC:</ControlLabel></th>
                    <td>
                      <div className="ac-multi-group">
                        <UserAutocomplete
                            className="assignee ac-multi"
                            multiple={true}
                            selection={this.cc.slice()}
                            onSelectionChange={this.onChangeCC}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Labels:</ControlLabel></th>
                    <td>
                      <div className="ac-multi-group">
                        <LabelSelector
                            className="labels ac-multi"
                            project={this.props.project}
                            selection={this.labels.slice()}
                            onSelectionChange={this.onChangeLabels}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="header"><ControlLabel>Linked Issues:</ControlLabel></th>
                    <td>
                      <IssueLinks
                          project={this.props.project}
                          issues={this.props.issues}
                          links={this.issueLinkMap}
                          onRemoveLink={this.onRemoveIssueLink}
                      />
                      <div className="linked-group">
                        <DropdownButton
                            bsSize="small"
                            title={relationNames[this.relation]}
                            id="issue-link-type"
                            onSelect={this.onChangeRelation}
                        >
                          {RELATIONS.map(r => (
                            <MenuItem
                                eventKey={r}
                                key={r}
                                active={r === this.relation}
                            >
                              {relationNames[r]}
                            </MenuItem>))}
                        </DropdownButton>
                        <div className="ac-shim">
                          <IssueSelector
                              className="ac-issue"
                              project={this.props.project}
                              issues={this.props.issues}
                              placeholder="select an issue..."
                              exclude={issue && issue.id}
                              selection={this.issueToLink}
                              onSelectionChange={this.onChangeIssueToLink}
                              // onEnter={this.onAddIssueLink}
                          />
                        </div>
                        <Button
                            bsSize="small"
                            onClick={this.onAddIssueLink}
                            disabled={!this.issueToLink}
                        >
                          Add
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
            <aside className="right">
              <StateSelector
                  template={template}
                  workflow={this.workflow}
                  state={this.issueState}
                  prevState={this.prevState}
                  onStateChanged={this.onChangeState}
              />
              {this.props.project.isPublic && <ControlLabel>Visbility</ControlLabel>}
              {this.props.project.isPublic &&
                (<Checkbox checked={this.public} onChange={this.onChangePublic}>
                  Public
                </Checkbox>)}
            </aside>
          </form>
          <footer className="submit-buttons">
            {!issue && (<Checkbox checked={this.another} onChange={this.onChangeAnother}>
              Create another
            </Checkbox>)}
            <LinkContainer to={backLink}>
              <Button>Cancel</Button>
            </LinkContainer>
            {issue ? (
              <Button bsStyle="primary" disabled={!canSave} onClick={this.onSubmit}>
                Save
              </Button>
            ) : (
              <Button bsStyle="primary" disabled={!canSave} onClick={this.onSubmit}>
                Create
              </Button>
            )}
          </footer>
        </div>
      </section>
    );
  }

  @action.bound
  private onChangeType(type: string) {
    this.type = type;
  }

  @action.bound
  private onChangeState(state: string) {
    this.issueState = state;
  }

  @action.bound
  private onChangeSummary(e: any) {
    this.summary = e.target.value;
  }

  @action.bound
  private onChangeDescription(e: any) {
    this.description = e.target.value;
  }

  @action.bound
  private onChangeOwner(owner: Account) {
    this.owner = owner;
  }

  @action.bound
  private onChangeCC(cc: Account[]) {
    this.cc.replace(cc);
  }

  @action.bound
  private onChangeLabels(labels: Label[]) {
    this.labels.replace(labels);
  }

  @action.bound
  private onChangeIssueToLink(selection: IssueRecord) {
    this.issueToLink =  selection;
  }

  @action.bound
  private onChangeRelation(selection: any) {
    this.relation = selection;
  }

  @action.bound
  private onChangePublic(e: any) {
    this.public = e.target.checked;
  }

  @action.bound
  private onChangeAnother(e: any) {
    this.another = e.target.checked;
  }

  @action.bound
  private onAddIssueLink() {
    if (this.relation && this.issueToLink) {
      // Can't link an issue to itself.
      if (this.props.issue && this.issueToLink.id === this.props.issue.id) {
        return;
      }
      this.issueLinkMap.set(this.issueToLink.id, this.relation);
      this.issueToLink = null;
    }
  }

  @action.bound
  private onRemoveIssueLink(id: string) {
    this.issueLinkMap.delete(id);
  }

  @action.bound
  private onSubmit(e: any) {
    e.preventDefault();
    this.busy = true;
    const input: IssueInput = {
      type: this.type,
      state: this.issueState,
      summary: this.summary,
      description: this.description,
      owner: this.owner ? this.owner.uid : undefined,
      cc: this.cc.map(cc => cc.uid),
      labels: this.labels.map(label => label.id),
      linked: [],
      custom: [],
      comments: [],
      attachments: [],
    };
    this.props.onSave(input).then(() => {
      this.busy = false;
      this.reset();
      if (!this.another) {
        //
      }
    // }, (error: RequestError) => {
    //   switch (error.code) {
    //     case RequestErrorCode.INTERNAL:
    //       toast.error('Internal error');
    //       break;
    //     case RequestErrorCode.UNKNOWN:
    //       toast.error('Unknown error');
    //       break;
    //     case RequestErrorCode.SCHEMA_VALIDATION:
    //       toast.error('Schema validation failure');
    //       for (const detail of error.details as any[]) {
    //         if (detail.keyword === 'additionalProperties') {
    //           console.error('Disallowed additional property:', detail.params.additionalProperty);
    //         } else {
    //           console.error(detail);
    //         }
    //       }
    //       break;
    //     default:
    //       toast.error(error.code);
    //       break;
      // }
      // this.busy = false;
    });
  }

  @action.bound
  private reset() {
    this.resetType();
    this.summary = '';
    this.description = '';
    this.owner = null;
    this.cc.replace([]);
    this.labels.replace([]);
    // this.public = false;
  }

  @action.bound
  private resetType() {
    // If no type selected, choose the first available.
    if (!this.type && this.template && this.template.types) {
      const defaultType = this.template.types.find(t => !t.abstract);
      if (defaultType) {
        this.type = defaultType.id;
      } else {
        this.type = '';
        this.issueState = '';
      }
    }
    if (this.type && !this.issueState) {
      const workflow = this.workflow;
      if (workflow) {
        this.issueState =
          (workflow.start && workflow.start[0]) ||
          (workflow.states && workflow.states[0]) || '';
      } else {
        this.issueState = '';
      }
    }
  }

  get template(): Template {
    return this.props.project.template;
  }

  @computed
  get issueType(): IssueType {
    const { project } = this.props;
    return project.template && project.template.getInheritedIssueType(this.type);
  }

  @computed
  get workflow(): Workflow {
    const { project } = this.props;
    const iType = this.issueType;
    if (project.template && iType && iType.workflow) {
      return project.template.getWorkflow(iType.workflow);
    }
    return null;
  }
}
