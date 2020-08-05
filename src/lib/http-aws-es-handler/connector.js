'use strict';

/**
 * A connection handler for Amazon ES.
 *
 * Uses the aws-sdk to make signed requests to an Amazon ES endpoint.
 *
 * @param client {Client} - The Client that this class belongs to
 * @param config {Object} - Configuration options
 * @param [config.protocol=http:] {String} - The HTTP protocol that this connection will use, can be set to https:
 * @class HttpConnector
 */

const AWS = require('aws-sdk');
const HttpConnector = require('elasticsearch/src/lib/connectors/http');
const HttpClient = require('./src/node');

class HttpAmazonESConnector extends HttpConnector {
  constructor(host, config) {
    super(host, config);

    const protocol = host.protocol;
    const port = host.port;
    const endpoint = new AWS.Endpoint(host.host);

    if (protocol) endpoint.protocol = protocol.replace(/:?$/, ":");
    if (port) endpoint.port = port;

    this.awsConfig = config.awsConfig || AWS.config;
    this.endpoint = endpoint;
    this.httpOptions = config.httpOptions || this.awsConfig.httpOptions;
    this.httpClient = new HttpClient();
  }

  request(params, cb) {
    // our cred/endpoint/other params & vanilla callback function
      const reqParams = this.makeReqParams(params);
  
      let req;
      let cancelled;
  
      // A function to determin if we have already loaded the creds 
      const cancel = function(){
        cancelled = true;
        req && req.abort();
      };
      
      // for logging and tracing the error 
      const done = (err, response, status, headers) => {
        this.log.trace(params.method, reqParams, params.body, response, status);
        // using the callback to handle err 
        cb(err, response, status, headers);
      };
  
      // load creds
      this.getAWSCredentials()
        .catch(e => {
          if (e && e.message) e.message = `AWS Credentials error: ${e.message}`;
          throw e;
        })
        .then(creds => {
          if (cancelled) {
          // Already get the creds no need to re-do 
            return;
          }
          // Create the request 
          const request = this.createRequest(params, reqParams);
          // Sign the request (Sigv4)
          this.signRequest(request, creds);
          // general clean-up procedure to run after the request completes, has an error, or is aborted.
          req = this.httpClient.handleRequest(request, this.httpOptions, done);
        })
        .catch(done);
      // if we have finished sending request & abort this 
      return cancel;
    }

  getAWSCredentials() {
    return new Promise((resolve, reject) => {
      this.awsConfig.getCredentials((err, creds) => {
        if (err) return reject(err);
        return resolve(creds);
      });
    });
  }

  createRequest(params, reqParams) {
    const request = new AWS.HttpRequest(this.endpoint);

    // copy across params
    Object.assign(request, reqParams);

    request.region = this.awsConfig.region;
    if (!request.headers) request.headers = {};
    let body = params.body;

    if (body) {
      let contentLength = Buffer.isBuffer(body)
        ? body.length
        : Buffer.byteLength(body);
      request.headers['Content-Length'] = contentLength;
      request.body = body;
    }
    request.headers['Host'] = this.endpoint.host;

    return request;
  }

  signRequest(request, creds) {
    const signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(creds, new Date());
  }
}

module.exports = HttpAmazonESConnector;
