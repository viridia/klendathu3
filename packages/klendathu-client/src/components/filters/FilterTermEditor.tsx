import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { Predicate } from 'klendathu-json-types';
import { Project, OperandType, defaultOperandValue } from '../../models';
import { EditOperand } from '../massedit/EditOperand';
import { FilterTerm } from './FilterTerm';
import { descriptors, getDescriptor } from './FilterTermDescriptor';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import CloseIcon from '../../../icons/ic_close.svg';

type PredicateList = Array<[Predicate, string]>;

const STRING_PREDICATES: PredicateList = [
  [Predicate.CONTAINS, 'contains'],
  [Predicate.EQUALS, 'is exactly'],
  [Predicate.NOT_CONTAINS, 'does not contain'],
  [Predicate.NOT_EQUALS, 'is not exactly'],
  [Predicate.STARTS_WITH, 'starts with'],
  [Predicate.ENDS_WITH, 'ends with'],
  // REGEX: 'matches regex',
  // NOT_REGEX: 'does not match regex',
  // MATCH = 'MATCH',
  // NOT_MATCH = 'NOT_MATCH',
  // GREATER = 'GREATER',
  // GREATER_EQUAL = 'GREATER_EQUAL',
  // LESS = 'LESS',
  // LESS_EQUAL = 'LESS_EQUAL',
];

interface Props {
  term?: FilterTerm;
  termsUsed: Set<string>;
  index?: number;
  project: Project;
  children?: React.ReactNode;
  onChange: (index: number, term: any) => void;
  onRemove: (index: number) => void;
  // updateFilterTerm: PropTypes.func.isRequired,
}

/** Class which edits a single term of a filter expression. */
@observer
export class FilterTermEditor extends React.Component<Props> {
  public render() {
    const { index, term, termsUsed, project, children } = this.props;
    const items: React.ReactNode[] = [];
    Object.getOwnPropertyNames(descriptors).forEach(id => {
      const desc = descriptors[id];
      items.push(
        <MenuItem eventKey={id} key={id} disabled={termsUsed.has(id)}>{desc.caption}</MenuItem>);
    });
    project.template.fields.forEach(field => {
      const customId = `custom.${field.id}`;
      items.push(
        <MenuItem
            eventKey={customId}
            key={customId}
            disabled={termsUsed.has(field.id)}
        >
          {field.caption}
        </MenuItem>);
    });
    const caption = (term && term.descriptor.caption) || 'Search by...';

    return (
      <section className="filter-term">
        <DropdownButton
            bsSize="small"
            title={caption}
            id="term-field"
            onSelect={this.onSelectField}
        >
          {items}
        </DropdownButton>
        {this.renderOpSelector(term)}
        <section className="filter-value">
          {term && (
            <EditOperand
                type={term.descriptor.type}
                value={term.value}
                customField={term.descriptor.customField}
                project={project}
                template={project.template}
                onChange={this.onChangeValue}
            />)}
        </section>
        {children}
        {index !== undefined &&
          <button className="remove" onClick={this.onRemove}><CloseIcon /></button>}
      </section>
    );
  }

  private renderPredicateSelector(preds: PredicateList, defaultPred: Predicate) {
    const selected = (this.props.term && this.props.term.predicate) || defaultPred;
    const selectedInfo = preds.find(p => p[0] === selected);
    return (
      <DropdownButton
          bsSize="small"
          title={selectedInfo[1]}
          id="term-field"
          onSelect={this.onSelectPredicate}
      >
        {preds.map(([p, caption]) => <MenuItem eventKey={p} key={p}>{caption}</MenuItem>)}
      </DropdownButton>
    );
  }

  private renderOpSelector(term: FilterTerm) {
    if (!term) {
      return null;
    }
    switch (term.descriptor.type) {
      case OperandType.SEARCH_TEXT:
        return this.renderPredicateSelector(STRING_PREDICATES, Predicate.CONTAINS);
      default:
        return null;
    }
  }

  @action.bound
  private onSelectField(fieldId: any) {
    const { index, term, project } = this.props;
    const descriptor = getDescriptor(project, fieldId);
    if (!descriptor) {
      throw new Error(`Invalid field id: ${fieldId}`);
    }
    if (!term || descriptor !== term.descriptor) {
      const newTerm: FilterTerm = {
        fieldId,
        descriptor,
        value: defaultOperandValue(project.template, descriptor.type, descriptor.customField),
        predicate: null,
      };
      this.props.onChange(index, newTerm);
    } else {
      this.props.onChange(index, { ...term, fieldId, value: term.value });
    }
  }

  @action.bound
  private onSelectPredicate(pred: any) {
    const { index, term } = this.props;
    this.props.onChange(index, { ...term, predicate: pred });
  }

  @action.bound
  private onChangeValue(value: any) {
    const { index, term } = this.props;
    this.props.onChange(index, { ...term, value });
  }

  @action.bound
  private onRemove(e: any) {
    e.preventDefault();
    this.props.onRemove(this.props.index);
  }
}
