# Farely AI Trip Planner Architecture

## Product Goal

Farely AI should answer: "Where should I go?"

The planner should help a traveller discover the right trip through conversation, then convert the confirmed plan into a flight search. It should not immediately fill the search form after the first vague prompt.

## Current State

The current planner is useful as an MVP, but it behaves like a form helper:

- `parseTripPrompt` in `src/App.jsx` guesses intent from a single message.
- `handleAiButton` can directly mutate flight-search state.
- planner choice handlers set route, dates, trip type, trip length, and search mode directly.
- `PlannerModal` copy says the planner fills the form.

This makes the AI journey feel like auto-fill instead of a travel assistant.

## Target User Journeys

### Search Flights

For users who already know:

- origin
- destination
- dates
- passengers
- cabin class

This remains the traditional search form.

### Plan with Farely AI

For users who do not know where to go yet.

The planner should:

1. understand the initial idea,
2. ask follow-up questions instead of guessing,
3. build a structured trip intent,
4. recommend destinations,
5. ask the user to choose one,
6. only then populate the search form.

## Core Architecture Rule

The AI planner must own its own planning state.

It should not write into the flight search form until the user confirms a destination or route.

Use a single handoff function:

```js
applyConfirmedTrip(searchDraft)
```

That function is the only place where planner output becomes search-form state.

## Planner State Model

Use a simple state machine that can become more sophisticated later:

```js
const PLANNER_STEPS = {
  INTAKE: "intake",
  CLARIFYING: "clarifying",
  RECOMMENDING: "recommending",
  CONFIRMING_DESTINATION: "confirming_destination",
  READY_TO_SEARCH: "ready_to_search",
};
```

Recommended data shape:

```js
const tripIntent = {
  origin: null,
  monthOrDates: null,
  tripLengthNights: null,
  budget: null,
  travellers: null,
  cabin: "Economy",
  style: [],
  avoids: [],
  constraints: [],
};
```

Recommended destination shape:

```js
const recommendation = {
  id: "malaga",
  destinationName: "Malaga",
  destinationCode: "AGP",
  reasons: ["Warm in July", "Good beach option", "Often has direct flights"],
  estimatedPriceFrom: null,
  estimatedTemperatureC: null,
  confidence: "medium",
};
```

Recommended search handoff shape:

```js
const searchDraft = {
  tripType: "return",
  dateMode: "exact",
  originCode: "LON",
  destinationCode: "AGP",
  departDate: null,
  returnDate: null,
  flexMonth: "2026-07",
  tripLength: 5,
  passengers: 1,
  cabin: "Economy",
};
```

## Conversation Rules

The assistant should ask before assuming when these are missing:

- departure airport or region
- dates or month
- budget
- trip length
- travel style
- passenger needs
- direct-flight preference
- airlines to avoid
- family, halal, accessibility, or mobility requirements

Examples:

- User: "Weekend getaway in Paris"
- Farely: "Which weekend are you thinking of, and are you flying from London?"

- User: "I want somewhere warm in July"
- Farely: "What budget should I aim for, and do you prefer beach, city, or a mix?"

## Recommendation Rules

Destination cards should appear only after the planner has enough useful context.

Each recommendation should clearly separate:

- known facts,
- estimated values,
- user preference matches,
- missing checks.

Do not imply live prices, weather, visa rules, or halal suitability are guaranteed unless they are backed by a live source.

## UI Direction

The planner should feel integrated into Farely:

- mobile: slide-up assistant or bottom sheet
- desktop: modal or side panel
- always preserve the feeling that the user is still inside Farely
- keep suggestion cards, but make natural typing the primary path
- show a visible "Use this trip for search" action only after confirmation

## Implementation Plan

### Phase 1: Decouple Planner from Search State

- Move prompt parsing out of `src/App.jsx`.
- Create planner-specific state and actions.
- Remove direct search-form mutation from first-message handling.
- Keep the existing search form untouched.
- Add `applyConfirmedTrip(searchDraft)` as the only handoff.

### Phase 2: Conversational MVP

- Replace immediate autofill with follow-up questions.
- Store answers in `tripIntent`.
- Support typed natural responses and existing suggested cards.
- Ask one question at a time.

### Phase 3: Recommendation Cards

- Add a small destination recommendation catalogue.
- Rank destinations against `tripIntent`.
- Show 2-4 destination cards with clear confidence and caveats.
- Let the user choose one destination.

### Phase 4: Confirmed Search Handoff

- Convert the selected recommendation into `searchDraft`.
- Populate the search form only after the user confirms.
- Let the user edit the populated form before searching.

### Phase 5: Smarter Data Sources

Later, the same architecture can support:

- live fare estimates,
- seasonal weather data,
- airline preference handling,
- halal-friendly trip notes,
- visa and passport reminders,
- saved planner sessions,
- server-side AI calls.

## Technical Guardrails

- Do not call live flight search from the first vague prompt.
- Do not silently guess dates, trip length, or destination.
- Keep AI recommendations separate from booking claims.
- Keep affiliate redirects server-controlled.
- Keep the planner deterministic enough to test.
- Add tests around prompt-to-question and confirmation-to-search handoff.

## Recommended Next Engineering Task

Implement Phase 1 only:

Decouple planner state from search state and stop first-message autofill. Keep the current UI mostly intact, but change the flow so Farely asks a follow-up question unless the user has given a complete, confirmed route and date.
