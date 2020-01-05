const User = require("../../../db/models/user");
const Payable = require("../../../db/models/payable");
const sortOptions = ["name", "created"];
const {Op: {not}} = require("sequelize");

module.exports = async(req, res, next)=>{
    const {params: {id}, query: {limit, offset, sortDirection}} = req;
    let {query: {sort, status}} = req;
    sort = sort?.toLowerCase() ?? "created";
    status = status?.toLowerCase();
    if (!sortOptions.includes(sort)) return res.status(400).send({error: `Invalid 'sort' in query string. Options are: ${sortOptions.join(", ")}`});
    
    try {
        const payables = await Payable.findAll({
            attributes: ["status", "value", "payment"],
            where: {userId: id, status: status ?? {[not]: null}},
            order: [[sort, sortDirection], ["created", "ASC"]],
            limit, offset,
            logging: console.log
        });
        if (!payables?.length) {
            const userExists = Boolean(await User.findOne({where: {id}, raw: true})); // using raw=true for better performance
            if (!userExists) return res.status(404).send({error: "User not found"});
            return res.status(404).send({error: "No payable found"});
        }
        return res.send(payables);
    } catch(e) {
        return next(e);
    }
};