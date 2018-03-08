import * as React from 'react';
import { Account, Role } from 'klendathu-json-types';
import { ObservableIssue, issues, Project, ProjectPrefs } from '../../models';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { ColumnRenderer } from './columns';
import { Checkbox } from 'react-bootstrap';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import * as classNames from 'classnames';

interface Props extends RouteComponentProps<{}> {
  account: Account;
  project: Project;
  prefs: ProjectPrefs;
  issueId: string;
  columnRenderers: Map<string, ColumnRenderer>;
  selection: Map<string, boolean>;
}

@observer
export class IssueListEntry extends React.Component<Props> {
  private issue: ObservableIssue;

  public componentWillMount() {
    const { issueId } = this.props;
    this.issue = issues.get(issueId);
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.issue.release();
  }

  public render() {
    if (!this.issue.loaded) {
      return null;
    }
    const { account, project, prefs, columnRenderers, selection } = this.props;
    const linkTarget = {
      pathname: `/${account.uname}/${project.uname}/issues/${this.issue.id}`,
      state: { back: this.props.location },
    };
    const issueId = `issue-${this.issue.uid}`;
    const style: any = {};
    const level = 0;
    if (level > 0) {
      style.marginLeft = `${level * 32}px`;
    }
    return (
      <tr>
        {project.role >= Role.UPDATER && (<td className="selected">
          <label htmlFor={issueId}>
            <Checkbox
                id={issueId}
                bsClass="cbox"
                data-id={this.issue.uid}
                checked={selection.has(this.issue.uid)}
                onChange={this.onChangeSelection}
            />
          </label>
        </td>)}
        <td className="id">
          <NavLink to={linkTarget}>{this.issue.id}</NavLink>
        </td>
        {prefs.columns.map(cname => {
          const cr = columnRenderers.get(cname);
          if (cr) {
            return cr.render(this.issue);
          }
          return <td className="custom" key={cname} />;
        })}
        <td className="title">
          <NavLink to={linkTarget} className={classNames({ child: level > 0 })} style={style}>
            <span className="summary">{this.issue.summary}</span>
          </NavLink>
        </td>
      </tr>
    );
    // TODO:
    // {issue.labels
    //   .filter(l => labels.has(l))
    //   .map(l => <LabelName project={project.id} label={l} key={l} />)}
  }

  @action.bound
  private onChangeSelection(e: any) {
    const { selection } = this.props;
    if (e.target.checked) {
      selection.set(this.issue.uid, true);
    } else {
      selection.delete(this.issue.uid);
    }
  }
}
