USE whiteLabel_refactor;
DELIMITER $$

CREATE TRIGGER deleteAdmin
AFTER UPDATE ON admins
FOR EACH ROW
BEGIN
  -- Handle isDeleted change
  IF NEW.isDeleted = TRUE AND OLD.isDeleted = FALSE THEN
    UPDATE whiteLabel_refactor_archive.admins
    SET isDeleted = TRUE
    WHERE adminId = OLD.adminId;
  END IF;

  -- Handle isPermanentDeleted change
  IF NEW.isPermanentDeleted = TRUE AND OLD.isPermanentDeleted = FALSE THEN
    UPDATE whiteLabel_refactor_archive.admins
    SET isPermanentDeleted = TRUE
    WHERE adminId = OLD.adminId;
  END IF;
END$$

DELIMITER ;