const Role = require('../../mongooseSchema/Role')
const __constants = require('../../config/constants')

class update {
    async updateRole(body) {
        try {
            const isRole = await Role.findOne({ _id: body.id })
            if (isRole == null || isRole.length == 0) {
                const error = {
                    type: __constants.RESPONSE_MESSAGES.NOT_FOUND,
                    err: 'Role not found'
                }
                throw error
            }
            const updatedRole = await Role.updateOne({ _id: body.id }, { $set: { role: body.role } })
            if (!updatedRole) {
                const error = {
                    type: __constants.RESPONSE_MESSAGES.FAILED,
                    err: 'Failed to update role'
                }
                throw error
            }
            return "Role has been updated"
        } catch (err) {
            throw err
        }
    }
}

module.exports = new update()