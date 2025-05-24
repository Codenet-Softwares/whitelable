USE whiteLabel_refactor;

DELIMITER $$

CREATE TRIGGER insertCreditRefs
AFTER INSERT ON CreditRefs
FOR EACH ROW
BEGIN
  INSERT INTO whiteLabel_refactor_archive.CreditRefs (
	  id,
	  UserId,
	  CreditRef
  )
  VALUES (
		NEW.id,
		NEW.UserId,
		NEW.CreditRef
  );
END$$

DELIMITER ;
