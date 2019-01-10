const net = require('net');

const isPortAvailable = async port => {
    try {
        let isAvailable = await resolveAvailablePort(port);
        return isAvailable;
    } catch(err) {
        console.error(err);
        return false;
    }
}

const resolveAvailablePort = port => {
    return new Promise((resolve, reject) => {
        let testServer = net.createServer()
            .once('error', err => (err.code == 'EADDRINUSE' ? resolve(false) : reject(err)))
            .once('listening', () => {
                resolve(true);
                testServer.close();
            })
            .listen(port);
    })
}

module.exports = isPortAvailable;