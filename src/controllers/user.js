const userDAO = require('../dal/user.dao');


class User {
    // Only of Admins
    async getAllUsers(req, res) {
        const userProfiles = await userDAO.getAll();
        res.status(200).json(userProfiles);
    }
    async getProfile(req, res) {
        const user = await userDAO.findById(req.userSession.userId);
        res.status(200).json(user.profile || {});
    }
    async updateProfile(req, res) {
        const profile = req.body;
        const success = await userDAO.updateProfile(req.userSession.userId, profile);
        if (!success) {
            return res.status(404).send({
                success: false,
                message: 'Unable to update your profile'
            });
        }
        res.status(202).send({
            success: true,
            message: 'Your profile updated'
        });
    }
}
module.exports = new User();