import * as classNames from 'classnames';
import { IssueRecord, FieldType } from '../../../../../types/json';
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

  public render(issue: IssueRecord) {
    if (issue.custom) {
      for (const customField of issue.custom) {
        if (customField.name === this.field.id) {
          return (
            <td
                className={this.className}
                key={`custom.${this.field.id}`}
            >
              {customField.value}
            </td>);
        }
      }
    }
    return <td className="custom" key={this.field.id} />;
  }
}
