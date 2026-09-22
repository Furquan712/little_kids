import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const favoriteSchema = new Schema(
  {
    familyId: { type: Types.ObjectId, ref: "User", required: true },
    nannyId: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

favoriteSchema.index({ familyId: 1, nannyId: 1 }, { unique: true });

export type FavoriteDocument = InferSchemaType<typeof favoriteSchema>;

export const Favorite = models.Favorite || model("Favorite", favoriteSchema);
