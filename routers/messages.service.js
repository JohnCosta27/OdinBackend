/**
 * * Service that provides all the messages needed across routes
 */

const getDbErrorMessage = (error) => {
    return {
        message: 'There was an error with the database query',
        error: error
    }
}

const getSuccessMessage = () => {
    return {
        message: 'Request successful'
    }
}

const getGeneralError = (error) => {
    return {
        message: 'An error has occured',
        error: error
    }
}

const getMissingParametersError = () => {
    return {
        message: 'Some parameters were missing from the request'
    }
}

module.exports = {
    getDbErrorMessage,
    getSuccessMessage,
    getGeneralError,
    getMissingParametersError
}