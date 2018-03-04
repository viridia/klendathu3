import * as React from 'react';
import { observer } from 'mobx-react';
import { LabelName } from '../common/LabelName';
import { ProjectQuery } from '../../models/ProjectQuery';
import { LabelListQuery } from '../../models/LabelListQuery';
import { NavLink } from 'react-router-dom';
import * as qs from 'qs';

import './LeftNav.scss';

interface Props {
  project: ProjectQuery;
}

@observer
export class LabelLinks extends React.Component<Props> {
  private query: LabelListQuery;

  public componentWillMount() {
    this.query = new LabelListQuery(this.props.project);
  }

  public componentWillUnmount() {
    this.query.release();
  }

  public render() {
    const { project } = this.props;
    if (this.query.size === 0) {
      return null;
    }
    return (
      <ul>
        {this.query.list.map(label => (
          <li className="label-item" key={label.id}>
            <NavLink
                to={{
                  pathname: `/${project.owner}/${project.id}/issues`,
                  search: `?${qs.stringify({ label: label.id })}` }}
            >
              <LabelName project={project} label={label.id} />
            </NavLink>
          </li>
        ))}
      </ul>
    );
  }
}
