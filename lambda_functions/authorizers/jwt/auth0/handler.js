const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize JWKS client
let client;

function getJwksClient(auth0Domain) {
  if (!client) {
    client = jwksClient({
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10
    });
  }
  return client;
}

// Get signing key from JWKS
function getSigningKey(auth0Domain, kid) {
  return new Promise((resolve, reject) => {
    const client = getJwksClient(auth0Domain);
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        resolve(signingKey);
      }
    });
  });
}

// Verify JWT token
async function verifyToken(token, auth0Domain, auth0Audience) {
  return new Promise(async (resolve, reject) => {
    // Decode token to get header (without verification)
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || !decoded.header || !decoded.header.kid) {
      return reject(new Error('Invalid token structure'));
    }
    
    try {
      // Get signing key
      const signingKey = await getSigningKey(auth0Domain, decoded.header.kid);
      
      // Verify token with signing key
      jwt.verify(token, signingKey, {
        audience: auth0Audience,
        issuer: `https://${auth0Domain}/`,
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Generate IAM policy
function generatePolicy(principalId, effect, resource, payload) {
  const authResponse = {
    principalId: principalId
  };

  if (effect && resource) {
    const resourceParts = resource.split('/');
    const wildcardResource = resourceParts.slice(0, 2).join('/') + '/*/*';
    
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: wildcardResource
        }
      ]
    };
  }

  // Add context with user information
  authResponse.context = {
    userId: payload.sub || '',
    email: payload.email || '',
    scope: payload.scope || ''
  };

  return authResponse;
}

// Main handler
exports.handler = async (event, context) => {
  console.log('Authorizer event:', JSON.stringify(event));

  // Get environment variables
  const auth0Domain = process.env.AUTH0_DOMAIN;
  const auth0Audience = process.env.AUTH0_AUDIENCE;

  if (!auth0Domain || !auth0Audience) {
    console.error('ERROR: AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables must be set');
    throw new Error('Unauthorized');
  }

  // Extract token from Authorization header
  let token = event.authorizationToken || '';

  // Remove 'Bearer ' prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  }

  if (!token) {
    console.error('ERROR: No authorization token provided');
    throw new Error('Unauthorized');
  }

  try {
    // Verify the token
    const payload = await verifyToken(token, auth0Domain, auth0Audience);
    
    // Extract user ID
    const userId = payload.sub || 'user';
    
    console.log(`Successfully authenticated user: ${userId}`);
    
    // Generate and return IAM policy
    return generatePolicy(userId, 'Allow', event.methodArn, payload);
    
  } catch (error) {
    console.error('ERROR: Token validation failed:', error.message);
    throw new Error('Unauthorized');
  }
};

