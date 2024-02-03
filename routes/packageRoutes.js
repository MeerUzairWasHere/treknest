import { Router } from "express";
const router = Router();
import imageUploadMiddleware from "../middleware/multerMiddleware.js";
import {
  validatePackagesInput,
  validateIdParamForPackages
} from "../middleware/validationMiddleware.js";

import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication.js";


import { addNewPackage,
getAllPackages,
getSinglePackage,
updatePackage,
deletePackage } from '../controllers/packagesController.js'

// Routes for /admin
router.route("/admin")
  .get(getAllPackages)
  .post(authenticateUser, authorizePermissions("admin"), imageUploadMiddleware.single("imgUrl"),validatePackagesInput, addNewPackage);

// Routes for /admin/:id
router.route("/admin/:id")
  .get(validateIdParamForPackages,getSinglePackage)
  .patch(authenticateUser, authorizePermissions("admin"),validateIdParamForPackages,imageUploadMiddleware.single("imgUrl"), validatePackagesInput, updatePackage)
  .delete(authenticateUser, authorizePermissions("admin"),validateIdParamForPackages,deletePackage);


 export default router;