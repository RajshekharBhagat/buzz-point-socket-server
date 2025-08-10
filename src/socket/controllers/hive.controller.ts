import { Types } from "mongoose";
import SubscriptionModel from "../models/subscription.model.js";

export async function checkSubscription( userId: string ,hiveId: string): Promise<boolean> {
   try {
     const subscription = await SubscriptionModel.findOne({user: new Types.ObjectId(userId), hive: new Types.ObjectId(hiveId)})
     return !!subscription; 
   } catch (error) {
        console.error("Failed to check the subscription: ", error);
        return false;
   }
}