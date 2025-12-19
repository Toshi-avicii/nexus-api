import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, ZodRawShape } from 'zod'

const validateResource =
    (schema: ZodObject<ZodRawShape>) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const product = JSON.parse(req.body?.product); // only for create new product route.
                schema.parse({
                    body: product ? product : req.body,
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

export default validateResource;
