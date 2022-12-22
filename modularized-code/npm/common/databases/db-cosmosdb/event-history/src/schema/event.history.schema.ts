import { Schema } from "mongoose";

const modelName: string = String(process.env.MONGOOSE_EVENT_HISTORY);

const eventHistorySchema = new Schema(
  {
    _id: { type: String, required: true, unique: false },
    transactionId: { type: String },
    source: { type: String },
    payload: { type: Schema.Types.Mixed },
    date: {
      type: String,
      default: () => {
        return new Date().toISOString();
      }
    },
    datePartition: {
      type: String,
      default: () => {
        return new Date().toISOString().slice(0, 10);
      }
    },
    status: { type: Number },
    userId: { type: Number },
    method: { type: String },
    entity: { type: String }
  },
  {
    _id: true,
    collection: modelName
  }
);
export const EventHistorModelName = modelName;
export const EventHistorySchema = eventHistorySchema;

