migrate((app) => {
  // Create whatsapp_config collection
  try {
    app.collection({
      name: "whatsapp_config",
      type: "base",
      fields: [
        {
          name: "welcome_message",
          type: "text",
          required: false,
        },
        {
          name: "business_hours",
          type: "text",
          required: false,
        },
        {
          name: "fallback_message",
          type: "text",
          required: false,
        },
        {
          name: "handoff_keywords",
          type: "text",
          required: false,
        },
        {
          name: "auto_reply_enabled",
          type: "bool",
          required: false,
        },
        {
          name: "language",
          type: "text",
          required: false,
        },
      ],
      indexes: [],
    });
  } catch (e) {
    console.log("whatsapp_config already exists");
  }

  // Create whatsapp_conversations collection
  try {
    app.collection({
      name: "whatsapp_conversations",
      type: "base",
      fields: [
        {
          name: "contact_id",
          type: "relation",
          collectionId: "pbc_1234567890", // Will be updated after creation
          required: false,
        },
        {
          name: "phone",
          type: "text",
          required: true,
        },
        {
          name: "direction",
          type: "select",
          values: ["incoming", "outgoing"],
          required: true,
        },
        {
          name: "message",
          type: "text",
          required: true,
        },
        {
          name: "timestamp",
          type: "date",
          required: false,
        },
      ],
      indexes: ["phone"],
    });
  } catch (e) {
    console.log("whatsapp_conversations already exists");
  }
});
