USE whiteLabel_refactor;

DELIMITER $$

CREATE TRIGGER deletePermission
AFTER DELETE ON Permissions
FOR EACH ROW
BEGIN
  DELETE FROM whiteLabel_refactor_archive.Permissions
  WHERE UserId = OLD.UserId;
END$$

DELIMITER ;