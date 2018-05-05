import * as React from 'react';
import { Project } from '../../models';
import { ProjectPrefs } from 'klendathu-json-types';
import { observer } from 'mobx-react';

// import './LabelListView.scss';

interface Props {
  project: Project;
  prefs: ProjectPrefs;
}

@observer
export class SavedFiltersView extends React.Component<Props> {
  public render() {
    return (
      <section className="kdt content progress-view">
        <header>
          <span className="title">Saved Filters</span>
        </header>
        {this.renderFilters()}
      </section>
    );
  }

  private renderFilters() {
    const { prefs } = this.props;
    if (prefs.filters.length === 0) {
      return (
        <div className="card internal">
          <div className="empty-list">No filters defined</div>
        </div>
      );
    }
    return (
      <div className="card internal">
        <table>
          <thead>
            <tr className="heading">
              <th className="name center">#</th>
            </tr>
          </thead>
          <tbody>
            {prefs.filters.map(f => (
              <tr key={f.name}>
                <td className="name center">{f.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
