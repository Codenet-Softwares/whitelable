import admins from "../models/admin.model.js";
import { apiResponseErr } from "./errorHandler.js";

export const findCreatorHierarchy = async (userName) => {
    let user = await admins.findOne({ where: { userName } });
  
    if (!user) {
      return res
            .status(statusCode.notFound)
            .json(apiResponseErr(null, false, statusCode.notFound, 'User Not Found'));
    }
  
    let hierarchy = [];
    let currentUser = user;
  
    while (currentUser) {
      const adminName = currentUser.roles && currentUser.roles.find(role => role.role === 'superAdmin') ? 'superAdmin' : 
                        currentUser.roles && currentUser.roles.find(role => role.role === 'whiteLabel') ? 'whiteLabel' : 
                        currentUser.roles && currentUser.roles.find(role => role.role === 'hyperAgent') ? 'hyperAgent' : 
                        currentUser.roles && currentUser.roles.find(role => role.role === 'superAgent') ? 'superAgent' : 
                        currentUser.roles && currentUser.roles.find(role => role.role === 'masterAgent') ? 'masterAgent' : 
                        'user'; 
  
      const adminId = currentUser.createdById;
  
      const adminDetails = await admins.findOne({ where: { id: adminId } });
      const adminNameFromId = adminDetails ? adminDetails.roles[0].role : ''; 
  
      hierarchy.push({
        userName: currentUser.userName,
        createdByUser: currentUser.createdByUser,
        createdById: currentUser.createdById,
        roles: currentUser.roles,
      });
  
      if (!currentUser.createdByUser || currentUser.createdById === 'superAdmin') {
        break;
      }
  
      currentUser = await admins.findOne({ where: { userName: currentUser.createdByUser } });
    }
  
    return hierarchy;
  };