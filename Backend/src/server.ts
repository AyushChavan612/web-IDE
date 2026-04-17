import express from "express";
import compileAndExecute  from "./controller/compileAndExecute.js";
import cors from 'cors';
import fixErrors from "./services/fixErrors.service.js"
import opimizeCode from "./services/optimizecode.service.js"

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/compile", compileAndExecute);
app.use("/FixErrors" , fixErrors);
app.use("/OptimizeCode" , opimizeCode);

app.listen(PORT, () => {
    console.log(`DevFlow API is alive on http://localhost:${PORT}`);
});