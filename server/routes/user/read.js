const User = require("../../db/models/user");
const Payable = require("../../db/models/payable");
const {fn, col, literal} = require("sequelize");

module.exports = async(req, res, next)=>{
    const {params: {id}} = req;
    
    try {
        const user = await User.findOne({
            attributes: {
                exclude: ["email"],
                include: [
                    [fn("SUM(\"payables\".\"value\") FILTER", literal("WHERE \"payables\".\"status\"='paid'")), "available"],
                    [fn("SUM(\"payables\".\"value\") FILTER", literal("WHERE \"payables\".\"status\"='waiting_funds'")), "waitingFunds"]
                ]
            },
            where: {id},
            include: [{
                model: Payable,
                required: false, // exposing this to remember this is a LEFT OUTER JOIN
                attributes: []
            }],
            group: ["id", "name", "user.created", "user.updated"].map(col)
        });
        if (!user) return res.status(404).send({error: "No user found"});
        return res.send(user);
    } catch(e) {
        return next(e);
    }
};