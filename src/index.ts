import express from 'express';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import {validateJSON} from './routes/middleware/validate-json';

import {router} from './routes/routes';

const app = express();
app.use(helmet());
app.use(json());
app.use(urlencoded({extended: true}));
app.use(cors());

app.use("/", router);
app.use("/validate-rule", router);
app.use(validateJSON);
app.listen(process.env.PORT || 9000);
