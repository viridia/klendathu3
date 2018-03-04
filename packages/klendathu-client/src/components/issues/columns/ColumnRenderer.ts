import { IssueRecord } from '../../../../../types/json';

export interface ColumnRenderer {
  renderHeader(
    sort: string,
    descending: boolean,
    onChangeSort: (column: string, descending: boolean) => void): JSX.Element;

  render(issue: IssueRecord): JSX.Element;
}
