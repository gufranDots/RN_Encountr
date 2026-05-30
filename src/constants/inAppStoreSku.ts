import { Platform } from 'react-native';

export const subscriptionSkus = Platform.select({
  ios: [
    "1Month",
    "com.plusPlans.oneMonth",
    "com.plusPlan.threesmonths",
    "com.plusPlan.sixsmonths",
    "com.plusPlans.onesyear"




    // "com.plusplan.onemonth",
    // "com.unlimitedplan.oneyear",
    // "com.plusPlan.oneWeek",
    // "com.plusPlan.threemonths",
    // "com.plusPlan.sixmonths",
    // "com.plusPlans.oneyear",
    // "com.unlimitedPlans.onemonth",
    // "com.unlimitedPlan.sixmonths"
  ],
  android: [
    "com.plusplan.onemonth",
    "com.unlimitedplan.oneyear"
  ],
});
