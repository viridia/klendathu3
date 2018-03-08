import * as React from 'react';
import { LabelName } from '../common/LabelName';
import { Label } from 'klendathu-json-types';
import { QueryLink } from './QueryLink';

import './LeftNav.scss';

interface Props {
  account: string;
  project: string;
  label: Label;
}

export class LabelLink extends React.Component<Props> {
  public render() {
    const { account, project, label } = this.props;
    return (
      <li className="label-item" key={label.id}>
        <QueryLink
            to={`/${account}/${project}/issues`}
            query={{ label: label.id.split('/', 3)[2] }}
        >
          <LabelName label={label.id} />
        </QueryLink>
      </li>
    );
  }
}
