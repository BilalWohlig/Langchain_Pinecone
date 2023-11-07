const Role = require('../../mongooseSchema/Role')
const __constants = require('../../config/constants')

class create {
    async newRole(body) {
        try {
            const isRole = await Role.findOne({ role: body.role })
            if (isRole) {
                const error = {
                    type: __constants.RESPONSE_MESSAGES.ALREADY_EXISTS,
                    err: 'Role already exists'
                }
                throw error
            }
            const role = {
                role: body.role
            }
            const newRole = new Role(role)
            const response = await newRole.save()
            if (!response) {
                const error = {
                    type: __constants.RESPONSE_MESSAGES.FAILED,
                    err: 'Failed to create role'
                }
                throw error
            }
            return "Role has been created"
        } catch (err) {
            throw err
        }
    }
}

module.exports = new create()