import { config } from "dotenv";
import * as winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

export default class Logger {

    public static getLogger(service: string): winston.Logger {
        config();
        const fileLocation: string = process.env.LOG_FILE_LOCATION || "./logs/"
        const today: string = new Date().toISOString().slice(0, 10);
        return winston.createLogger({
            defaultMeta: { service },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: "YYYY-MM-DD HH:mm:ss.SSS"
                        }),
                        winston.format.errors({ stack: true }),
                        winston.format.prettyPrint()
                    )
                }),
                new DailyRotateFile({
                    dirname: fileLocation + '/info',
                    filename: `%DATE%.log`,
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: false,
                    level: "info",
                    maxSize: "3m",
                    maxFiles: "3d",
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: "YYYY-MM-DD HH:mm:ss.SSS"
                        }),
                        winston.format.errors({ stack: true }),
                        winston.format.prettyPrint()
                    )
                }),
                new DailyRotateFile({
                    dirname: fileLocation + '/error',
                    filename: `%DATE%.log`,
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: false,
                    level: "error",
                    maxSize: "3m",
                    maxFiles: "3d",
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: "YYYY-MM-DD HH:mm:ss.SSS"
                        }),
                        winston.format.errors({ stack: true }),
                        winston.format.prettyPrint()
                    )
                })
            ]
        })
    }
}