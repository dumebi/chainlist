const mongoose = require('mongoose');
const {Schema} = mongoose;
const bcrypt = require('bcrypt-nodejs');

let User = new Schema({
    name: { type: Schema.Types.String },
    email: { type: Schema.Types.String, unique: true, required: true, dropDups: true },
    address: { type: Schema.Types.String },
    password: { type: Schema.Types.String }
}, {timestamps: true});

User.methods.encrypt = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

User.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

User.methods.validateToken = function (token) {
    return bcrypt.compareSync(token, this.security_token);
};

User.methods.validateSecAnswer = function (answer) {
    return bcrypt.compareSync(answer, this.security_answer);
};

module.exports = mongoose.model('User', User);
