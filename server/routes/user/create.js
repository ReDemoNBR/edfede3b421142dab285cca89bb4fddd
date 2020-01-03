const User = require("../../db/models/user");
const {isEmail} = require("validator");

module.exports = async(req, res, next)=>{
    let {body: {name, email}} = req;
    name = name?.toString();
    email = email?.toString();
    
    if (!name) return res.status(400).send({error: "Property 'name' is required in POST body"});
    if (!email) return res.status(400).send({error: "Property 'email' is required in POST body"});
    if (!isEmail(email)) return res.status(400).send({error: `Invalid email: ${email}`});
    
    try {
        const exists = Boolean(await User.findOne({where: {email}, raw: true})); // using raw=true for better performance
        if (exists) return res.status(409).send({error: `Email already exists: '${email}', it must be unique`});
        const user = await User.create({name, email});
        return res.status(201).send(user);
    } catch(e) {
        return next(e);
    }
};