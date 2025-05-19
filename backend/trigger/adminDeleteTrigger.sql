DELIMITER $$

CREATE TRIGGER deleteAdmin
BEFORE UPDATE ON admins
FOR EACH ROW
BEGIN
  UPDATE whiteLabel_refactor_archive.admins
  SET 
    isDeleted = OLD.isDeleted,
    isPermanentDeleted = OLD.isPermanentDeleted,
    lastLoginTime = OLD.lastLoginTime,
    loginStatus = OLD.loginStatus
  WHERE adminId = OLD.adminId;
END$$

DELIMITER ;