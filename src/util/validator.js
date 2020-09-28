/* eslint  no-useless-escape: 0 */
module.exports = {
    isValidPhoneNumber: (value) => value.match(/^\+[0-9 ]{1,5}-[0-9]{9,10}/g),
    isValidEmail: (value) => value.match(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi),
}