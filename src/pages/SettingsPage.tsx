import React from 'react';
import UsersTable from './helperSettingsPage/UsersTable';

const SettingsPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1152px] mx-auto space-y-8">
      <UsersTable />
    </div>
  );
};

export default SettingsPage;