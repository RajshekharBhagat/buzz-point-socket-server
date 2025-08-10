import SubscriptionModel from "../models/subscription.model.js";

export async function checkSubscription(hiveId: string, userId: string): Promise<boolean> {
    const subscription = SubscriptionModel.findOne({user: userId, hive: hiveId})
    return !!subscription;
}