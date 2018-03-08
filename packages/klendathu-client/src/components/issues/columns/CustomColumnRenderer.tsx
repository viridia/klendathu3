import * as classNames from 'classnames';
import { ObservableIssue } from '../../../models';
import { FieldType } from 'klendathu-json-types';
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
            descending={descending}
            onChangeSort={onChangeSort}
        >
          {this.title}
        </ColumnSort>
      </th>
    );
  }

  public render(issue: ObservableIssue) {
    if (issue.custom && this.field.id in issue.custom) {
      return <td className={this.className}>{issue.custom[this.field.id]}</td>;
    }
    return <td className="custom" key={this.field.id} />;
  }
}
