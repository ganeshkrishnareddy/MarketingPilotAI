/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("t7v58tq1zac1eny")

  collection.listRule = "@request.auth.role = \"admin\" || client_id = @request.auth.id"
  collection.viewRule = "@request.auth.role = \"admin\" || client_id = @request.auth.id"
  collection.createRule = "@request.auth.id != \"\""
  collection.updateRule = "@request.auth.role = \"admin\" || client_id = @request.auth.id"
  collection.deleteRule = "@request.auth.role = \"admin\" || client_id = @request.auth.id"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "og3pa13g",
    "name": "client_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("t7v58tq1zac1eny")

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = ""
  collection.updateRule = ""
  collection.deleteRule = ""

  // remove
  collection.schema.removeField("og3pa13g")

  return dao.saveCollection(collection)
})
