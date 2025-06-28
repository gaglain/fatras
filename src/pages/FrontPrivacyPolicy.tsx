
import React from 'react';
import { FrontLegalEditor } from '@/components/FrontLegalEditor';
import { useUser } from '@/contexts/UserContext';

export const FrontPrivacyPolicy: React.FC = () => {
  const { currentUser, getUserPermissions } = useUser();
  const permissions = getUserPermissions(currentUser);
  const canEdit = permissions.canManageWebsite;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <FrontLegalEditor
        type="privacyPolicy"
        title="Politique de Confidentialité"
        canEdit={canEdit}
      />
    </div>
  );
};
