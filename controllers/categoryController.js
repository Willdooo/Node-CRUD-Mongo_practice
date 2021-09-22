const Category = require("../models/category");
const Sub_Category = require("../models/sub-category");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all categorys.
exports.category_list = function (req, res, next) {
  Category.find().exec((err, results) => {
    if (err) return next(err);
    //succesfull
    res.render("category_list", {
      title: "Category list",
      category_list: results,
    });
  });

  //res.send("NOT IMPLEMENTED: category list");
};

// Display detail page for a specific category.
exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: (callback) => {
        Category.findById(req.params.id).exec(callback);
      },
      sub_category: (callback) => {
        Sub_Category.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.category == null) {
        let err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      res.render("category_detail", {
        title: "Category detail",
        category: results.category,
        sub_category: results.sub_category,
      });
    }
  );

  // Category.findById(req.params.id).exec((err, results) => {
  //   if (err) return next(err);
  //   //succesfull
  //   res.render("category_detail", { title: "Category detail", data: results });
  // });
  //res.send("NOT IMPLEMENTED: category detail: " + req.params.id);
};

// Display category create form on GET.
exports.category_create_get = function (req, res, next) {
  res.render("category_form", { title: "Create Category" });
  //res.send("NOT IMPLEMENTED: categoryr create GET");
};

// Handle category create on POST.
exports.category_create_post = [
  //validate and santize the fields
  body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  body("summary", "Category summary required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    //create a category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      summary: req.body.summary,
    });

    console.log(req.body);

    if (!errors.isEmpty()) {
      //there are errors, render the form again with sanitized values/ err messeages
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      //data from form is valid
      //check if category with same name already exists.
      Category.findOne({ name: req.body.name }).exec((err, found_category) => {
        if (err) return next(err);
        if (found_category) {
          //category exists, redirect to its detail page
          res.redirect(found_category.url);
        } else {
          //new category, because found_category didn't passed if() above
          category.save((err) => {
            if (err) return next(err);
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

// Display category delete form on GET.
exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category: (callback) => {
        Category.findById(req.params.id).exec(callback);
      },
      related_sub_category: (callback) => {
        Sub_Category.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.category == null) {
        res.redirect("/catalog/categories");
      }

      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        sub_category: results.related_sub_category,
      });
    }
  );

  //res.send("NOT IMPLEMENTED: category delete GET");
};

// Handle category delete on POST.
exports.category_delete_post = function (req, res, next) {
  async.parallel(
    {
      category: (callback) => {
        Category.findById(req.params.id).exec(callback);
      },
      related_sub_category: (callback) => {
        Sub_Category.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      //check if related_sub_category is empty
      //if not, return
      if (results.related_sub_category.lenght > 0) {
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          sub_category: results.related_sub_category,
        });
        return;
      } else {
        //no subcategories, so delete
        //this is tricky
        //more in category_delete (authorid)
        Category.findByIdAndRemove(
          req.body.categoryid,
          function deleteCategory(err) {
            if (err) return next(err);
            res.redirect("/catalog/categories");
          }
        );
      }
    }
  );

  //res.send("NOT IMPLEMENTED: category delete POST");
};

// Display category update form on GET.
exports.category_update_get = function (req, res, next) {
  Category.findById(req.params.id).exec((err, results) => {
    if (err) return next(err);
    if (results == null) {
      let err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    res.render("category_form", {
      title: "Update Category",
      category: results,
    });
  });

  //res.send("NOT IMPLEMENTED: category update GET");
};

// Handle category update on POST.
exports.category_update_post = [
  body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  body("summary", "Category summary required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    let category = new Category({
      name: req.body.name,
      summary: req.body.summary,
      //ID REQUIRED OTHERWISE IT WOULD CHANGE
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      Category.findById(req.params.id).exec((err, results) => {
        if (err) return next(err);
        if (results == null) {
          let err = new Error("Category not found");
          err.status = 404;
          return next(err);
        }
        res.render("category_form", {
          title: "Update Category",
          category: results,
        });
      });
      return;
    } else {
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        (err, thecategory) => {
          if (err) return next(err);
          res.redirect(thecategory.url);
        }
      );
    }
  },
];
