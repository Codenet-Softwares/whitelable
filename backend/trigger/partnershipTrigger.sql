USE whiteLabel_refactor;

DELIMITER $$

CREATE TRIGGER insertPartnerships
AFTER INSERT ON Partnerships
FOR EACH ROW
BEGIN
  INSERT INTO whiteLabel_refactor_archive.Partnerships (
	  id,
	  UserId,
	  partnership
  )
  VALUES (
		NEW.id,
		NEW.UserId,
		NEW.partnership
  );
END$$

DELIMITER ;
