import { connection } from "../config/db-config.js";

export async function getActivePlan(email_id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM users INNER JOIN subscriptions ON users.subscription_id=subscriptions.id WHERE users.email_id=?`, [email_id], function (error, response, fields) {
            if (error) {
                reject(error);
            } else {
                response[0]['features'] = (JSON.parse(response[0]['features']))
                resolve(...response);
            }
        });
    });
}
export async function UpdatePlan(email_id, plan_id) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE `users` SET subscription_id=" + plan_id + " WHERE email_id ='" + email_id + "'";
        console.log("query", query);
        connection.query(query, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result);
            }
        });

        const queryforuserapikey = "UPDATE `userapikeydata` SET planid=" + plan_id + " WHERE email ='" + email_id + "'";
        console.log("query", queryforuserapikey);
        connection.query(queryforuserapikey, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result);
            }
        });
    });
}
// export async function addtoken(token_id) {
//     return new Promise((resolve, reject) => {
//         connection.query(`INSERT INTO users where email_id=? VALUES (?)`,[,token_id], function (error, response, fields) {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(response);
//             }
//         });
//     });    
// }