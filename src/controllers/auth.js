const userDAO = require('../dal/user.dao');
const sessionStorage = require('../dal/session.storage');
const tempSessionStorage = require('../dal/tempSession.storage');
const crypt = require('../util/crypt');

class Auth {
    async signup(req, res) {
        let { countryCode, phone, role, email } = req.body
        countryCode = countryCode.trim();
        phone = phone.trim();
        const tempSession = tempSessionStorage.getNewSession();
        const tempSessionToken = await tempSession.init();
        const verificationCode = '1234';
        await tempSession.setContent({ countryCode, phone, verificationCode, role, email });
        res.status(200).json({
            tempSessionToken
        });
    }
    async verify(req, res) {
        const { tempSessionToken, verificationCode } = req.body;
        const tempSessionData = await tempSessionStorage.getSession(tempSessionToken);
        if (!tempSessionData || tempSessionData.verificationCode != verificationCode) {
            return res.status(401).json({ message: 'Verification failed' });
        }
        const { countryCode, phone, role, email } = tempSessionData;
        const {
            secret: secretToken,
            salt: secretTokenSalt,
            hash: secretTokenHash
        } = await crypt.getSafeRandomKeyPairs();
        const secrets = { secretTokenHash, secretTokenSalt, hash: null, salt: null };
        const userId = await userDAO.register(role, { countryCode, phone, email }, secrets);
        const userSession = sessionStorage.getNewSession();
        const sessionToken = await userSession.init();
        const userIdentity = `${countryCode}-${phone}`;
        await userSession.setContent({ userId, userIdentity, phone, countryCode });
        await tempSessionStorage.destroy(tempSessionToken);
        res.status(200).json({
            sessionToken,
            secretToken,
            message: 'Verification success',
        });
    }
    async logout(req, res) {
        await sessionStorage.destroy(req.userSession.sessionToken);
        res.status(200).json({
            success: true,
            message: 'logout success',
        });
    }
    async authenticate(req, res) {
        let { userIdentity, password } = req.body;
        const authHeader = req.headers.authorization;
        if (!userIdentity && !password &&
            (!authHeader || !authHeader.startsWith('Basic '))) {
            return res.status(401).send();
        }
        const base64SessionToken = String(authHeader).trim().substr(6);
        try {
            const sessionToken = Buffer.from(base64SessionToken, 'base64').toString();
            const splits = sessionToken.split(':');
            if (splits.length === 2) {
                userIdentity = splits[0];
                password = splits[1];
            }
        } catch (e) {
            console.log('malformed authorization header', authHeader);
            return res.status(401).send();
        }
        if (!userIdentity || !password) {
            return res.status(401).send();
        }
        const userSecrets = await userDAO.getUserSecretsByIdentity(userIdentity);
        if (!userSecrets) {
            return res.status(401).json({ message: 'Invalid user id' });
        }
        const { secrets: { salt, hash, secretTokenSalt, secretTokenHash }, isActive, id: userId } = userSecrets;
        if (!isActive) {
            return res.status(401).json({ message: 'User is not activated yet' });
        }

        // trick here to distinguish between password and hash
        // password should not be >17 char 
        const isPassword = password.length < 18;
        if (isPassword && (!hash || !salt)) {
            return res.status(401).json({ message: 'Password is not set yet' });
        }
        if (!isPassword && (!secretTokenSalt || !secretTokenHash)) {
            return res.status(401).json({ message: 'Not verified yet' });
        }
        const resolvedHash = await crypt.encrypt(password, isPassword ? salt : secretTokenSalt);
        if (resolvedHash !== (isPassword ? hash : secretTokenHash)) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const userSession = sessionStorage.getNewSession();
        const sessionToken = await userSession.init();
        await userSession.setContent({ userId, userIdentity });
        res.status(200).json({ sessionToken });
    }
    async updatePassword(req, res) {
        const { password, lastPassword } = req.body;
        const userSecrets = await userDAO.getUserSecretsByID(req.userSession.userId);
        const { salt, hash } = userSecrets.secrets;
        if (salt && hash) {
            if (!lastPassword) {
                // validate if last password is supplied for users already having password
                res.status(400).json({ success: false, message: 'lastPassword is required' });
                return;
            }
            const resolvedHash = await crypt.encrypt(lastPassword, salt);
            if (resolvedHash !== hash) {
                return res.status(400).json({ message: 'lastPassword is not matching' });
            }
        }
        const newSalt = await crypt.getSafeRandomBytes();
        const newHash = await crypt.encrypt(password, newSalt);
        userSecrets.secrets.salt = newSalt;
        userSecrets.secrets.hash = newHash;
        await userSecrets.save();
        return res.status(202).send();
    }
}

module.exports = new Auth();