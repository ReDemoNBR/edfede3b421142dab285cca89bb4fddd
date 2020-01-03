const User = require("../../db/models/user");

module.exports = async(req, res, next)=>{
    const {params: {id}} = req;
    
    try {
        const count = await User.destroy({where: {id}, limit: 1});
        if (!count) return res.status(404).send({error: "No user found"});
        return res.status(204).send();
    } catch(e) {
        return next(e);
    }
};