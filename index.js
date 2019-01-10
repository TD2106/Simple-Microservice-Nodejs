const microServer = require('./server/server');
const MicroRouter = require('./router/router');

let router = new MicroRouter();
router.get('/', () => {
    console.log("Middleware");
},() => {
    return "Hello router";
})
microServer.start(8080, (req, res) => router.handle(req, res));
