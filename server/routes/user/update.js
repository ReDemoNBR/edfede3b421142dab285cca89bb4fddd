const User = require("../../db/models/user");
const {isEmail} = require("validator");

module.exports = async(req, res, next)=>{
    const {params: {id}} = req;
    let {body: {name, email}} = req;
    name = name?.toString();
    email = email?.toString();
    
    if (!name) return res.status(400).send({error: "Property 'name' is required in POST body"});
    if (!email) return res.status(400).send({error: "Property 'email' is required in POST body"});
    if (!isEmail(email)) return res.status(400).send({error: `Invalid email: ${email}`});
    
    try {
        const exists = Boolean(await User.findOne({where: {email}, raw: true})); // using raw=true for better performance
        if (exists) return res.status(409).send({error: `Email already exists: '${email}', it must be unique`});
        await User.update({name, email}, {where: {id}});
        return res.status(204).send();
    } catch(e) {
        return next(e);
    }
};