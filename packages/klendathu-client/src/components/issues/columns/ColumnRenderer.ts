import { Issue } from 'klendathu-json-types';

export interface ColumnRenderer {
  /** Render a table column header. */
  renderHeader(
    sort: string,
    descending: boolean,
    onChangeSort: (column: string, descending: boolean) => void): JSX.Element;

  /** Render the value as a group header. */
  renderGroupHeader(value: any): JSX.Element;

  /** Render the field value as a table cell. */
  render(issue: Issue): JSX.Element;
}
