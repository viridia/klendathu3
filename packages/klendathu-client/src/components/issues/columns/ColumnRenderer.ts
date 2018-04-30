import { Issue } from 'klendathu-json-types';

export interface ColumnRenderer {
  renderHeader(
    sort: string,
    descending: boolean,
    onChangeSort: (column: string, descending: boolean) => void): JSX.Element;

  render(issue: Issue): JSX.Element;
}
