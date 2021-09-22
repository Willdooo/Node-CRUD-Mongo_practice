const Sub_Category = require("../models/sub-category");
const Category = require("../models/category");
const Item = require("../models/item");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all sub_categorys.
exports.sub_category_list = function (req, res, next) {
  Sub_Category.find().exec((err, results) => {
    if (err) return next(err);
    //succesful
    res.render("sub-category_list", {
      title: "Sub-Category list",
      sub_category_list: results,
    });
  });

  //res.send("NOT IMPLEMENTED: sub_category list");
};

// Display detail page for a specific sub_category.
exports.sub_category_detail = function (req, res, next) {
  async.parallel(
    {
      sub_category: (callback) => {
        Sub_Category.findById(req.params.id)
          .populate("category")
          .exec(callback);
      },
      item: (callback) => {
        Item.find({ sub_category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.sub_category == null) {
        let err = new Error("Sub-category not found");
        err.status = 404;
        return next(err);
      }
      console.log(results);
      res.render("sub-category_detail", {
        title: "Sub-Category detail",
        sub_category: results.sub_category,
        item: results.item,
      });
    }
  );

  //res.send("NOT IMPLEMENTED: sub_category detail: " + req.params.id);
};

// Display sub_category create form on GET.
exports.sub_category_create_get = function (req, res, next) {
  async.parallel(
    {
      category: (callback) => {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("sub-category_form", {
        title: "Create Sub-Category",
        category: results.category,
      });
    }
  );

  //res.send("NOT IMPLEMENTED: sub_categoryr create GET");
};

// Handle sub_category create on POST.
exports.sub_category_create_post = [
  body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const sub_category = new Sub_Category({
      name: req.body.name,
      summary: req.body.summary,
      category: req.body.category,
    });
    if (!errors.isEmpty()) {
      async.parallel(
        {
          category: (callback) => {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);
          res.render("sub-category_form", {
            title: "Create Sub-Category",
            category: results.category,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      sub_category.save((err) => {
        if (err) return next(err);
        res.redirect(sub_category.url);
      });
    }
  },
];

// Display sub_category delete form on GET.
exports.sub_category_delete_get = function (req, res, next) {
  async.parallel(
    {
      sub_category: (callback) => {
        Sub_Category.findById(req.params.id).exec(callback);
      },
      related_items: (callback) => {
        Item.find({ sub_category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.sub_category == null) {
        res.redirect("/catalog/sub_categories");
      }
      res.render("sub-category_delete", {
        title: "Delete Sub-Category",
        sub_category: results.sub_category,
        items: results.related_items,
      });
    }
  );
  // res.send("NOT IMPLEMENTED: sub_category delete GET");
};

// Handle sub_category delete on POST.
exports.sub_category_delete_post = function (req, res, next) {
  async.parallel(
    {
      sub_category: (callback) => {
        Sub_Category.findById(req.params.id).exec(callback);
      },
      related_items: (callback) => {
        Item.find({ sub_category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      //check if items exist
      if (results.related_items.length > 0) {
        res.render("sub-category_delete", {
          title: "Delete Sub-Category",
          sub_category: results.sub_category,
          items: results.related_items,
        });
        return;
      } else {
        //no items so delete sub
        Sub_Category.findByIdAndRemove(
          req.body.sub_categoryid,
          function deleteSub_Category(err) {
            if (err) return next(err);
            res.redirect("/catalog/sub_categories");
          }
        );
      }
    }
  );

  // res.send("NOT IMPLEMENTED: sub_category delete POST");
};

// Display sub_category update form on GET.
exports.sub_category_update_get = function (req, res, next) {
  async.parallel(
    {
      sub_category: (callback) => {
        Sub_Category.findById(req.params.id)
          .populate("category")
          .exec(callback);
      },
      category: (callback) => {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.sub_category == null) {
        let err = new Error("Sub-Category not found.");
        err.status = 404;
        return next(err);
      }
      res.render("sub-category_form", {
        title: "Update Sub-Category",
        sub_category: results.sub_category,
        category: results.category,
      });
    }
  );

  //res.send("NOT IMPLEMENTED: sub_category update GET");
};

// Handle sub_category update on POST.
exports.sub_category_update_post = [
  body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const sub_category = new Sub_Category({
      name: req.body.name,
      summary: req.body.summary,
      category: req.body.category,
      //ID REQUIRED OTHERWISE IT WOULD CHANGE
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      async.parallel(
        {
          sub_category: (callback) => {
            Sub_Category.findById(req.params.id)
              .populate("category")
              .exec(callback);
          },
          category: (callback) => {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);
          res.render("sub-category_form", {
            title: "Update Sub-Category",
            sub_category: results.sub_category,
            category: results.category,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      Sub_Category.findByIdAndUpdate(
        req.params.id,
        sub_category,
        {},
        (err, thesub_category) => {
          if (err) return next(err);
          res.redirect(thesub_category.url);
        }
      );
    }
  },
];
