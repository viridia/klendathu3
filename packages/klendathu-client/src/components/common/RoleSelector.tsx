import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { roleNames } from './RoleName';
import { Role } from 'klendathu-json-types';
import { observer } from 'mobx-react';

const roles: Role[] = [
  Role.VIEWER,
  Role.REPORTER,
  Role.UPDATER,
  Role.DEVELOPER,
  Role.MANAGER,
  Role.ADMINISTRATOR,
];

interface Props {
  value: Role;
  maxRole: Role;
  disabled?: boolean;
  onChange: (role: any) => void;
}

@observer
export class RoleSelector extends React.Component<Props> {
  public render() {
    const { value, maxRole = Role.ADMINISTRATOR, disabled, onChange } = this.props;
    return (
      <DropdownButton
        id="role-selector"
        title={roleNames[value]}
        disabled={disabled}
        onSelect={onChange}
      >
        {roles.map(role => (
          <MenuItem key={role} disabled={role > maxRole} eventKey={role}>
            {roleNames[role]}
          </MenuItem>
        ))}
      </DropdownButton>
    );
  }
}
