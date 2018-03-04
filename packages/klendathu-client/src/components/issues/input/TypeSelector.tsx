import bind from 'bind-decorator';
import { Template } from '../../../../../types/json';
import * as React from 'react';
import { Radio } from 'react-bootstrap';

interface Props {
  value: string;
  template: Template;
  onChange: (value: string) => void;
}

/** Selects the type of the issue. */
export class TypeSelector extends React.Component<Props> {
  public render() {
    const { template, value } = this.props;
    const concreteTypes = template.types.filter(t => !t.abstract);
    return (
      <div className="issue-type">
        {concreteTypes.map(t => {
          return (
            <Radio
              key={t.id}
              data-type={t.id}
              checked={t.id === value}
              inline={true}
              onChange={this.onChange}
            >
              {t.caption}
            </Radio>
          );
        })}
    </div>);
  }

  @bind
  private onChange(e: any) {
    this.props.onChange(e.target.dataset.type);
  }
}
