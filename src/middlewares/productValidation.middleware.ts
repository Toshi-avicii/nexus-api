import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, ZodRawShape } from 'zod'

const validateProduct =
    (schema: ZodObject<ZodRawShape>) =>
        (req: Request, res: Response, next: NextFunction) => {
            const product = JSON.parse(req.body?.product); // only for create new product route.
            console.log({ body: product ? product : req.body })
            try {
                schema.parse({
                    body: product,
                    query: req.query,
                    params: req.params,
                });
                next();
            } catch (err) {
                if (err instanceof ZodError) {
                   const errors = err.issues.map(issue => ({ message: issue.message, path: issue.path.join('.') }));
                   return res.status(400).json({
                    sucess: false,
                    errors
                   })
                }
                return res.status(400).json({
                    success: false,
                    errors: (err as any).errors,
                });
            }
        };

export default validateProduct;
