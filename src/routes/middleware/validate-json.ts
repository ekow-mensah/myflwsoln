import {Router, Request, Response, NextFunction} from 'express';
import StatusCodes from 'http-status-codes';
import {buildErrorResponse} from '../../utils/utils'

export const validateJSON = ((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError  && "body" in err) {
        return res.status(StatusCodes.BAD_REQUEST).json(buildErrorResponse("Invalid JSON payload passed."));
    }

    next();
});

