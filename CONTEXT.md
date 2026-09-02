# Habit Shaper

Habit Shaper is a personal habit-tracking context for building desired behaviours and avoiding unwanted behaviours through daily records and streaks.

## Language

**User**:
A person whose Habits, Goals, Completions, and Relapses form a private personal record.
_Avoid_: Account

**User Time Zone**:
The time zone that determines which local calendar date is today for a User. It is initially taken from the User’s browser and may be refreshed when they sign in from another location.
_Avoid_: Server time zone, UTC day

**Habit**:
A behaviour a User wants either to build or to break. Each Habit has one immutable type and begins on its creation day.
_Avoid_: Goal, task

**Build Habit**:
A Habit representing a behaviour the User wants to perform.
_Avoid_: Positive goal

**Break Habit**:
A Habit representing a behaviour the User wants to avoid.
_Avoid_: Negative goal

**Goal**:
A named intention attached immutably to exactly one Habit. It does not independently track progress or completion.
_Avoid_: Habit, target

**Completion**:
The record that a Build Habit was performed on a Tracking Day. A Build Habit has at most one Completion for a given Tracking Day.
_Avoid_: Check-in

**Relapse**:
The record that a Break Habit occurred on a Tracking Day. A Break Habit has at most one Relapse for a given Tracking Day.
_Avoid_: Failure, completion

**Clean Day**:
An eligible Tracking Day on which a Break Habit has no Relapse.
_Avoid_: Completion

**Tracking Day**:
A calendar day in the User Time Zone on which a Habit is eligible to receive a Completion or Relapse, beginning with the Habit’s creation day.
_Avoid_: Event date, UTC day

**Build Streak**:
The consecutive sequence of completed Tracking Days for a Build Habit, allowing the current unfinished day to remain pending.
_Avoid_: Clean streak

**Clean Streak**:
The consecutive sequence of Clean Days after a Break Habit’s most recent Relapse, or since its creation when it has never had a Relapse.
_Avoid_: Build streak

**Weekly Summary**:
The completed, missed, and pending outcome of a Build Habit’s eligible Tracking Days within a Monday–Sunday calendar week.
_Avoid_: Analytics
