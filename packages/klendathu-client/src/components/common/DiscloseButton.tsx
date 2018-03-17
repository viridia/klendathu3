import * as React from 'react';
import * as classNames from 'classnames';
import DiscloseIcon from '../../../icons/ic_play_arrow.svg';

import './DiscloseButton.scss';

interface Props {
  onClick: (state: any) => void;
  checked?: boolean;
}

export function DiscloseButton(props: Props) {
  return (
    <button className={classNames('disclose', { checked: props.checked })} onClick={props.onClick}>
      <DiscloseIcon className="svg-icon" />
    </button>
  );
}
