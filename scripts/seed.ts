import {
  DEMO_EMAIL,
  disconnectDemoDataService,
  seedDemoData,
} from "../src/features/demo-data/service.ts";

try {
  const result = await seedDemoData();
  console.log(
    `Seeded ${result.habitCount} Habits for ${DEMO_EMAIL} on ${result.trackingDay}.`,
  );
} catch (error) {
  console.error("Demo data seed failed.", error);
  process.exitCode = 1;
} finally {
  await disconnectDemoDataService();
}
