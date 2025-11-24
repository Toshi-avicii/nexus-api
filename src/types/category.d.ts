import z from "zod";
import { categorySchema } from "../validations/category.schema";

export type CategoryInput = z.infer<typeof categorySchema>['body'];