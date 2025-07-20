import {
  userCreated,
  userDeleted,
  userUpdated,
} from "../../../inngest/functions";

import { inngest } from "../../../inngest/client";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    userCreated,
    userUpdated,
    userDeleted,
  ],
});