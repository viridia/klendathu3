import bind from 'bind-decorator';
import { Project } from 'klendathu-json-types';
import * as React from 'react';
import { Button } from 'react-bootstrap';
// import { saveProject } from '../../store/projects';

interface Props {
  project: Project;
}

export default class ProjectTemplateEdit extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    // this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {};
  }

  public render() {
    const { project } = this.props;
    // const modified = project.description !== this.state.description;
    const modified = false;
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">Issue templates for {project.name}</span>
          <Button bsStyle="primary" disabled={!modified} onClick={this.onSave}>
            Save
          </Button>
        </header>
        <section className="columns">
          <div className="Issue types" />
          <div className="Template Properties" />
        </section>
      </section>
    );
  }

  @bind
  private onSave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    console.error('save project here.');
    // this.props.updateProject(this.props.project.name, {
    //   // description: this.state.description,
    // });
    // saveProject(this.props.project.name);
  }
}
