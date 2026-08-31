/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "msn6afifz8sm2t1",
    "created": "2026-07-21 08:52:17.864Z",
    "updated": "2026-07-21 08:52:17.864Z",
    "name": "test_col",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "zdchul96",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("msn6afifz8sm2t1");

  return dao.deleteCollection(collection);
})
