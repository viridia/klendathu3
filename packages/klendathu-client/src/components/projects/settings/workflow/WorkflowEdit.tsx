import bind from 'bind-decorator';
import { Project, Workflow } from 'common/api';
import * as React from 'react';
import { Button  } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { workflowEdit } from '../../../../store/actions';
import { saveWorkflow } from '../../../../store/reducers/workflow';
import './workflow.scss';
import WorkflowDiagram from './WorkflowDiagram';
import WorkflowList from './WorkflowList';

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

interface OwnProps {
  project: Project;
  workflow: Workflow;
}

interface StateProps {
  name: string;
  modified: boolean;
}

interface DispatchProps {
  workflowEdit: (wf: Workflow) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

class WorkflowEdit extends React.Component<Props> {
  public componentDidMount() {
    // const workflow = this.props.project.workflow;
    // if (workflow.name !== this.props.name ||
    //     this.props.workflow.project.name !== this.props.project.name) {
    //   this.props.editWorkflow(this.props.workflow);
    // }
  }

  public render() {
    const { name, project, workflow } = this.props;
    if (project) {
      return <section className="settings-tab-pane" />;
    }
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">Workflow: {project.name}/{name}</span>
          <Button bsStyle="primary" disabled={!this.props.modified} onClick={this.onSave}>
            Save
          </Button>
        </header>
        <div className="columns">
          <WorkflowList />
          <WorkflowDiagram workflow={workflow} />
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

export default connect<StateProps, DispatchProps, OwnProps>(
  state => ({
    name: state.workflow.name,
    modified: state.workflow.modified,
    // project: state.workflows.$project,
  }),
  dispatch => bindActionCreators({ workflowEdit, saveWorkflow }, dispatch),
)(WorkflowEdit);
