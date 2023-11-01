class APIHelper {
    static build = (success, code, message = "", payload = {}) => {
        return {
            success,
            code,
            message,
            payload
        }
    }
}

module.exports = APIHelper