// packages
const server = require('http').Server;
const {readable} = require('is-stream');
const isPortAvailable = require('./check-port');

const createError = (code, message, original) => {
	let err = new Error(message);
	err.statusCode = code;
	err.originalError = original;
	return err;
};

const getObjectType = obj => {
    if(obj == null){
        return 'null';
    } else if (Buffer.isBuffer(obj)){
        return 'buffer';
    } else if(readable(obj)){
        return 'stream';
    } else {
        return 'object';
    }
}

const send = (res, code, obj = null) => {
    res.statusCode = code;
    let objectType = getObjectType(obj);
    switch(objectType) {
        case 'null' :
            res.end();
            return;
        case 'buffer' :
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Length', obj.length);
		    res.end(obj);
            return;
        case 'stream' :
            res.setHeader('Content-Type', 'application/octet-stream');
            obj.pipe(res);
            return;
        case 'object' :
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            let str = obj;
            try {
                str = JSON.stringify(obj);
            } catch(err) {
                console.error(err);
            }
            res.setHeader('Content-Length', Buffer.byteLength(str));
	        res.end(str);
            return;
    }
}

const sendError = (res, err) => {
	let statusCode = err.statusCode || err.status;
	let message = statusCode ? err.message : 'Internal Server Error';
	send(res, statusCode || 500, message);
	if (err instanceof Error) {
		console.error(err.stack);
	} else {
		console.warn('thrown error must be an instance Error');
	}
};

const run = (req, res, fn) => {
    new Promise(resolve => resolve(fn(req, res)))
        .then(result => {
            if (result === null) {
                send(res, 204, null);
                return;
            }
            if(result !== undefined) {
                send(res, res.statusCode || 200, result);
            }
        })
        .catch(err => sendError(res, err));
}

const start = async (port, fn) => {
    let originalPort = port;
    while(true){
        try {
            if((await isPortAvailable(port))){
                break;
            } else {
                port++;
            }
        } catch(err) {
            console.error(err);
            process.exit();
        }
    }
    let microServer = server((req, res) => run(req, res, fn));
    microServer.listen(port, () => {
        if(port !== originalPort){
            console.log("Port " + originalPort + " already taken."); 
        }
        console.log("Server started on port " + port);
    });
}

module.exports.start = start;
module.exports.send = send;
module.exports.sendError = sendError;
module.exports.createError = createError;