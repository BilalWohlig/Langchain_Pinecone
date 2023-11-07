const Role = require('../../mongooseSchema/Role')
const __constants = require('../../config/constants')

class deleteRole {
    async deleteRole(body) {
        try {
            const isRole = await Role.findOne({ _id: body.id })
            if (isRole == null || isRole.length == 0) {
                const error = {
                    type: __constants.RESPONSE_MESSAGES.NOT_FOUND,
                    err: 'Role not found'
                }
                throw error
            }
            const deleteRole = await Role.deleteOne({ _id: body.id })
            if (!deleteRole) {
                console.log("here");
                const error = {
                    type: __constants.RESPONSE_MESSAGES.FAILED,
                    err: 'Failed to delete role'
                }
                throw error
            }
            return "Role has been deleted"
        } catch (err) {
            throw err
        }
    }
}

module.exports = new deleteRole()