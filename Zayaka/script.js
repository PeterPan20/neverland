var express = require('express');
var bodyParser = require('body-parser');
var sessions = require('express-session');
var sqlite3 = require('sqlite3').verbose()
var session;
var app = express();

let db = new sqlite3.Database("./testdb.db", (err) => {
    if (err) {
        console.log('Error when creating the database', err)
    } else {
        console.log('Database connected!')
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessions(
    { secret: '$#%#$%^%#fbdfbrgbgfrb$#$', resave: false, saveUninitialized: true }
)
);
app.get('/admin', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    console.log("inside of /login");
    session = req.session;
    if (session.uniqueID) {
        res.write('<a href="/order">Order</a>');
        res.write('<br><br>');
        res.write('welcome ' + session.uniqueID + ' <a href="/logout">Logout</a>');
        res.end();
    } else {
        res.end('Who are you? <a href="/logout">Logout<a>');
    }
});

app.get("/secretInfo", function (req, res) {
    res.sendFile("secretInfo.html", { root: __dirname })
})

app.post("/secretInfo", function (req, res) {
    var newDish = req.body.addnewdish
    var createquery = `INSERT INTO OrderList(Order_Name) VALUES('${newDish}')`;
    db.run(createquery)
    res.redirect('/admin')
});

app.get('/order', function (req, res) {
    res.sendFile('./order.html', { root: __dirname });
});

app.post('/order', function (req, res) {
    var User = session.uniqueID
    var Quantity = req.query.quantity
    var OrderId = req.query.orderid
    var Time_Of_Order = req.query.timeoforderhidden
    var orderQuery = `INSERT INTO Orders1 VALUES('${User}', '${OrderId}', '${Quantity}', '${Time_Of_Order}')`;
    console.log(orderQuery);
    db.run(orderQuery);
    res.status(200).json({ "status": "Success", "responseTxt": "Order placed successfully"});
});

app.get('/getmenufordate', function (req, res) {
    var userDate = req.query.userdate
    console.log(`********** ${userDate}`)
    let query = `SELECT * FROM Menu m, MenuMaster mm WHERE mm.Id = m.MasterId AND MenuDate = '${userDate}'`;
    console.log(`******query**** ${query}`)
    db.all(query, function (err, rows) {
        console.log(rows)
        res.status(200).json({ "error": "", rows })
    });
});

app.get('/login', function (req, res) {
    console.log("inside of /login");
    session = req.session;
    if (session.uniqueID) {
        res.redirect('/redirects');
    }
    res.sendFile('./index.html', { root: __dirname });
});
app.post('/login', async function (req, res) {
    let Username = req.body.username;
    console.log("Username:" + Username);
    let Password = req.body.password;
    console.log("Password:" + Password);
    console.log("inside /login");
    session = req.session;
    console.log("session.uniqueID" + session.uniqueID);
    var query = "SELECT * FROM Users WHERE 1=1 AND UserName = '" + Username + "' AND Password = '" + Password + "' ";
    console.log(query);
    db.all(query, function (err, rows) {
        console.log(rows);
        if (rows.length > 0) {
            console.log("inside of second if statment inside of login");
            session.uniqueID = req.body.username;
            res.status(200).json({ "error": "", "responseTxt": "Valid user", "Username": session.uniqueID })
        } else {
            res.status(200).json({ "error": "user does not exist", "responseTxt": "Invalid user" })
        }
    });

    // console.log("True Or False" + validLogin);
    // if (session.uniqueID) {
    //     console.log("inside session");
    //     res.redirect('/redirects');
    // }
    // if f(req.body.username == Username && req.body.password == Password) {
    //     console.log("inside of second if statment inside of login");
    //     session.uniqueID = req.body.username;
    // }
    // res.redirect('/redirects');
});

app.get('/logout', function (req, res) {
    console.log("inside of /logout");
    req.session.destroy();
    res.redirect('/login');
});

app.get('/redirects', function (req, res) {
    console.log("inside of /redirects");
    session = req.session;
    if (session.uniqueID) {
        console.log("inside of if statment inside of /redirects");
        res.redirect('/admin');
    } else {
        console.log("inside of else statment inside of /redirects");
        res.end('Who are you? <a href="/logout">KILL SESSION<a>');
    }
});

async function CheckIfUserNamePasswordMatch(username, password) {
    var query = "SELECT * FROM Users WHERE 1=1 AND UserName = " + username + " AND Password = " + password + "";
    const result = await db.query(query, []);

    console.log("result.rows:" + result.rows);
    console.log("result.rows:" + result.rows.length);
    if (result.rows.length > 0) {
        return true;
    } else {
        return false;

    }
}

app.get('/message', function (req, res) {
    var Id = req.query.Id;
    UserMailInformation = '';
    db.all("SELECT * FROM Email WHERE Id = " + Id + "", function (err, rows) {
        if (err) {
            console.log("error")
            res.status(400).json({ "error": err.message })
            return;
        } else {
            for (i = 0; i < rows.length; i++) {
                UserMailInformation = UserMailInformation + rows[i].Email_From + '<br><br>';
                UserMailInformation = UserMailInformation + rows[i].Subject + '<br><br>';
                UserMailInformation = UserMailInformation + rows[i].Message_Body;
            }
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(UserMailInformation)
        res.end();
    });
});

app.get('/compose', function (req, res) {
    var compose = '';
    compose = compose + '<form action="/send" method="get">';
    compose = compose + 'Email To<input type=text name="Email_To">';
    compose = compose + '<br><br>';
    compose = compose + 'Subject: <input type=text name="Subject">';
    compose = compose + '<br><br>';
    compose = compose + 'Message: <textarea name="Message_Body" cols="100" rows="10"></textarea>';
    compose = compose + '<br><br>';
    compose = compose + '<input type="submit">';
    compose = compose + '</form>';
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(compose);
    res.end()
});

app.get('/send', function (req, res) {
    var Email_To = req.query.Email_To;
    var Date = req.query.Date;
    var Subject = req.query.Subject;
    var Message = req.query.Message_Body;
    var createQuery = `INSERT INTO Email( Email_From, Email_To, Message_Body, Subject, Date
        ) VALUES('${session.uniqueID}', '${Email_To}', '${Message}', '${Subject}', datetime('now'))`;

    db.run(createQuery);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Email sent');
    res.end();
});

/* 
    First we will have to get the username and password of the user from the url.
    Then we will have to go into the data base and then check if the username and password match.
    the way to check if they are the same is to see if they are both in the same row
    then if they are the same then log the user into the website
    else if the user does not exist or has the wrong username or password then tell them that they either had a wrong username or password OR the user does not exist
*/

app.listen(1234, function () {
    console.log("inside of app.listen");
    console.log('Listening at Port http://192.168.1.156:1234/login');
});