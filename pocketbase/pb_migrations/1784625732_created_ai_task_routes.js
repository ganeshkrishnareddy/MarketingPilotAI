/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "c1oidjzzwdc7m6g",
    "created": "2026-07-21 09:22:12.485Z",
    "updated": "2026-07-21 09:22:12.485Z",
    "name": "ai_task_routes",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "c1ohgqtj",
        "name": "task_type",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "2wmznyka",
        "name": "model_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "gnxcvqsfzqtembu",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "9xaafw2h",
        "name": "fallback_model_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "gnxcvqsfzqtembu",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("c1oidjzzwdc7m6g");

  return dao.deleteCollection(collection);
})
