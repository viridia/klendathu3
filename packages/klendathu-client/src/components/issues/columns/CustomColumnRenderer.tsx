import * as classNames from 'classnames';
import { FieldType, Issue } from 'klendathu-json-types';
import * as React from 'react';
import { ColumnSort } from '../../common/ColumnSort';
import { ColumnRenderer } from './ColumnRenderer';

export class CustomColumnRenderer implements ColumnRenderer {
  protected title: string;
  protected field: FieldType;
  protected className: string;

  constructor(field: FieldType) {
    this.field = field;
    this.title = this.field.caption;
    this.className = classNames(
      'custom pad', {
        center: field.align === 'center',
        right: field.align === 'right',
      });
  }

  public renderHeader(
      sort: string,
      descending: boolean,
      onChangeSort: (column: string, descending: boolean) => void) {
    return (
      <th className={this.className} key={this.field.id}>
        <ColumnSort
            column={`custom.${this.field.id}`}
            sortKey={sort}
            className="sort"
            descending={descending}
            onChangeSort={onChangeSort}
        >
          {this.title}
        </ColumnSort>
      </th>
    );
  }

  public renderGroupHeader(value: any): JSX.Element {
    return (
      <header className="group-header">
        <span className="title">{this.title}: </span>
        <span className="value">{value}</span>
      </header>
    );
  }

  public render(issue: Issue) {
    if (issue.custom && this.field.id in issue.custom) {
      return <td key={this.field.id} className={this.className}>{issue.custom[this.field.id]}</td>;
    }
    return <td className="custom" key={this.field.id} />;
  }
}
