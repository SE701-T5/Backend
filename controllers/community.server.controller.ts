import { Request, Response } from 'express';
import * as Community from '../config/db_schemas/community.schema';
import config from '../config/config.server.config';
import {
  isValidDocumentID,
  parseInteger,
  isAnyFieldValid,
  isAllFieldsValid,
} from '../lib/validate.lib';