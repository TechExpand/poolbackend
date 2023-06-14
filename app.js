const express = require('express');
const cors = require('cors');
let cookieParser = require('cookie-parser');
// const formidable = require('express-formidable');
const multer = require('multer');
const puppeteer = require('puppeteer');
const fs = require("fs");
const upload = multer();
const path = require('path');
const app = express();





const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc, getDoc, deleteDoc, query, where, updateDoc, serverTimestamp, and } = require('firebase/firestore');


// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_8GwxAp1O-4lW0bLSHHD8ORhrDD2rj2U",
  authDomain: "poolr-b5392.firebaseapp.com",
  databaseURL: "https://poolr-b5392.firebaseio.com",
  projectId: "poolr-b5392",
  storageBucket: "poolr-b5392.appspot.com",
  messagingSenderId: "841410602650",
  appId: "1:841410602650:web:b88d99c13526c6f3602123"
};

const fb_app = initializeApp(firebaseConfig);
const db = getFirestore(fb_app);


  // create and connect redis client to local instance.


// const messaging = getMessaging(app);

// Get a list of cities from your database
async function getLeaderBoard(db, week) {
  const leaderboardCol = collection(db, `pickrecord`);
  const q = query(leaderboardCol, where("week", "==", week));
  const leaderboardSnapshot = await getDocs(q);
  const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
  return leaderboardList;
}



 async function setLeaderBoard (db, data) {
  const notifyRef = collection(db, 'leaderboard_record');
  const q = query(notifyRef, and(where("week", "==", data.week), where("uid", "==", data.uid)));
  const leaderboardSnapshot = await getDocs(q);
  const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
  console.log(leaderboardList.length)
  if(leaderboardList.length==0){
    const notifySnapshot = await setDoc(doc(notifyRef), data);
    return notifySnapshot;
  }else{
   console.log("already exist")
  }
}



app.use(cors());
// app.use(morgan(':method :url :status :user-agent - :response-time ms'));
// app.use(formidable());
app.use(express.static('./image'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
// const mongoose = require('mongoose');





const mongoose = require('mongoose');
const Pool = require('./models/pools');
const Week = require('./models/week');
const uri = "mongodb+srv://ediku126:ediku126@cluster0.7xzwjnh.mongodb.net/?retryWrites=true&w=majority";
// const uri = "mongodb://localhost:27017/matline"
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB Connected…")
  })
  .catch(err => console.log(err))




// app.use('/getleader',  require('./routes/Auth'));


app.get('/nfl', async (req, res, next) => {

const getweek = await Week.find({})

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
  });

  const page = await browser.newPage();
  await page.goto(
    `https://www.nfl.com/schedules/2022/${getweek[0].name}/`
  );
  console.log("start")
// await page.waitForNavigation({ waitUntil: 'load' });
await page.waitForSelector('.nfl-o-matchup-group')

console.log("waiting");

try{
  await page.click('#onetrust-accept-btn-handler');
}catch(e){

}
  const divContent = await page.evaluate(() => {
    let v = []
    let v2 = []
    const divElement = document.querySelectorAll('.nfl-o-matchup-group');
    divElement.forEach((e, index_org)=>{
     const value = e.querySelectorAll(".nfl-c-matchup-strip__left-area");
  
        value.forEach((ex)=>{
          
       const value2 = ex.querySelectorAll(".nfl-c-matchup-strip__team-abbreviation")
       const value3 = ex.querySelectorAll(".nfl-c-matchup-strip__team-fullname")
       const value5 = ex.querySelectorAll(".nfl-c-matchup-strip__team-score")
       const value4 = ex.querySelectorAll("img")
      
       value2.forEach((ex2, index)=>{  
          v.push({
            id: index_org,
            score: value5[index]?value5[index].getAttribute("data-score"):"--",
            abbreviation: value2[index].innerHTML,
            fullname: value3[index].innerHTML ,
            date: e.querySelector("h2").innerText,
            picture: value4[index].getAttribute("data-src")
          })
        })

        index_org++
        })
      
    })
    return v;
  });

  await browser.close();
  // divContent
  const uniqueData = Object.values(
    divContent.reduce((acc, obj) => {
      // console.log(`${obj.abbreviation} ${obj.id}`)
      const key = `${obj.id}-${obj.date}`;
      if (!acc[key]) {
        acc[key] = obj;
      }else{
        acc[key] = {
          ...acc[key], score2: obj.score, picture2: obj.picture, fullname2: obj.fullname, abbreviation2: obj.abbreviation, week: getweek[0].name
        }
        delete acc[key]["id"];
      }
      return acc;
    }, {})
  );

  const delPool = await Pool.deleteMany({week: getweek[0].name});
  const pool = await Pool.insertMany(uniqueData)
  const findPool = await Pool.find({})
  console.log(findPool.length)
  console.log(uniqueData)
  console.log("closeed")
  res.send("done")

})







// tar czf matline_backend.tar.gz package.json package-lock.json src dump tests
// scp matline_backend.tar.gz root@199.192.27.241:~







function SimilarityPercentage(list1, list2) {
  const commonElements = list1.filter(item => list2.includes(item));
  const similarityScore = commonElements.length / Math.max(list1.length, list2.length) * 100;
  return similarityScore;
}





app.post("/set_week", async (req, res)=>{
  const {name} = req.body;
  const getweek = await Week.findOne({})
  console.log(getweek)
  if(!getweek){
    await Week.create({
      name
    })
    res.send({message: "created"})
  }else{
    await getweek.updateOne({
      name
  })
   res.send({message: "updated"})
  }

})




app.get("/get_week", async (req, res)=>{
  const getweek = await Week.findOne({})
   res.send(getweek)
})



// app.get("/get_week", async (req, res)=>{
//   const getweek = await Week.findOne({})
//    res.send(getweek)
// })



app.get('/calculate_score', async (req, res) => {
  // const {week} = req.params
  const getweek = await Week.find({})
  const findPool = await Pool.find({week: getweek[0].name})
  findPool.reverse()
  const last_value = findPool[0];
  if(last_value.score=="--"||last_value.score2=="--"){
    res.send({message: "weekly game not completed yet!"})
  }else{
    const leaderboardRecord = await getLeaderBoard(db, getweek[0].name)
    let winners = []
    for(let value of findPool){
      if(value.score > value.score2){
        winners.push(value.abbreviation);
      }else if(value.score2 > value.score){
        winners.push(value.abbreviation2);
      }else{
        winners.push(value.abbreviation2);
        winners.push(value.abbreviation);
      }
    }

    for(let value of leaderboardRecord){
      const score = SimilarityPercentage(value.picks, winners)
      console.log(score)
      console.log(value.picks)
     await setLeaderBoard(db, {
      "displayName": value.displayName,
      "score": score.toString(),
      'date': serverTimestamp(),
      'uid': value.uid,
      "week": getweek[0].name,
      "tiebreaker": value.tiebreaker,
    }, )
    }

    const gettiebreaker = Number(last_value.score)+Number(last_value.score2)
    const notifyRef = collection(db, 'leaderboard_record');
    const q = query(notifyRef, where("week", "==", getweek[0].name));
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
    leaderboardList.sort((a, b) => {
      // Calculate the difference between "score" and the target score
      const diffA = Math.abs(a.tiebreaker - gettiebreaker);
      const diffB = Math.abs(b.tiebreaker - gettiebreaker);
    
      if (diffA === diffB) {
        // If the score differences are the same, sort based on the dates in descending order
        return new Date(b.date) - new Date(a.date);
      }
    
      return diffA - diffB; // Sort based on the score differences
    });
    
    // console.log(gettiebreaker);
    res.send(leaderboardList  )
  }
})






app.get('/getleaderboard/:week', async (req, res) => {
  // const {week} = req.params;
  const findPool = await Pool.find({week:req.params.week})
  findPool.reverse()
  const last_value = findPool[0];
  
  const gettiebreaker = Number(last_value.score)+Number(last_value.score2)
    const notifyRef = collection(db, 'leaderboard_record');
    const q = query(notifyRef, where("week", "==", req.params.week));
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
    leaderboardList.sort((a, b) => {
      // Calculate the difference between "score" and the target score
      const diffA = Math.abs(a.tiebreaker - gettiebreaker);
      const diffB = Math.abs(b.tiebreaker - gettiebreaker);
    
      if (diffA === diffB) {
        // If the score differences are the same, sort based on the dates in descending order
        return new Date(b.date) - new Date(a.date);
      }
    
      return diffA - diffB; // Sort based on the score differences
    });
    
    // console.log(gettiebreaker);
    res.send(leaderboardList  )
})







app.get('/version', (req, res) => {
    res.send({ios: "1.0.3" , andriod: "1.0.2"})
})


app.get('/getnlf', async (req, res) => {
  const findPool = await Pool.find({})
  res.send(findPool)
})




app.use(function(err,req,res,next){
	res.status(422).send({error: err.message});
  });


  app.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
  });

app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});