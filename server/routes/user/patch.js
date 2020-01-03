const User = require("../../db/models/user");
const {isEmail} = require("validator");

module.exports = async(req, res, next)=>{
    const {params: {id}, body: {name, email}} = req;
    if (email && !isEmail(email)) return res.status(400).send({error: `Invalid email: ${email}`});
    
    const data = {};
    data.name = name?.toString();
    data.email = email?.toString();
    
    Object.entries(data).forEach(([key, value])=>{
        if (value==undefined) delete data[key];
    });
    
    try {
        if (email) {
            const exists = Boolean(await User.findOne({where: {email}, raw: true})); // using raw=true for better performance
            if (exists) return res.status(409).send({error: `Email already exists: '${email}', it must be unique`});
        }
        await User.update(data, {where: {id}});
        const user = await User.findByPk(id);
        return res.send(user);
    } catch(e) {
        return next(e);
    }
};