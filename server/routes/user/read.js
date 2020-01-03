const User = require("../../db/models/user");

module.exports = async(req, res, next)=>{
    const {params: {id}} = req;
    
    try {
        const user = await User.findByPk(id, {attributes: {exclude: ["email"]}});
        if (!user) return res.status(404).send({error: "No user found"});
        return res.send(user);
    } catch(e) {
        return next(e);
    }
};