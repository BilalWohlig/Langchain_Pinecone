const Role = require('../../mongooseSchema/Role')
const __constants = require('../../config/constants')

class read {
    async getRole() {
        try {
            const isRole = await Role.find()
            if (!isRole) {
                const error = {
                    type: __constants.RESPONSE_MESSAGES.NOT_FOUND,
                    err: 'Role not found'
                  }
                throw error
            }
            return isRole
        } catch (err) {
            throw err
        }
    }
}

module.exports = new read()