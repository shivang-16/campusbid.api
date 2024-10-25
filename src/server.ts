import { app } from "./app";
import ConnectToDB from "./db/db";
import { logger } from "./utils/winstonLogger";

const port = process.env.PORT || 8000

ConnectToDB()

app.listen(port, () => logger.info(`Server is running on http://localhost:${port}`))