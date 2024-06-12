class ApiError extends Error {
    constructor(
        statusCode,
        message = "Somethinf Went Wrong",
        stack = "",
        errors = []
    ) {
        super(message)
        this.statusCode = statusCode
        this.errors = errors
        this.success = false
        this.data = null
        this.message = message

        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}