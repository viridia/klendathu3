import { ObservableIssue } from '../../../models/Issue';

export interface ColumnRenderer {
  renderHeader(
    sort: string,
    descending: boolean,
    onChangeSort: (column: string, descending: boolean) => void): JSX.Element;

  render(issue: ObservableIssue): JSX.Element;
}
