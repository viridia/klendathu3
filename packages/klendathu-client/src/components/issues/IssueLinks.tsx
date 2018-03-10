import * as React from 'react';
import bind from 'bind-decorator';
import { Relation } from 'klendathu-json-types';
import { IssueListQuery, Project } from '../../models';
import { Button } from 'react-bootstrap';
import { IssueSummary } from './IssueSummary';
import { relationNames } from '../common/relationNames';

import './IssueLinks.scss';

import CloseIcon from '../../../icons/ic_close.svg';

interface Props {
  project: Project;
  issues: IssueListQuery;
  links: Map<string, Relation>;
  onRemoveLink?: (to: string) => void;
}

export class IssueLinks extends React.Component<Props> {
  public render() {
    const { links } = this.props;
    if (!links || links.size === 0) {
      return null;
    }
    return <ul className="issue-links">{Array.from(links.entries()).map(this.renderLink)}</ul>;
  }

  @bind
  private renderLink([to, relation]: [string, Relation]) {
    return (
      <li className="issue-link" key={to}>
        <span className="relation">{relationNames[relation]}</span>
        <IssueSummary id={to} />
        {this.props.onRemoveLink && (
          <Button className="bare light" onClick={() => this.props.onRemoveLink(to)}>
            <CloseIcon />
          </Button>)}
      </li>
    );
  }
}
