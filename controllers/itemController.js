const Item = require("../models/item");
const Category = require("../models/category");
const Sub_Category = require("../models/sub-category");

const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = function (req, res, next) {
  async.parallel(
    {
      category_count: (callback) => {
        Category.countDocuments({}, callback);
      },
      sub_category_count: (callback) => {
        Sub_Category.countDocuments({}, callback);
      },
      item_count: (callback) => {
        Item.countDocuments({}, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("index", {
        title: "Overview of technologies",
        category_count: results.category_count,
        sub_category_count: results.sub_category_count,
        item_count: results.item_count,
      });
    }
  );
  //res.send("NOT IMPLEMENTED: Site Home Page");
};
// Display list of all items.
exports.item_list = function (req, res, next) {
  Item.find().exec((err, results) => {
    if (err) return next(err);
    res.render("item_list", { title: "Item List", item_list: results });
  });

  //res.send("NOT IMPLEMENTED: item list");
};

// Display detail page for a specific item.
exports.item_detail = function (req, res, next) {
  async.parallel(
    {
      item: (callback) => {
        Item.findById(req.params.id).populate("sub_category").exec(callback);
      },

      //HOW TO GET CATEGORY??????? idk
    },
    (err, results) => {
      if (err) return next(err);
      if (results.item == null) {
        let err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }

      // console.log(results.test);
      res.render("item_detail", { title: "Item detail", item: results.item });
    }
  );

  //res.send("NOT IMPLEMENTED: item detail: " + req.params.id);
};

// Display item create form on GET.
exports.item_create_get = function (req, res, next) {
  async.parallel(
    {
      sub_category: (callback) => {
        Sub_Category.find(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("item_form", {
        title: "Create Item",
        sub_category: results.sub_category,
      });
    }
  );

  //  res.send("NOT IMPLEMENTED: itemr create GET");
};

// Handle item create on POST.
exports.item_create_post = [
  body("name", "Name required").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary is required").trim().isLength({ min: 1 }).escape(),
  body("sub_category", "Sub-category must not be empty").trim().escape(),

  (req, res, next) => {
    //first validate and sanitaze + errors
    const errors = validationResult(req);
    //create new object
    const item = new Item({
      name: req.body.name,
      summary: req.body.summary,
      sub_category: req.body.sub_category,
    });
    //check if errors are empty and if not
    //check and render form again
    if (!errors.isEmpty()) {
      async.parallel(
        {
          sub_category: (callback) => {
            Sub_Category.find(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);
          //render again
          res.render("item_form", {
            title: "Create Item",
            sub_category: results.sub_category,
            errors: errors.array(),
          });
        }
      );
      return;
    }
    //alright so save and redirect
    else {
      item.save((err) => {
        if (err) return next(err);
        res.redirect(item.url);
      });
    }
  },
];

// Display item delete form on GET.
exports.item_delete_get = function (req, res, next) {
  Item.findById(req.params.id).exec((err, results) => {
    if (err) return next(err);
    res.render("item_delete", { title: "Delete Technology", item: results });
  });

  //  res.send("NOT IMPLEMENTED: item delete GET");
};

// Handle item delete on POST.
exports.item_delete_post = function (req, res, next) {
  Item.findById(req.params.id).exec((err, results) => {
    if (err) return next(err);
    Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
      if (err) return next(err);
      res.redirect("/catalog/items");
    });
  });

  //res.send("NOT IMPLEMENTED: item delete POST");
};

// Display item update form on GET.
exports.item_update_get = function (req, res, next) {
  async.parallel(
    {
      item: (callback) => {
        Item.findById(req.params.id).populate("sub_category").exec(callback);
      },
      sub_category: (callback) => {
        Sub_Category.find(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.item == null) {
        let err = new Error("No such technology.");
        err.status = 404;
        return next(err);
      }
      console.log(results);
      res.render("item_form", {
        title: "Update technology",
        item: results.item,
        sub_category: results.sub_category,
      });
    }
  );

  //res.send("NOT IMPLEMENTED: item update GET");
};

// Handle item update on POST.
exports.item_update_post = [
  body("name", "Name required").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary is required").trim().isLength({ min: 1 }).escape(),
  body("sub_category", "Sub-category must not be empty").trim().escape(),

  (req, res, next) => {
    //first validate and sanitaze + errors
    const errors = validationResult(req);
    //create new object
    const item = new Item({
      name: req.body.name,
      summary: req.body.summary,
      sub_category: req.body.sub_category,
      //ID REQUIRED OTHERWISE IT WOULD CHANGE
      _id: req.params.id,
    });
    //check if errors are empty and if not
    //check and render form again
    if (!errors.isEmpty()) {
      async.parallel(
        {
          item: (callback) => {
            Item.findById(req.params.id)
              .populate("sub_category")
              .exec(callback);
          },
          sub_category: (callback) => {
            Sub_Category.find(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);
          //render again
          res.render("item_form", {
            title: "Create Item",
            item: results.item,
            sub_category: results.sub_category,
            errors: errors.array(),
          });
        }
      );
      return;
    }
    //alright so save and redirect
    else {
      Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
        if (err) return next(err);
        res.redirect(theitem.url);
      });
    }
  },
];
