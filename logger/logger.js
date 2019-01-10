const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

const getRotateLogTransport = () =>{
    let transport = new (winston.transports.DailyRotateFile)({
        filename: path.join(this.dirName, 'log_file', this.level, this.level + '-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.simple()
        )
    });
    return transport;
}

const getConsoleTransport = () => {
    return new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple()
        )
    });
}

module.exports = class MicroLogger {
    constructor(level){
        // default level is info
        if(!level){
            level = 'info';
        }
        this.dirName = path.dirname(require.main.filename);
        this.level = level;
        this.logger = this.createLogger();
    }

    createLogger(){
        let logger = winston.createLogger({
            level : this.level
        });
        logger.add(getRotateLogTransport());
        if(process.env.NODE_ENV !== 'production'){
            logger.add(getConsoleTransport());
        }
        return logger;
    }

    log(message){
        this.logger.log(this.level, message);
    }
}