const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use('', bodyParser.urlencoded({extended: false}));


const users = [];
const excercises = [];
const logs = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', (req, res) => {
  const {username} = req.body;
  
  const userid = makeid(16);
  const newUser = {
    username: username,
    _id: userid,
  };
  users.push(newUser);
  logs[userid] = [];
  res.json(newUser);
  
});


app.get('/api/users', (req, res) => {
  res.json(users);
});


app.post('/api/users/:_id/exercises', (req, res) => {
  const {description, duration, date} = req.body;
  const _id = req.params._id;

  // user
  const user = users.filter(user => user._id === _id);
  if(user.length == 0){
    res.json({error: "user not found"});
    return;
  }


  const exercise = {description: description, duration: parseInt(duration), date: !date ? new Date().toDateString() : new Date(date).toDateString()};
  logs[user[0]._id].push(exercise);

  excercises.push(exercise);
  res.json({...user[0], ...exercise});
  
});

app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const {from, to, limit} = req.query;
  // user
  const user = users.filter(user => user._id === _id);
  if(user.length == 0){
    res.json({error: "user not found"});
    return;
  }

  let userlogs = logs[_id];

  // apply filter
  if(from){
    userlogs = userlogs.filter(log => {
      const fromTime = new Date(from).getTime();
      const logTime = new Date(log.date).getTime();

      return logTime >= fromTime;
    });
  }
  if(to){
    userlogs = userlogs.filter(log => {
      const toTime = new Date(to).getTime();
      const logTime = new Date(log.date).getTime();

      return logTime <= toTime;
    });
  }

  if(limit){
    const temp = userlogs;
    userlogs = [];
    for (let i = 0; i < limit; i++) {
      userlogs.push(temp[i]);
    }
  }

  userlogs.map((log,i) => userlogs[i].duration = parseInt(log.duration))

  res.json({...user, count: userlogs.length, log: userlogs});
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const makeid = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}