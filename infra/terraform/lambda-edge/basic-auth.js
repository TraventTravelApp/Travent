'use strict';

// Credentials are injected at deploy time via Terraform templatefile().
const EXPECTED_AUTH = 'Basic ${basic_auth_token}';

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const authorization = headers.authorization && headers.authorization[0].value;

  if (authorization !== EXPECTED_AUTH) {
    callback(null, {
      status: '401',
      statusDescription: 'Unauthorized',
      headers: {
        'www-authenticate': [
          {
            key: 'WWW-Authenticate',
            value: 'Basic realm="C_O1 Internal API Docs"',
          },
        ],
        'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
      },
      body: 'Authentication required.',
    });
    return;
  }

  callback(null, request);
};
