import * as React from 'react';
import {
  Account,
  CustomValues,
  DataType,
  Errors,
  Issue,
  IssueInput,
  IssueLink,
  IssueType,
  Label,
  Relation,
  Role,
  Workflow,
} from 'klendathu-json-types';
import { IssueListQuery, ObservableIssue, Project, session, Template } from '../../models';
import {
  CommentEdit,
  CustomEnumField,
  CustomSuggestField,
  IssueSelector,
  LabelSelector,
  TypeSelector,
  StateSelector,
} from './input';
import {
  Button,
  Checkbox,
  ControlLabel,
  DropdownButton,
  FormControl,
  MenuItem,
} from 'react-bootstrap';
import { AutoNavigate } from '../common/AutoNavigate';
import { UserAutocomplete } from '../common/UserAutocomplete';
import { IssueLinks } from './IssueLinks';
import { relationNames } from '../common/relationNames';
import { RequestError } from '../../network';
import { RouteComponentProps } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { action, computed, IObservableArray, observable, toJS, when } from 'mobx';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';

import './IssueCompose.scss';

const RELATIONS: Relation[] = [
  Relation.BLOCKS,
  Relation.BLOCKED_BY,
  Relation.DUPLICATE,
  Relation.HAS_PART,
  Relation.PART_OF,
  Relation.RELATED,
];

interface Props extends RouteComponentProps<{}> {
  account: Account;
  project: Project;
  issues: IssueListQuery;
  issue?: ObservableIssue;
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
  @observable private issueToLink: Issue = null;
  @observable.shallow private issueLinkMap = new Map<string, Relation>();
  @observable private custom = new Map<string, string | number | boolean>();
  @observable private comments: string[] = [];
  @observable private busy = false;
  private prevState: string = '';

  public componentWillMount() {
    if (this.props.issue) {
      this.reset();
    } else {
      this.resetType();
    }
  }

  public componentWillUpdate() {
    this.resetType();
  }

  public render() {
    const { issue, project } = this.props;
    const template = this.template;
    if (!template) {
      return null;
    }
    const canSave = !this.busy && this.type && this.issueState && this.summary;
    return (
      <section className="kdt issue-compose">
        <div className="card">
          <header>
            {issue
              ? <span>Edit Issue #{issue.index}</span>
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
                      <a className="assign-to-me action-link" onClick={this.onAssignToMe}>
                        Assign to me
                      </a>
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
                  {this.renderTemplateFields()}
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
                  {/*<tr>
                    <th className="header"><ControlLabel>Attach files:</ControlLabel></th>
                    <td>
                      <UploadAttachments
                        ref={el => { this.attachments = el; }}
                        project={project}
                      />
                    </td>
                  </tr>*/}
                  <tr>
                    <th className="header"><ControlLabel>Comments:</ControlLabel></th>
                    <td>
                      <CommentEdit
                          disabled={project.role < Role.REPORTER}
                          onAddComment={this.onAddComment}
                      />
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
            <LinkContainer to={this.backLink}>
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

  private renderTemplateFields(): JSX.Element[] {
    const result: JSX.Element[] = [];
    if (this.issueType) {
      return this.renderCustomFields(this.issueType, result);
    }
    return result;
  }

  private renderCustomFields(issueType: IssueType, result: JSX.Element[]) {
    const { project } = this.props;
    for (const field of this.issueType.fields) {
      let component = null;
      const value = this.custom.get(field.id) || field.default || '';
      switch (field.type) {
        case DataType.TEXT:
          component = (
            <CustomSuggestField
                value={String(value)}
                field={field}
                project={project}
                onChange={this.onChangeCustomField}
            />
          );
          break;
        case DataType.ENUM:
          component = (
            <CustomEnumField
                value={String(value)}
                field={field}
                onChange={this.onChangeCustomField}
            />
          );
          break;
        default:
          console.error('invalid field type:', field.type);
          break;
      }
      if (component) {
        result.push(
          <tr key={field.id}>
            <th>{field.caption}:</th>
            <td>{component}</td>
          </tr>);
      }
    }
    return result;
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
  private onAssignToMe(e: any) {
    this.owner = session.account;
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
  private onChangeIssueToLink(selection: Issue) {
    this.issueToLink =  selection;
  }

  @action.bound
  private onChangeRelation(selection: any) {
    this.relation = selection;
  }

  @action.bound
  private onChangeCustomField(id: string, value: any) {
    this.custom.set(id, value);
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
  private onAddComment(commentText: string) {
    this.comments.push(commentText);
  }

  @action.bound
  private onSubmit(e: any) {
    e.preventDefault();
    this.busy = true;
    const custom: CustomValues = {};
    for (const field of this.issueType.fields) {
      if (this.custom.has(field.id)) {
        custom[field.id] = this.custom.get(field.id);
      }
    }
    const linked: IssueLink[] = [];
    this.issueLinkMap.forEach((value, key) => {
      linked.push({ to: key, relation: value });
    });
    const input: IssueInput = {
      type: this.type,
      state: this.issueState,
      summary: this.summary,
      description: this.description,
      owner: this.owner ? this.owner.uid : undefined,
      ownerSort: this.owner ? this.owner.uname : undefined,
      cc: this.cc.map(cc => cc.uid),
      labels: this.labels.map(label => label.id),
      linked,
      custom,
      comments: toJS(this.comments),
      attachments: [],
    };
    this.props.onSave(input).then(() => {
      const { history } = this.props;
      this.busy = false;
      this.reset();
      console.log('backlink', this.another, this.backLink);
      if (!this.another) {
        history.push(this.backLink);
      }
    }, (error: RequestError) => {
      switch (error.code) {
        case Errors.INTERNAL:
          toast.error('Internal error');
          break;
        case Errors.UNKNOWN:
          toast.error('Unknown error');
          break;
        case Errors.SCHEMA:
          toast.error('Schema validation failure');
          break;
        default:
          toast.error(error.message);
          break;
      }
      this.busy = false;
    });
  }

  @action.bound
  private reset() {
    const { issue } = this.props;
    if (issue) {
      // TODO: load owner, cc, labels, links, etc.
      when('issue loaded', () => issue.loaded, () => {
        this.type = issue.type;
        this.issueState = issue.state;
        this.summary = issue.summary;
        this.description = issue.description;
        this.custom.clear();
        // this.owner = issue.owner;
        // this.cc = issue.cc;
        // this.labels.replace(issue.labels);
        for (const key of Object.getOwnPropertyNames(issue.custom)) {
          this.custom.set(key, issue.custom[key]);
        }
        // this.issueLinkMap.clear();
      });
    } else {
      this.resetType();
      this.summary = '';
      this.description = '';
      this.owner = null;
      this.cc.replace([]);
      this.labels.replace([]);
      this.custom.clear();
      this.issueLinkMap.clear();
      // this.public = false;
    }
  }

  @action.bound
  private resetType() {
    // If no type selected, choose the first available.
    when('template loaded', () => this.template && this.template.loaded, () => {
      if (!this.type) {
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
    });
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

  private get backLink(): string {
    const { account, location, issue, project } = this.props;
    return (location.state && location.state.back)
        || (issue && `/${account.uname}/${project.uname}/${issue.index}`)
        || `/${account.uname}/${project.uname}/issues`;
  }
}
