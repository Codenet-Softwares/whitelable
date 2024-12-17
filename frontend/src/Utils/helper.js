export const customErrorHandler = (error) => {
    let errorMessage = ''
    if (error?.response?.data?.message) {
        errorMessage = error?.response?.data?.message
    } else if (error?.response?.data?.errMessage) {
        errorMessage = error?.response?.data?.errMessage
    } else {
        errorMessage = "something went wrong"
    }
    return errorMessage
}