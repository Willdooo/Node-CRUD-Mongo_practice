#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");
var Sub_Category = require("./models/sub-category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var categories = [];
var sub_categories = [];
var items = [];

function categoryCreate(name, summary, cb) {
  var category = new Category({ name: name, summary: summary });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function sub_categoryCreate(name, summary, category, cb) {
  var sub_category = new Sub_Category({
    name: name,
    summary: summary,
    category: category,
  });
  sub_category.save(function (err) {
    if (err) {
      cb(err, null);
    }
    console.log("New Sub-category" + sub_category);
    sub_categories.push(sub_category);
    cb(null, sub_category);
  });
}

function itemCreate(name, summary, sub_category, cb) {
  var item = new Item({
    name: name,
    summary: summary,
    sub_category: sub_category,
  });
  item.save(function (err) {
    if (err) {
      cb(err, null);
    }
    console.log("New item" + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "Web Development",
          "Technologies used in development of web apps",
          callback
        );
      },
    ],
    cb
  );
}

function createSub_Categories(cb) {
  async.series(
    [
      function (callback) {
        sub_categoryCreate(
          "Front-end",
          "Technologies used in front-end part of WebDev",
          categories[0],
          callback
        );
      },
      function (callback) {
        sub_categoryCreate(
          "Back-end",
          "Technologies used in back-end part of WebDev",
          categories[0],
          callback
        );
      },
    ],
    cb
  );
}
function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "CSS",
          "CSS is the language we use to style an HTML document. CSS describes how HTML elements should be displayed.",
          sub_categories[0]
        );
      },
      function (callback) {
        itemCreate(
          "Node",
          "As an asynchronous event-driven JavaScript runtime, Node.js is designed to build scalable network applications.",
          sub_categories[1]
        );
      },
    ],
    cb
  );
}

async.series(
  [createCategories, createSub_Categories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("allgood??: ");
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
