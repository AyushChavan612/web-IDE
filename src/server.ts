import express from "express";
import compileAndExecute  from "./controller/compileAndExecute.js";

const PORT = process.env.PORT || 3000; 
const app = express();

app.use(express.json());

app.use("/compile", compileAndExecute);

app.listen(PORT, () => {
    console.log(`DevFlow API is alive on http://localhost:${PORT}`);
});