const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Identity = new mongoose.Schema({
    email: String,
    countryCode: String,
    phone: String,
}, { _id: false });

const Secret = new mongoose.Schema({
    verificationCode: String,
    hash: String,
    salt: String,
    secretTokenHash: String,
    secretTokenSalt: String,
}, { _id: false });

const Name = new mongoose.Schema({
    first: String,
    middle: String,
    last: String
}, { _id: false });
const Address = new mongoose.Schema({
    city: String,
    state: String,
    country: String,
    countryCode: String,
    location: { long: Number, lat: Number }
}, { _id: false });
const Profile = new mongoose.Schema({
    name: { type: Name },
    address: { type: Address },
    employeeId: String,
    image: String,
    dob: Date,
}, { _id: false });
Profile.virtual('fullName').get(function () {
    return `${this.name.first} ${this.name.middle} ${this.name.last}`;
});


const schema = new Schema({
    role: {
        required: true,
        type: String,
        enum: ['admin', 'expert', 'technician']
    },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    supervisor: { type: Schema.Types.ObjectId, ref: 'user' },
    identity: { type: Identity, select: false },
    auxIdentity: { // device info
        id: String,
        type: { type: String },
        token: String
    },
    secrets: { type: Secret, select: false },
    profile: { type: Profile },
    __v: { type: Number, select: false }
}, { timestamps: true });
schema.set('toJSON', {
    getters: true,
    aliases: true,
    // eslint-disable-next-line
    transform: function (doc, ret, options) {
        // delete ret._id;
        return ret;
    }
});
module.exports = schema;