const RadixRouter = require('radix-router');
const {createError} = require('../server/server');

const optionsHelper = (path, method, ...fns) => {
    return {
        path,
        method,
        functionsMapper : {
            [method.toUpperCase()] : fns
        }
    }
}

module.exports = class MicroRouter {
    constructor(){
        this.router = new RadixRouter();
    }

    insertPath(options){
        let existingRoute = this.router.lookup(options.path);
        if(existingRoute === null) {
            this.router.insert({
                path : options.path , 
                functionsMapper : options.functionsMapper
            });
        } else {
            let method = options.method.toUpperCase();
            if(method in existingRoute.functionsMapper){
                existingRoute.functionsMapper[method] = existingRoute.functionsMapper[method].concat(options.functionsMapper[method]);
            } else {
                existingRoute.functionsMapper[method] = options.functionsMapper[method];
            }
        }
    }

    get(path, ...fns) {
        return this.insertPath(optionsHelper(path, 'GET', ...fns));
    }

    post(path, ...fns) {
        return this.insertPath(optionsHelper(path, 'POST', ...fns));
    }

    put(path, ...fns) {
        return this.insertPath(optionsHelper(path, 'PUT', ...fns));
    }

    delete(path, ...fns) {
        return this.insertPath(optionsHelper(path, 'DELETE', ...fns));
    }

    options(path, ...fns) {
        return this.insertPath(optionsHelper(path, 'OPTIONS', ...fns));
    }

    trace(path, ...fns) {
        return this.insertPath(optionsHelper(path, 'TRACE', ...fns));
    }

    patch(path, ...fns) {
        return this.insertPath(optionsHelper(path, 'PATCH', ...fns));
    }

    async handle(req, res){
        let route = this.router.lookup(req.url);
        let method = req.method.toUpperCase();
        if(route && method in route.functionsMapper){
            try {
                // Set the params if we have any
                if (route.params) req.params = route.params;
                let functions = route.functionsMapper[method];
                for(let i = 0; i < functions.length; i++){
                    if(i == functions.length - 1){
                        return functions[i](req, res);
                    } else {
                        await functions[i](req, res);
                    }
                }
            } catch(err) {
                throw err;
            }
        } else {
            throw createError(404, "Link not found", null);
        }
    }
}