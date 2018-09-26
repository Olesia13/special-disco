// importing dependencies
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Band = require('./app/models/band').band;
const Member = require('./app/models/band').member;

mongoose.connect('mongodb://localhost:27017/bands', {useNewUrlParser: true});

app.use(bodyParser.urlencoded( { extended: true } ));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;
const router = express.Router();

// middleware starts here
// function fired with every API call
router.use(function(req,res,next){
  console.log("something is happening");
  // next call goes through to next route
  next();
})
// end of middleware

// only base route 'somehost:1234/api/'
router.get('/',function(req,res){
  res.json({
    message:"welcome to the best api"
  })
})

// routes for api
// ==================================================

// bands routes
router.route('/bands')
  // post new band
  .post(function(req, res) {
    var band = new Band()
    band.name = req.body.name
    band.save(function(err) {
      if (err)
        res.send(err)
      res.json({
        message: "band created"
      })
    })
  })
  // get all bands
  .get(function(req, res) {
    Band.find(function(err, bands) {
      if (err)
        res.send(err)
      res.json(bands)
    })
  })

// specific band route
router.route('/bands/:band_id')
   // see specific band
  .get(function(req, res) {
    Band.findById(req.params.band_id, function(err, band) {
      if (err)
        res.send(err)
      res.json(band)
    })
  })

  // edit specific band name
  .put(function(req, res) {
    Band.findById(req.params.band_id, function(err, band) {
      if (err)
       res.send(err)
      band.name = req.body.name
      band.save(function(err) {
        if (err)
          res.send(err)
        res.json({
          message: "band updated"
        })
    })
   })
  })

  // delete specific band
  .delete(function(req, res) {
    Band.remove({
      _id:req.params.band_id},
      function(err, band) {
      if (err)
        res.send(err)
      res.json({
        message: "band deleted"
      })
    })
  })

// see band members of a specific band
router.route('/bands/:band_id/members')
  // add band member to a specific band
  .post(function(req, res) {
    Band.findById({
      _id: req.params.band_id
    }, function(err, band) {
      var member = new Member()
      member.band = band
      member.name = req.body.name
      band.members.push(member);
      band.save(function(err) {
        if (err)
         res.send(err)
      })
      member.save(function(err) {
        if (err)
          res.send(err)
          res.json({
            message: "Member Created/Band updated"
          })
      })
    })
  })
  // see a list of members to the specific band
  .get(function(req,res){
    Band.findById(req.params.band_id, function(err, band) {
      if (err)
        res.send(err)
    // get more information about members in the band
    }).populate('members', 'name').exec(function(err, band){
      if (err)
        res.send(err)
      res.json(band.members)
    })
  })

// route to all members
router.route('/members')
  // get a list of all members of all bands
  // is this route even working?
  .get(function(req, res) {
    Member.find(function(err, members) {
      if (err)
        res.send(err)
      res.json(members)
    })
  })

//route to the specific member
router.route('/members/:member_id')
  // edit specific member
  .put(function(req, res) {
    Member.findById(req.params.member_id, function(err, member) {
      if (err)
        res.send(err)
       // assign name to the member
     member.name = req.body.name
     // save member information
     member.save(function(err) {
       if (err)
         res.send(err)
       res.json({
         message: "member updated"
       })
     })
   })
  })

//add delete function for specific member
//====================================


app.use('/api', router)
//listen to port
app.listen(port)
//print out wht port you are on
console.log('Magic happens on port' + port)
