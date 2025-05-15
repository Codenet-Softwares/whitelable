-- This script creates a stored function to get the user details based on the provided user ID.
DELIMITER $$

CREATE FUNCTION getCreditRef(vAdminId varchar(255))
RETURNS varchar(255)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE creditRefValue varchar(255) DEFAULT '0';

  SELECT IFNULL(CAST(CreditRef AS CHAR), '0')
  INTO creditRefValue
  FROM CreditRefs
  WHERE UserId = vAdminId
  ORDER BY id DESC
  LIMIT 1;

  RETURN creditRefValue;
END$$

CREATE FUNCTION getPartnership(vAdminId varchar(255))
RETURNS varchar(255)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE partnershipValue varchar(255) DEFAULT '0';

  SELECT IFNULL(CAST(partnership AS CHAR), '0')
  INTO partnershipValue
  FROM Partnerships
  WHERE UserId = vAdminId
  ORDER BY id DESC
  LIMIT 1;

  RETURN partnershipValue;
END$$

DELIMITER ;

-- This script creates a stored procedure to get the user details based on the provided user ID.

DELIMITER $$
CREATE FUNCTION getExposure(vAdminId VARCHAR(255))
RETURNS FLOAT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE totalExposure FLOAT DEFAULT 0;

  WITH RECURSIVE AdminHierarchy AS (
    SELECT adminId, role
    FROM admins
    WHERE adminId = vAdminId

    UNION ALL

    SELECT a.adminId, a.role
    FROM admins a
    INNER JOIN AdminHierarchy ah ON a.createdById = ah.adminId
  )

  SELECT IFNULL(SUM(CAST(m.exposure AS FLOAT)), 0)
  INTO totalExposure
  FROM AdminHierarchy ah
  LEFT JOIN colorgame_refactor.MarketListExposuers m
    ON ah.adminId = m.userId
  WHERE LOWER(ah.role) = 'user';

  RETURN totalExposure;
END$$
DELIMITER ;

-- This script creates a stored procedure to get the user details based on the provided user ID.

DELIMITER $$

CREATE FUNCTION `getAdminBalance`(vAdminId VARCHAR(50))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE creditReceived INT DEFAULT 0;
    DECLARE withdrawalReceived INT DEFAULT 0;
    DECLARE creditSent INT DEFAULT 0;
    DECLARE withdrawalSent INT DEFAULT 0;
    DECLARE selfCredit INT DEFAULT 0;
    DECLARE finalBalance INT DEFAULT 0;

    -- Transactions where admin is receiver
    SELECT COALESCE(SUM(amount), 0) INTO creditReceived
    FROM transactions
    WHERE receiver_adminId = vAdminId AND transactionType = 'credit';

    SELECT COALESCE(SUM(amount), 0) INTO withdrawalReceived
    FROM transactions
    WHERE receiver_adminId = vAdminId AND transactionType = 'withdrawal';

    -- Transactions where admin is sender
    SELECT COALESCE(SUM(amount), 0) INTO creditSent
    FROM transactions
    WHERE adminId = vAdminId AND transactionType = 'credit';

    SELECT COALESCE(SUM(amount), 0) INTO withdrawalSent
    FROM transactions
    WHERE adminId = vAdminId AND transactionType = 'withdrawal';

    SELECT COALESCE(SUM(amount), 0) INTO selfCredit
    FROM transactions
    WHERE adminId = vAdminId AND transactionType = 'self_credit';

    -- Final balance calculation 
    SET finalBalance = (
        creditReceived - withdrawalReceived     
        - creditSent + withdrawalSent + selfCredit 
    );

    RETURN finalBalance;
END$$

DELIMITER ;

-- This script creates a stored procedure to get the user details based on the provided user ID.

DELIMITER $$

CREATE FUNCTION getLoadBalance(vAdminId VARCHAR(255))
RETURNS FLOAT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE exposureSum FLOAT DEFAULT 0;
  DECLARE adminBalance FLOAT DEFAULT 0;
  DECLARE totalBalance FLOAT DEFAULT 0;

  -- Recursive CTE to get all admins under the hierarchy
  WITH RECURSIVE AdminHierarchy AS (
    SELECT adminId, role
    FROM admins
    WHERE adminId = vAdminId

    UNION ALL

    SELECT a.adminId, a.role
    FROM admins a
    INNER JOIN AdminHierarchy ah ON a.createdById = ah.adminId
  )

  -- Sum exposures of all users under this admin hierarchy
  SELECT IFNULL(SUM(CAST(m.exposure AS FLOAT)), 0)
  INTO exposureSum
  FROM AdminHierarchy ah
  LEFT JOIN colorgame_refactor.MarketListExposuers m
    ON ah.adminId = m.userId
  WHERE LOWER(ah.role) = 'user';

  -- Get admin's balance
  SET adminBalance = getAdminBalance(vAdminId);

  -- Total Load Balance = admin balance + exposure of all users in tree
  SET totalBalance = adminBalance + exposureSum;

  RETURN totalBalance;
END$$

DELIMITER ;


-- This script creates a stored procedure to get the user details based on the provided user ID.

use whiteLabel_refactor;
DROP PROCEDURE IF EXISTS getAllAdminData;
DELIMITER $$

CREATE PROCEDURE getAllAdminData (
	IN vUserName VARCHAR(100),
    IN vCreatedById VARCHAR(100),
    IN pageSize INT,
    IN pageNumber INT
)
BEGIN
    DECLARE offsetValue INT;
    SET offsetValue = (pageNumber - 1) * pageSize;

    SELECT *,
        (
            SELECT IFNULL(CAST(CreditRef AS CHAR), '0')
            FROM CreditRefs
            WHERE UserId = adminId
            ORDER BY id DESC
            LIMIT 1
        ) AS creditRefs,
        (
            SELECT IFNULL(CAST(partnership AS CHAR), '0')
            FROM Partnerships
            WHERE UserId = adminId
            ORDER BY id DESC
            LIMIT 1
        ) AS partnerships,
        getExposure(adminId) AS exposure,
        getAdminBalance(adminId) AS balance,
        getLoadBalance(adminId) AS loadBalance
    FROM admins 
    WHERE (vCreatedById IS NULL OR createdById = vCreatedById)
      AND userName LIKE CONCAT('%', vUserName, '%')
    LIMIT offsetValue, pageSize;
END $$

DELIMITER ;

