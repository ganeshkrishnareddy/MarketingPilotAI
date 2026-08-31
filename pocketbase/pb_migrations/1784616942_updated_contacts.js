/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("blqpbmahetqfvto")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "61zu25yi",
    "name": "company_rel",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "i348i36ixyfp636",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("blqpbmahetqfvto")

  // remove
  collection.schema.removeField("61zu25yi")

  return dao.saveCollection(collection)
})
