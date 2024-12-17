export class StringConstants {
  LOGIN = 'login';

  //others
  LOCAL_STORAGE_KEY = 'my_app_state';
  applicationJSON = { 'Content-Type': 'application/json' };

  // http methods
  GET = 'GET';
  POST = 'POST';
  PUT = 'PUT';
  DELETE = 'DELETE';

  // reducer type

  LOG_IN = 'LOG_IN';
  LOG_OUT = 'LOG_OUT';

  // roles
  superAdmin = 'superAdmin';
  whiteLabel = 'whiteLabel';
  hyperAgent = 'hyperAgent';
  superAgent = 'superAgent';
  masterAgent = 'masterAgent';
  subWhiteLabel = 'subWhiteLabel';
  subAdmin = 'subAdmin';
  subHyperAgent = 'subHyperAgent';
  subSuperAgent = 'subSuperAgent';
  subMasterAgent = 'subMasterAgent';
  createAdmin = 'createAdmin';
  user = 'user'

  // permission
  createSubAdmin = 'create-subAdmin';
  transferBalance = 'transferBalance';
  status = 'status';
  creditRefEdit = 'creditRef-Edit';
  partnershipEdit = 'partnership-Edit';
  creditRefView = 'creditRef-View';
  partnershipView = 'partnership-view';
  userProfileView = 'user-profile-view';
  profileView = 'profile-view';
  viewAdminData = 'view-admin-data';
  createAdmin = 'create-Admin';
  createUser = 'create-user';
  accountStatement = 'accountStatement';
  activityLog = 'activityLog';
  deleteAdmin = 'delete-admin';
  restoreAdmin = 'restore-admin';
  moveToTrash = 'move-to-trash';
  trashView = 'trash-view';

  roles = [
    { role: 'transferBalance', name: 'Transfer Balance' },
    { role: 'status', name: 'Status' },
    { role: 'creditRef-Edit', name: 'CreditRef Edit' },
    { role: 'partnership-Edit', name: 'Partnership Edit' },
    { role: 'partnership-view', name: 'Partnership view' },
    { role: 'user-profile-view', name: 'User Profile View' },
    { role: 'create-Admin', name: 'Create Admin' },
    { role: 'create-user', name: 'Create User' },
    { role: 'accountStatement', name: 'Account Statement' },
    { role: 'activityLog', name: 'Activity Log' },
    { role: 'Delete-Admin', name: 'Delete-Admin' },
    { role: 'restore-admin', name: 'Restore-Admin' },
    { role: 'move-to-trash', name: 'Move To Trash' },
    { role: 'trash-view', name: 'Trash-View' },
  ];
  // roles = [
  //   'transferBalance',
  //   'status',
  //   'creditRef-Edit',
  //   'partnership-Edit',
  //   'creditRef-View',
  //   'partnership-view',
  //   'user-profile-view',
  //   'profile-view',
  //   'create-Admin',
  //   'create-user',
  //   'accountStatement',
  //   'activityLog',
  //   'delete-admin',
  //   'restore-admin',
  //   'move-to-trash',
  //   'trash-view',
  // ];
}

let strings = new StringConstants();
export default strings;
