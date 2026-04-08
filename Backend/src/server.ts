import express from "express";
import compileAndExecute  from "./controller/compileAndExecute.js";
import cors from 'cors';

const PORT = process.env.PORT || 3000; 
const app = express();

app.use(cors());
app.use(express.json());

app.use("/compile", compileAndExecute);

app.listen(PORT, () => {
    console.log(`DevFlow API is alive on http://localhost:${PORT}`);
});