USE whiteLabel_refactor;

DELIMITER $$

CREATE TRIGGER insertPermissions
AFTER INSERT ON Permissions
FOR EACH ROW
BEGIN
  INSERT INTO whiteLabel_refactor_archive.Permissions (
	  id,
	  UserId,
	  permission
  )
  VALUES (
		NEW.id,
		NEW.UserId,
		NEW.permission
  );
END$$

DELIMITER ;
