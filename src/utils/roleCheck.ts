export const roleCheck = (roles: any[], permission: string) => {
  if (roles) {
    for (const role of roles) {
      const foundPermission = role?.role.permissions?.find((p: any) => {
        
        return p.name === permission;
      });
      if (foundPermission) {
        
        return true;
      }
    }
  }
  
  return false;
};
// roleCheck(user.roles, 'CLIENT_STORY_CREATE_CREATE');
