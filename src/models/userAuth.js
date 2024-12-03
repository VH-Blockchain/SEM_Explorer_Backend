import { connection } from "../config/db-config.js";

export async function addUser(FirstName, LastName, email, password) {

    try {
        const data = await new Promise((response, reject) => {
            try {
                const query = `select * from users where email_id = ?`;
                connection.query(query, [email], function (err, result) {
                    if (err) {
                        console.error('error: ' + err.stack);
                        return;
                    }

                    // console.log("result check", typeof JSON.stringify(result[0]) == "undefined");
                    const data = JSON.stringify(result[0]);
                    response(data)
                })
            } catch (error) {
                reject(error)
            }
        })
        if (data != undefined) {
           
            console.log("email already registered !");
            return {"code":400,"message":"email is already registered tushar"}
        }

        const datainsertion = await new Promise((response, reject) => {
            try {
                const insertquery = `insert into users values ( "${email}", "${password}", 1,"${FirstName}","${LastName}",0 )`;
                connection.query(insertquery, function (err, result) {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        return;
                    }
                    console.log("result", result);
                    response(result);
                })
            } catch (error) {
                reject(error)
            }
        })
        if (datainsertion != undefined) {
            console.log("shrey ", data != undefined);
            console.log("email already registered !");
            return {"code":200,"message":"User register successfully"}
        }
    } catch (error) {
        return (error)
    }
}

export function validateUser(email) {
    return new Promise((response, reject) => {
        try {
            const query = `select * from users where email_id = ?`;
            connection.query(query, [email], function (err, result) {
                if (err) {
                    console.error('error: ' + err.stack);
                    return;
                }
                // console.log("result check", (JSON.stringify(result[0])));
                const data = JSON.stringify(result[0]);
                response(data);
            })
        } catch (error) {
            reject(error)
        }
    })
}

