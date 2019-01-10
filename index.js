const microServer = require('./server/server');
const {json} = require('./utils/body-parser');

microServer.start(8080, async (req, res) => {
    let result = await json(req);
    microServer.send(res, 200, result);
});
