USE whiteLabel_refactor;

DELIMITER $$

CREATE TRIGGER insertAdmin
AFTER INSERT ON admins
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
    updatedAt
  )
  VALUES (
    NEW.id,
    NEW.adminId,
    NEW.userName,
    NEW.userId,
    NEW.walletId,
    NEW.password,
    NEW.role,
    NEW.lastLoginTime,
    NEW.ip,
    NEW.country,
    NEW.region,
    NEW.timezone,
    NEW.createdById,
    NEW.createdByUser,
    NEW.isActive,
    NEW.locked,
    NEW.hyperActive,
    NEW.masterActive,
    NEW.superActive,
    NEW.whiteActive,
    NEW.subHyperActive,
    NEW.subAdminActive,
    NEW.subMasterActive,
    NEW.subSuperActive,
    NEW.subWhiteActive,
    NEW.checkActive,
    NEW.userActive,
    NEW.loginStatus,
    NEW.exposure,
    NEW.isReset,
    NEW.token,
    NEW.createdAt,
    NEW.updatedAt
  );
END$$

DELIMITER ;
