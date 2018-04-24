import * as React from 'react';
import bind from 'bind-decorator';
import { Project } from '../../../../models';
import { Button  } from 'react-bootstrap';
import WorkflowDiagram from './WorkflowDiagram';
import { WorkflowList } from './WorkflowList';

import './workflow.scss';

// WorkflowEdit.propTypes = {
  // workflow: React.PropTypes.shape({
  //   name: React.PropTypes.string,
  //   project: React.PropTypes.string,
  // }),
  // name: React.PropTypes.string,
  // project: React.PropTypes.shape({
  //   name: React.PropTypes.string.isRequired,
  //   workflow: React.PropTypes.shape({}),
  // }).isRequired,
  // modified: React.PropTypes.bool,
  // editWorkflow: React.PropTypes.func.isRequired,
//   saveWorkflow: React.PropTypes.func.isRequired,
// };

interface Props {
  project: Project;
}

export class WorkflowEdit extends React.Component<Props> {
  private modified: boolean;

  public componentDidMount() {
    // const workflow = this.props.project.workflow;
    // if (workflow.name !== this.props.name ||
    //     this.props.workflow.project.name !== this.props.project.name) {
    //   this.props.editWorkflow(this.props.workflow);
    // }
  }

  public render() {
    const { project } = this.props;
    if (!project && !project.template.loaded) {
      return <section className="settings-tab-pane" />;
    }
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">Workflow: {project.uname}/{project.template.id}</span>
          <Button bsStyle="primary" disabled={!this.modified} onClick={this.onSave}>
            Save
          </Button>
        </header>
        <div className="workflow-columns">
          <WorkflowList states={project.template.states} />
          <WorkflowDiagram template={project.template} />
        </div>
      </section>
    );
  }

  @bind
  private onSave(e: any) {
    e.preventDefault();
    // this.props.saveWorkflow(this.props.project.name, this.props.name);
  }
}
