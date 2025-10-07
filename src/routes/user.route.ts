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

const userRouter = Router();

userRouter.get("/me", verifyToken, getMe);
userRouter.put("/me", verifyToken, updateMe);
userRouter.delete("/me", verifyToken, deleteUser);
userRouter.post("/me/addresses", verifyToken, addUserAddress);
userRouter.put("/me/addresses/:addressId", verifyToken, updateUserAddress);
userRouter.delete("/me/addresses/:addressId", verifyToken, deleteUserAddress);
userRouter.get("/admin/all", verifyToken, restrictToAdmin, getAllUsersForAdmin);
userRouter.put(
  "/:userId/admin",
  verifyToken,
  restrictToAdmin,
  updateUserByAdmin
);

export default userRouter;
