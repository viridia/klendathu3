import * as React from 'react';
import { IssueListQuery, Project } from '../../models';
import { ProjectPrefs } from 'klendathu-json-types';
import { FilterParams } from '../filters/FilterParams';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';

// import './LabelListView.scss';

interface Props extends RouteComponentProps<{}> {
  issues: IssueListQuery;
  project: Project;
  prefs: ProjectPrefs;
}

@observer
export class DependenciesView extends React.Component<Props> {
  public render() {
    // const { project } = this.props;
    // if (error) {
    //   return <ErrorDisplay error={error} />;
    // }
    return (
      <section className="kdt content progress-view">
        <FilterParams {...this.props} />
        Deps
      </section>
    );
  }
}
