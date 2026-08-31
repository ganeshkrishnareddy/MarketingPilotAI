/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "dqpyx83nscpmp4a",
    "created": "2026-07-21 09:39:15.389Z",
    "updated": "2026-07-21 09:39:15.389Z",
    "name": "ai_execution_graph",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "9lglzsqe",
        "name": "project_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "xtw59p5gtdchpi8",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "gws95ciz",
        "name": "graph_json",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
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
  const collection = dao.findCollectionByNameOrId("dqpyx83nscpmp4a");

  return dao.deleteCollection(collection);
})
