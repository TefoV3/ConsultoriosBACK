// schedules_tables/associations.js

import { InternalUser } from "../Internal_User.js";
import { Period } from "./Period.js";
import { UserXPeriod } from "./UserXPeriod.js";
import { Student_Hours_Summary } from "./Student_Hours_Summary.js";
import { Extra_Hours } from "./Extra_Hours.js";
import { Weekly_Tracking } from "./Weekly_Tracking.js";
import { Schedule_Students } from "./Schedule_Students.js"; // ✅ nombre correcto
import { Attendance_Record } from "./Attendance_Record.js";
import { Weekly_Hours_Summary } from "./Weekly_Hours_Summary.js";
import { Alert } from "./Alert.js";

// 🔹 N:M - InternalUser <-> Period through UserXPeriod
InternalUser.belongsToMany(Period, {
  through: UserXPeriod,
  foreignKey: "Internal_ID",
  as: "periods"
});
Period.belongsToMany(InternalUser, {
  through: UserXPeriod,
  foreignKey: "Period_ID",
  as: "users"
});

// 🔹 1:N - InternalUser -> UserXPeriod
InternalUser.hasMany(UserXPeriod, {
  foreignKey: "Internal_ID",
  as: "userPeriods"
});
UserXPeriod.belongsTo(InternalUser, {
  foreignKey: "Internal_ID",
  as: "user"
});

// 🔹 1:N - Period -> UserXPeriod
Period.hasMany(UserXPeriod, {
  foreignKey: "Period_ID",
  as: "periodUsers"
});
UserXPeriod.belongsTo(Period, {
  foreignKey: "Period_ID",
  as: "period"
});

// 🔹 1:N - InternalUser -> Student_Hours_Summary
InternalUser.hasMany(Student_Hours_Summary, {
  foreignKey: "Internal_ID",
  as: "hoursSummary"
});
Student_Hours_Summary.belongsTo(InternalUser, {
  foreignKey: "Internal_ID",
  as: "userSummary"
});

// 🔹 1:N - InternalUser -> Extra_Hours
InternalUser.hasMany(Extra_Hours, {
  foreignKey: "Internal_ID",
  as: "extraHours"
});
Extra_Hours.belongsTo(InternalUser, {
  foreignKey: "Internal_ID",
  as: "userExtraHours"
});

// 🔹 1:N - Period -> Weekly_Tracking
Period.hasMany(Weekly_Tracking, {
  foreignKey: "Period_ID",
  as: "trackings"
});
Weekly_Tracking.belongsTo(Period, {
  foreignKey: "Period_ID",
  as: "trackingPeriod"
});

// 🔹 1:N - UserXPeriod -> Schedule_Students
UserXPeriod.hasMany(Schedule_Students, {
  foreignKey: "UserXPeriod_ID",
  as: "schedules"
});
Schedule_Students.belongsTo(UserXPeriod, {
  foreignKey: "UserXPeriod_ID",
  as: "userPeriodSchedule"
});


// 🔹 UserXPeriod -> Attendance_Record
UserXPeriod.hasMany(Attendance_Record, {
    foreignKey: "UserXPeriod_ID",
    as: "attendance"
  });
  Attendance_Record.belongsTo(UserXPeriod, {
    foreignKey: "UserXPeriod_ID",
    as: "userXPeriod"
  });

// 🔹 1:N - Student_Hours_Summary -> Weekly_Hours_Summary
Student_Hours_Summary.hasMany(Weekly_Hours_Summary, {
  foreignKey: "Summary_ID",
  as: "weeklySummaries"
});
Weekly_Hours_Summary.belongsTo(Student_Hours_Summary, {
  foreignKey: "Summary_ID",
  as: "generalSummary"
});

// 🔹 1:N - InternalUser -> Alert
InternalUser.hasMany(Alert, {
  foreignKey: "Internal_ID",
  as: "alerts"
});
Alert.belongsTo(InternalUser, {
  foreignKey: "Internal_ID",
  as: "userAlerts"
});

console.log("📌 Sequelize associations with InternalUser established correctly.");
