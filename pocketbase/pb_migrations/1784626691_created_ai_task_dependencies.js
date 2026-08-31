/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "wwkac35git75al7",
    "created": "2026-07-21 09:38:11.465Z",
    "updated": "2026-07-21 09:38:11.465Z",
    "name": "ai_task_dependencies",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "iozldsvi",
        "name": "task_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "4c0164jc3whn584",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "wgrlrcwu",
        "name": "depends_on_task_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "4c0164jc3whn584",
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
  const collection = dao.findCollectionByNameOrId("wwkac35git75al7");

  return dao.deleteCollection(collection);
})
