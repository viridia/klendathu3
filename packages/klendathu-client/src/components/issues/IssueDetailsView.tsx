import * as React from 'react';
import { IssueListQuery, ObservableIssue, Project } from '../../models';
import { IssueProvider } from './IssueProvider';
import { Account, CustomValues, DataType, IssueType, Role } from 'klendathu-json-types';
import { RouteComponentProps } from 'react-router-dom';
import { Button, ButtonGroup, Modal } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { AccountName } from '../common/AccountName';
import { LabelName } from '../common/LabelName';
import { RelativeDate } from '../common/RelativeDate';
import { displayErrorToast } from '../common/displayErrorToast';
import { deleteIssue } from '../../network/requests';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as marked from 'marked';

import './IssueDetailsView.scss';

import ArrowBackIcon from '../../../icons/ic_arrow_back.svg';
import ArrowForwardIcon from '../../../icons/ic_arrow_forward.svg';
import ArrowUpIcon from '../../../icons/ic_arrow_upward.svg';

// Global options for marked.
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
});

interface Props extends RouteComponentProps<{ project: string; id: string }> {
  account: Account;
  project: Project;
  issues: IssueListQuery;
  issue: ObservableIssue;
}

@observer
export class IssueDetails extends React.Component<Props> {
  @observable private showDelete = false;
  @observable private busy = false;

  public render() {
    return (
      <section className="kdt issue-details">
        <section className="card">
          {this.renderHeader()}
          {this.renderContent()}
          {this.showDelete && (
            <Modal show={true} onHide={this.onCancelDelete} dialogClassName="confirm-dialog">
              <Modal.Header closeButton={true}>
                <Modal.Title>
                  Are you sure you want to delete issue #{this.props.issue.index}?
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                This action cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={this.onCancelDelete}>Cancel</Button>
                <Button onClick={this.onConfirmDelete} disabled={this.busy} bsStyle="primary">
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </section>
      </section>
    );
  }

  private renderHeader() {
    const { location, account, project, issue } = this.props;
    const template = project.template;
    const issueType = template.types.find(t => t.id === issue.type);
    const backLink = (location.state && location.state.back) || { pathname: './issues' };
    const [prevIssue, nextIssue] = this.adjacentIssueIds(issue.id);
    return (
      <header>
        <LinkContainer to={backLink} exact={true}>
          <Button title="Back to issue list" className="issue-up">
            <ArrowUpIcon />
          </Button>
        </LinkContainer>
        <div className="issue-id">Issue #{issue.index}: </div>
        <div className="summary">{issue.summary}</div>
        <div className="stretch">
          {issueType && (
            <div className="issue-type" style={{ backgroundColor: issueType.bg }}>
              {issueType.caption}
            </div>)}
        </div>
        <ButtonGroup className="issue-actions">
          <LinkContainer
              to={{
                pathname: `/${account.uname}/${project.uname}/edit/${issue.index}`,
                state: { ...location.state, back: this.props.location },
              }}
          >
            <Button title="Edit issue" disabled={project.role < Role.UPDATER}>Edit</Button>
          </LinkContainer>
          <Button
              title="Delete issue"
              bsStyle="default"
              disabled={project.role < Role.MANAGER}
              onClick={this.onDeleteIssue}
          >
            Delete
          </Button>
        </ButtonGroup>
        <ButtonGroup className="issue-nav">
          <LinkContainer
              to={{
                ...location,
                pathname: `/${account.uname}/${project.uname}/${prevIssue}` }}
          >
            <Button title="Previous issue" disabled={prevIssue === null}>
              <ArrowBackIcon />
            </Button>
          </LinkContainer>
          <LinkContainer
              to={{
                ...location,
                pathname: `/${account.uname}/${project.uname}/${nextIssue}` }}
          >
            <Button title="Next issue" disabled={nextIssue === null}>
              <ArrowForwardIcon />
            </Button>
          </LinkContainer>
        </ButtonGroup>
      </header>
    );
  }

  private renderContent() {
    const { project, issue } = this.props;
    const template = project.template;
    const issueType = template.getInheritedIssueType(issue.type);
    const issueState = template.states.find(st => st.id === issue.state);
    return (
      <section className="content">
        <div className="left">
          {issue.loaded && (<table className="create-issue-table form-table">
            <tbody>
              <tr>
                <th className="header">State:</th>
                <td className="state">{issueState && issueState.caption}</td>
              </tr>
              {issue.summary.length > 0 && (
                <tr>
                  <th className="header">Summary:</th>
                  <td>{issue.summary}</td>
                </tr>
              )}
              {issue.description.length > 0 && (
                <tr>
                  <th className="header">Description:</th>
                  {this.renderDescription(issue.description)}
                </tr>
              )}
              <tr>
                <th className="header">Created:</th>
                <td className="changes"><RelativeDate date={issue.created} /></td>
              </tr>
              <tr>
                <th className="header">Reporter:</th>
                <td className="reporter">
                  {issue.reporter
                    ? <AccountName id={issue.reporter} full={true} />
                    : <span className="unassigned">unassigned</span>}
                </td>
              </tr>
              <tr>
                <th className="header">Owner:</th>
                <td>
                  {issue.owner
                    ? <AccountName id={issue.owner} full={true} />
                    : <span className="unassigned">unassigned</span>}
                </td>
              </tr>
              {issue.cc.length > 0 && (
                <tr>
                  <th className="header">CC:</th>
                  <td>{issue.cc.map(cc => <AccountName id={cc} key={cc} full={true} />)}
                  </td>
                </tr>
              )}
              {this.renderTemplateFields(issueType, issue.custom)}
              {issue.labels.length > 0 && (
                <tr>
                  <th className="header labels">Labels:</th>
                  <td>
                    {issue.labels.map(label =>
                      <LabelName label={label} key={label} />)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>)}
        </div>
      </section>
    );
  }

  private renderDescription(description: string) {
    return <td className="descr" dangerouslySetInnerHTML={{ __html: marked(description) }} />;
  }

  private adjacentIssueIds(id: string): [string, string] {
    const list = this.props.issues.asList;
    const index = list.indexOf(id);
    if (index < 0) {
      return [null, null];
    }
    return [
      index > 0 ? this.idToIndex(list[index - 1]) : null,
      index < list.length - 1 ? this.idToIndex(list[index + 1]) : null,
    ];
  }

  private idToIndex(id: string): string {
    return id.split('/')[2];
  }

  private renderTemplateFields(issueType: IssueType, custom: CustomValues) {
    const result = [];
    if (issueType) {
      for (const field of issueType.fields) {
        const value = custom[field.id];
        if (value) {
          switch (field.type) {
            case DataType.TEXT:
              result.push(
                <tr key={field.id}>
                  <th>{field.caption}:</th>
                  <td>{value}</td>
                </tr>);
              break;
            case DataType.ENUM:
              result.push(
                <tr key={field.id}>
                  <th>{field.caption}:</th>
                  <td>{value}</td>
                </tr>);
              break;
            default:
              console.error('invalid field type:', field.type);
              break;
          }
        }
      }
    }
    return result;
  }

  @action.bound
  private onDeleteIssue() {
    this.showDelete = true;
    this.busy = false;
  }

  @action.bound
  private onConfirmDelete() {
    const { account, location, history, project, issue } = this.props;
    this.busy = true;
    return deleteIssue(issue.id).then(() => {
      const [prevIssue, nextIssue] = this.adjacentIssueIds(issue.id);
      this.showDelete = false;
      this.busy = false;
      if (prevIssue) {
        history.replace({
          ...location,
          pathname: `/${account.uname}/${project.uname}/${prevIssue}`,
        });
      } else if (nextIssue) {
        history.replace({
          ...location,
          pathname: `/${account.uname}/${project.uname}/issues/${nextIssue}`,
        });
      } else if (location.state && location.state.back) {
        history.replace(location.state.back);
      } else {
        history.replace({
          ...location,
          pathname: `/${account.uname}/${project.uname}/issues`,
        });
      }
    }, displayErrorToast);
  }

  @action.bound
  private onCancelDelete() {
    this.showDelete = false;
    this.busy = false;
  }
}

export interface IssueProviderProps extends RouteComponentProps<{ project: string, id: string }> {
  account: Account;
  project: Project;
  issues: IssueListQuery;
}

export const IssueDetailsView = (props: IssueProviderProps) => {
  return (
    <IssueProvider {...props}>
      {issue => <IssueDetails {...props} issue={issue} />}
    </IssueProvider>
  );
};
