/**
 * Extends class to manage errors in the different services
 *
 * * ConflictError      - Return error message and status 409
 * * CredentialError    - Return error message and status 401
 * * NotFoundError      - Return error message and status 404
 * * ForbiddenError      - Return error message and status 403
 */
class ConflictError extends Error {
    constructor(message = 'Conflict') {
        super(message);
        this.status = 409;
    }
}

class CredentialError extends Error {
    constructor(message = 'Credential'){
        super(message);
        this.status = 401
    }
}

class NotFoundError extends Error {
    constructor(message = 'NotFound'){
        super(message);
        this.status = 404
    }
}

class ForbiddenError extends Error {
    constructor(message = 'Forbidden'){
        super(message);
        this.status = 403
    }
}
module.exports = { ConflictError, CredentialError, NotFoundError, ForbiddenError };
