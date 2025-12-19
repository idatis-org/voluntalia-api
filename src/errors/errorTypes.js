/**
 * Extends class to manage errors in the different services
 * 
 * * ConflictError      - Return error message and status 409
 * * CredentialError    - Return error message and status 401
 * * NotFoundError      - Return error message and status 404
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

class BadRequestError extends Error {
    constructor(message = 'Bad Request') {
        super(message);
        this.status = 400;
    }
}

class ForbiddenError extends Error {
    constructor(message = 'Forbidden') {
        super(message);
        this.status = 403;
    }
}
module.exports = { ConflictError, CredentialError, NotFoundError, BadRequestError, ForbiddenError };
