const User = require("../../db/models/user");
const sortOptions = ["name", "created"];

module.exports = async(req, res, next)=>{
    const {query: {limit, offset, sortDirection}} = req;
    let {query: {sort}} = req;
    sort = sort?.toLowerCase() ?? "name";
    if (!sortOptions.includes(sort)) return res.status(400).send({error: `Invalid 'sort' in query string. Options are: ${sortOptions.join(", ")}`});
    
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "created", "updated"],
            order: [[sort, sortDirection], ["id", "ASC"]],
            limit, offset
        });
        if (!users?.length) return res.status(404).send({error: "No user found"});
        return res.send(users);
    } catch(e) {
        return next(e);
    }
};