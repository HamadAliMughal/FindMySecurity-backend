import { default as RecoverPassword } from './recoverPassword'
import confirmRecoveryPassword from './confirmRecoveryPassword'
import inviteCollaborator from './inviteCollaborator'
import approveMemory from './approveMemory'
import roleChange from './roleChange'

const templates: any =
{
  'RecoverEmail': RecoverPassword,
  "ConfirmRecoverEmail": confirmRecoveryPassword,
  'InviteCollaborator': inviteCollaborator,
  'ApproveMemory': approveMemory,
  'RoleChange': roleChange
}

export default templates