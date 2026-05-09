import { connectToDatabase } from "@/lib/mongodb";
import PlatformSettings from "@/models/PlatformSettings";

export async function getOrCreatePlatformSettings() {
  await connectToDatabase();
  let doc = await PlatformSettings.findOne();
  if (!doc) {
    doc = await PlatformSettings.create({});
  }
  return doc;
}

