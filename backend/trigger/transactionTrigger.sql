USE whiteLabel_refactor;

DELIMITER $$

CREATE TRIGGER insertTransaction
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
  INSERT INTO whiteLabel_refactor_archive.transactions (
	  id,
      transactionId,
	  adminId,
	  receiver_adminId,
      amount,
      userName,
      date,
      transactionType,
      transferFromUserAccount,
      transferToUserAccount,
      remarks,
      currentBalance
  )
  VALUES (
		NEW.id,
		NEW.transactionId,
		NEW.adminId,
        NEW.receiver_adminId,
        NEW.amount,
        NEW.userName,
        NEW.date,
        NEW.transactionType,
        NEW.transferFromUserAccount,
        NEW.transferToUserAccount,
        NEW.remarks,
        NEW.currentBalance
  );
END$$

DELIMITER ;

