const contentType = require('content-type');
const getRawBody = require('raw-body');
const {createError} = require('../server/server');
const rawBodyMap = new WeakMap();

const parseJSON = str => {
	try {
        console.log(str);
		return JSON.parse(str);
	} catch (err) {
        console.error(err);
		throw createError(400, 'Invalid JSON', err);
	}
};

const getRequestBody = async (req, {limit = '1mb', encoding} = {}) => {
    let type = req.headers['content-type'] || 'text/plain';
	let length = req.headers['content-length'];
    if (encoding === undefined) {
		encoding = contentType.parse(type).parameters.charset;
	}
    let body = rawBodyMap.get(req);
    if(body){
        return body;
    }
    try{
        body = await getRawBody(req, {limit, length, encoding})
        rawBodyMap.set(req, body);
        return body;
    } catch(err) {
        if (err.type === 'entity.too.large') {
            throw createError(413, `Body exceeded ${limit} limit`, err);
        } else {
            throw createError(400, 'Invalid body', err);
        }
    }
}

const json = async (req, {limit, encoding} = {}) => {
    let body = await getRequestBody(req, {limit, encoding});
    return parseJSON(body.toString(encoding));
}

module.exports.json = json;
module.exports.getRequestBody = getRequestBody;