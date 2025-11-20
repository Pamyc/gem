import React from 'react';
import UsersTable from './helperSettingsPage/UsersTable';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <UsersTable />
    </div>
  );
};

export default SettingsPage;