import { Router } from "express";
import { restrictToAdmin, verifyToken } from "../middlewares/auth.middleware";
import {
  getMe,
  updateMe,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  deleteUser,
  getAllUsersForAdmin,
  updateUserByAdmin,
} from "../controllers/user.controller";
import validateResource from "../middlewares/inputValidation.middleware";
import { updateUserByAdminSchema, updateUserSchema, userAddressSchema } from "../validations/user.schema";

const userRouter = Router();

userRouter.get("/me", verifyToken, getMe);
userRouter.put("/me", verifyToken, validateResource(updateUserSchema), updateMe);
userRouter.delete("/me", verifyToken, deleteUser);
userRouter.post("/me/addresses", verifyToken, validateResource(userAddressSchema), addUserAddress);
userRouter.put("/me/addresses/:addressId", verifyToken, validateResource(userAddressSchema), updateUserAddress);
userRouter.delete("/me/addresses/:addressId", verifyToken, deleteUserAddress);
userRouter.get("/admin/all", verifyToken, restrictToAdmin, getAllUsersForAdmin);
userRouter.put(
  "/:userId/admin",
  verifyToken,
  validateResource(updateUserByAdminSchema),
  restrictToAdmin,
  updateUserByAdmin
);

export default userRouter;
