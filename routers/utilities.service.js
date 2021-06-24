function checkUndefined(array) {
    for (let i of array) {
        if (i == undefined) {
            return true;
        }
    }
    return false;
}
module.exports = {
    checkUndefined
}