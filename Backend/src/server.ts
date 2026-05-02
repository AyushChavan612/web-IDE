import express from "express";
import compileAndExecute  from "./controller/compileAndExecute.js";
import cors from 'cors';
import fixErrors from "./services/fixErrors.service.js"
import opimizeCode from "./services/optimizecode.service.js"
import { aiRateLimiter, compileRateLimiter } from "./middleware/rateLimiter.middleware.js";
import "./worker/compile.worker.js";

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

app.use("/compile", compileRateLimiter , compileAndExecute);
app.use("/FixErrors" , aiRateLimiter , fixErrors);
app.use("/OptimizeCode" , aiRateLimiter , opimizeCode);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`DevFlow API is alive on http://0.0.0.0:${PORT}`);
});