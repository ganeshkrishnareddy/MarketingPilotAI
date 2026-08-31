/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4c0164jc3whn584")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "foelww9m",
    "name": "project_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "xtw59p5gtdchpi8",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4c0164jc3whn584")

  // remove
  collection.schema.removeField("foelww9m")

  return dao.saveCollection(collection)
})
