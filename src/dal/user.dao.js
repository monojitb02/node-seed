const _ = require('lodash');
const mongoose = require('mongoose');
const { isValidEmail, isValidPhoneNumber } = require('../util/validator');
const userSchema = require('./user.schema');
class UserDAO {
    constructor() {
        this.model = mongoose.model('user', userSchema);
    }
    async getAll() {
        return await this.model.find({});
    }
    async findById(id) {
        const user = await this.model.findById(id);
        return user.toJSON();
    }
    async register(role, { email, countryCode, phone }, secrets) {
        const userIdentity = email || `${countryCode}-${phone}`;
        const identityQuery = this.getUserIdentityFilter(userIdentity);
        const user = await this.model.findOne(identityQuery);
        let userId;
        if (user) {
            user.secrets = secrets;
            await user.save();
            userId = user.id;
        } else {
            const newUser = await this.model({
                role,
                identity: {
                    email,
                    countryCode,
                    phone,
                },
                isActive: true,
                secrets,
            }).save();
            userId = newUser.id;
        }
        return userId;
    }
    async updateProfile(userId, profile) {
        const values = {
            profile: _.pick(profile, [
                'name', 'address', 'employeeId', 'image', 'dob'
            ])
        };
        if (!await this.model.findById(userId)) {
            return false;
        }
        await this.model.updateOne(
            { _id: userId }, {
            $set: values
        });
        return true;
    }
    getUserIdentityFilter(userIdentity) {
        const filter = {};
        const userIdentityString = String(userIdentity).trim();
        if (isValidPhoneNumber(userIdentityString)) {
            const [countryCode, phone] = userIdentityString.split('-');
            filter['identity.phone'] = phone;
            filter['identity.countryCode'] = countryCode;
        } else if (isValidEmail(userIdentityString)) {
            filter['identity.email'] = userIdentityString;
        } else {
            return;
        }
        return filter;
    }
    async getUserSecretsByIdentity(userIdentity) {
        const identityQuery = this.getUserIdentityFilter(userIdentity);
        if (!identityQuery) {
            return;
        }
        return await this.model.findOne(identityQuery, {
            secrets: 1,
            isActive: 1,
        });
    }
    async getUserSecretsByID(userId) {
        return await this.model.findById(userId, {
            secrets: 1,
            isActive: 1,
        });
    }
}
module.exports = new UserDAO();
