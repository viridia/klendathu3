import { Account, Role } from 'klendathu-json-types';
import { Project } from '../../../models';
import * as React from 'react';
import { Button, Checkbox, ControlLabel, FormControl } from 'react-bootstrap';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

// import { updateProject } from '../../../network/requests';

interface Props {
  account: Account;
  project: Project;
}

@observer
export class ProjectInfoEdit extends React.Component<Props> {
  @observable private description: string;
  @observable private title: string;
  @observable private isPublic = false;

  public componentWillMount() {
    this.reset(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.project !== this.props.project) {
      this.reset(nextProps);
    }
  }

  public render() {
    const { project } = this.props;
    const modified =
        project.title !== this.title ||
        project.description !== this.description ||
        project.isPublic !== this.isPublic;
    return (
      <section className="settings-tab-pane">
        <header>
          <span>project: </span>
          <span className="title">{project.uname}</span>
        </header>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="header"><ControlLabel>Title:</ControlLabel></th>
              <td>
                <FormControl
                    className="title"
                    type="text"
                    placeholder="title of the project"
                    disabled={project.role < Role.MANAGER}
                    value={this.title}
                    onChange={this.onChangeTitle}
                />
              </td>
            </tr>
            <tr>
              <th className="header"><ControlLabel>Description:</ControlLabel></th>
              <td>
                <FormControl
                    className="description"
                    type="text"
                    placeholder="description of the project"
                    disabled={project.role < Role.MANAGER}
                    value={this.description}
                    onChange={this.onChangeDescription}
                />
              </td>
            </tr>
            <tr>
              <th />
              <td>
                <Checkbox
                    checked={this.isPublic}
                    onChange={this.onChangePublic}
                    disabled={project.role < Role.MANAGER}
                >
                  Public
                </Checkbox>
              </td>
            </tr>
            {/*<tr>
              <th className="header"><ControlLabel>Owner:</ControlLabel></th>
              <td className="owner single-static">
                {project.owningUser}
              </td>
            </tr>*/}
          </tbody>
        </table>
        <footer>
          <Button
              bsStyle="primary"
              disabled={!modified || project.role < Role.MANAGER}
              onClick={this.onSave}
          >
            Save
          </Button>
        </footer>
      </section>
    );
  }

  @action.bound
  private onChangeTitle(e: any) {
    this.title = e.target.value;
  }

  @action.bound
  private onChangeDescription(e: any) {
    this.description = e.target.value;
  }

  @action.bound
  private onChangePublic(e: any) {
    this.isPublic = e.target.checked;
  }

  @action.bound
  private onSave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    // const { title, description } = this.state;
    // updateProject(this.props.project.id, { title, description, isPublic: this.state.isPublic });
  }

  private reset(props: Props) {
    const { project } = props;
    this.title = project.title;
    this.description = project.description;
    this.isPublic = project.isPublic;
  }
}
