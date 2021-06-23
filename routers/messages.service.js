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

module.exports = {
    getDbErrorMessage,
    getSuccessMessage
}