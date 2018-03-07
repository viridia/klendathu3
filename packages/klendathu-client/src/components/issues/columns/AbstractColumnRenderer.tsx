import { Issue } from '../../../models/Issue';
import * as React from 'react';
import { ColumnSort } from '../../common/ColumnSort';
import { ColumnRenderer } from './ColumnRenderer';

export abstract class AbstractColumnRenderer implements ColumnRenderer {
  protected title: string;
  protected fieldName: string;
  protected className: string;

  constructor(title: string, fieldName: string, className: string) {
    this.title = title;
    this.fieldName = fieldName;
    this.className = className;
  }

  public renderHeader(
      sort: string,
      descending: boolean,
      onChangeSort: (column: string, descending: boolean) => void): JSX.Element {
    return (
      <th className={this.className} key={this.fieldName}>
        <ColumnSort
            column={this.fieldName}
            sortKey={sort}
            descending={descending}
            onChangeSort={onChangeSort}
        >
          {this.title}
        </ColumnSort>
      </th>
    );
  }

  public abstract render(issue: Issue): JSX.Element;
}
