import { connectToMongo } from "@/mongodb/client";
import { inngest } from "./client";

export const userCreated = inngest.createFunction(
  {
    id: "clerk-user-created",
    name: "User Created",
  },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { db } = await connectToMongo();
    const user = event.data;

    await db.collection("users").insertOne({
      _id: user.id,
      ...user,
      _syncedAt: new Date(),
    });

    return {
      message: `User ${user.id} created and synced to database.`,
      userId: user.id,
    };
  }
);

export const userUpdated = inngest.createFunction(
    {
    id: "clerk-user-updated",
    name: "User Updated",
    },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const { db } = await connectToMongo();
        const user = event.data;

        await db.collection("users").updateOne(
            { _id: user.id },
            {
                $set: {
                    ...user,
                    _syncedAt: new Date(),
                },
            },
            { upsert: true }
        );

        return {
            message: `User ${user.id} updated and synced to database.`,
            userId: user.id,
        };
    }
);

export const userDeleted = inngest.createFunction(
  {
    id: "clerk-user-deleted",
    name: "User Deleted",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { db } = await connectToMongo();
    const userId = event.data.id;

    await db.collection("users").deleteOne({ _id: userId });

    return {
      message: `User ${userId} deleted from database.`,
      userId,
    };
  }
);