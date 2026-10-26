import { Request, Response, NextFunction } from 'express';
import { IdParamDto } from '../../infrastructure/dtos/id-param.dto.js';

// Valida :id en la ruta antes de llegar al controlador (400 si no es UUID)
export function validateIdParam(req: Request, _res: Response, next: NextFunction): void {
  new IdParamDto(req.params).validateDto().then(() => next(), next);
}
