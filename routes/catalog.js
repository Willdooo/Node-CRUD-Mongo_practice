var express = require("express");
var router = express.Router();

// Require controller modules.
var item_controller = require("../controllers/itemController");
var category_controller = require("../controllers/categoryController");
var sub_category_controller = require("../controllers/sub-categoryController");

/// item ROUTES ///

// GET catalog home page.
router.get("/", item_controller.index);

// GET request for creating a item. NOTE This must come before routes that display item (uses id).
router.get("/item/create", item_controller.item_create_get);

// POST request for creating item.
router.post("/item/create", item_controller.item_create_post);

// GET request to delete item.
router.get("/item/:id/delete", item_controller.item_delete_get);

// POST request to delete item.
router.post("/item/:id/delete", item_controller.item_delete_post);

// GET request to update item.
router.get("/item/:id/update", item_controller.item_update_get);

// POST request to update item.
router.post("/item/:id/update", item_controller.item_update_post);

// GET request for one item.
router.get("/item/:id", item_controller.item_detail);

// GET request for list of all item items.
router.get("/items", item_controller.item_list);

/// sub_category ROUTES ///

// GET request for creating sub_category. NOTE This must come before route for id (i.e. display sub_category).
router.get(
  "/sub_category/create",
  sub_category_controller.sub_category_create_get
);

// POST request for creating sub_category.
router.post(
  "/sub_category/create",
  sub_category_controller.sub_category_create_post
);

// GET request to delete sub_category.
router.get(
  "/sub_category/:id/delete",
  sub_category_controller.sub_category_delete_get
);

// POST request to delete sub_category.
router.post(
  "/sub_category/:id/delete",
  sub_category_controller.sub_category_delete_post
);

// GET request to update sub_category.
router.get(
  "/sub_category/:id/update",
  sub_category_controller.sub_category_update_get
);

// POST request to update sub_category.
router.post(
  "/sub_category/:id/update",
  sub_category_controller.sub_category_update_post
);

// GET request for one sub_category.
router.get("/sub_category/:id", sub_category_controller.sub_category_detail);

// GET request for list of all sub_categorys.
router.get("/sub_categories", sub_category_controller.sub_category_list);

/// category ROUTES ///

// GET request for creating a category. NOTE This must come before route that displays category (uses id).
router.get("/category/create", category_controller.category_create_get);

//POST request for creating category.
router.post("/category/create", category_controller.category_create_post);

// GET request to delete category.
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request to delete category.
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request to update category.
router.get("/category/:id/update", category_controller.category_update_get);

// POST request to update category.
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one category.
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all category.
router.get("/categories", category_controller.category_list);

module.exports = router;
