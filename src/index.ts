import express from "express";
import apiRoutes from "./routes/api";
import { config } from "./config";
import "dotenv/config";

const app = express();
app.use(express.json());

app.use("/api", apiRoutes);

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
