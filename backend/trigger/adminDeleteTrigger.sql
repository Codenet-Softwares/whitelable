USE whiteLabel_refactor;

DELIMITER $$

CREATE TRIGGER deleteAdmin
BEFORE DELETE ON admins
FOR EACH ROW
BEGIN
  INSERT INTO whiteLabel_refactor_archive.admins (
    id,
    adminId,
    userName,
    userId,
    walletId,
    password,
    role,
    lastLoginTime,
    ip,
    country,
    region,
    timezone,
    createdById,
    createdByUser,
    isActive,
    locked,
    hyperActive,
    masterActive,
    superActive,
    whiteActive,
    subHyperActive,
    subAdminActive,
    subMasterActive,
    subSuperActive,
    subWhiteActive,
    checkActive,
    userActive,
    loginStatus,
    exposure,
    isReset,
    token,
    createdAt,
    updatedAt,
    isDeleted,
    isPermanentDeleted
  )
  VALUES (
    OLD.id,
    OLD.adminId,
    OLD.userName,
    OLD.userId,
    OLD.walletId,
    OLD.password,
    OLD.role,
    OLD.lastLoginTime,
    OLD.ip,
    OLD.country,
    OLD.region,
    OLD.timezone,
    OLD.createdById,
    OLD.createdByUser,
    OLD.isActive,
    OLD.locked,
    OLD.hyperActive,
    OLD.masterActive,
    OLD.superActive,
    OLD.whiteActive,
    OLD.subHyperActive,
    OLD.subAdminActive,
    OLD.subMasterActive,
    OLD.subSuperActive,
    OLD.subWhiteActive,
    OLD.checkActive,
    OLD.userActive,
    OLD.loginStatus,
    OLD.exposure,
    OLD.isReset,
    OLD.token,
    OLD.createdAt,
    OLD.updatedAt,
    OLD.isDeleted,
    OLD.isPermanentDeleted
  );
END$$

DELIMITER ;
