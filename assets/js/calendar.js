const CALENDAR_API_KEY = "AIzaSyC0WvACrtSH1PGbHznMrcBPZRfrFRbOiAI";
const CALENDAR_ID = "fc9ececc7d792ab5dbd719341616e425992d3f8118e1b3d0c7680ad5c13e1924@group.calendar.google.com";
const CALENDAR_TIME_ZONE = "America/Denver";
const PUBLIC_CALENDAR_URL = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=America%2FDenver`;

const calendarApp = document.querySelector("[data-calendar-app]");

const nowDate = new Date();
let visibleMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
let calendarEvents = [];
let selectedEventId = "";

const monthLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: CALENDAR_TIME_ZONE,
});

const dayNumberFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  timeZone: CALENDAR_TIME_ZONE,
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: CALENDAR_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: CALENDAR_TIME_ZONE,
});

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getDateOnly(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getEventIdFromHash() {
  if (!window.location.hash.startsWith("#event-")) {
    return "";
  }

  return decodeURIComponent(window.location.hash.replace("#event-", ""));
}

function parseDateOnly(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameDay(firstDate, secondDate) {
  return getDateOnly(firstDate) === getDateOnly(secondDate);
}

function getDisplayEndDate(event) {
  return event.isAllDay ? addDays(event.end, -1) : event.end;
}

function stripDescription(description = "") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = description;
  return (wrapper.textContent || wrapper.innerText || "").trim();
}

function normalizeEvent(event) {
  const isAllDay = Boolean(event.start?.date);
  const start = isAllDay ? parseDateOnly(event.start.date) : new Date(event.start.dateTime);
  const endValue = event.end?.dateTime || event.end?.date || event.start?.dateTime || event.start?.date;
  const end = isAllDay ? parseDateOnly(endValue) : new Date(endValue);

  return {
    id: event.id,
    title: event.summary || "Merchant day",
    description: stripDescription(event.description),
    location: event.location || "",
    htmlLink: event.htmlLink || PUBLIC_CALENDAR_URL,
    isAllDay,
    start,
    end,
  };
}

function formatEventTime(event) {
  const displayEnd = getDisplayEndDate(event);

  if (event.isAllDay) {
    if (isSameDay(event.start, displayEnd)) {
      return `${fullDateFormatter.format(event.start)} · All day`;
    }

    return `${fullDateFormatter.format(event.start)} - ${fullDateFormatter.format(displayEnd)} · All day`;
  }

  if (isSameDay(event.start, event.end)) {
    return `${fullDateFormatter.format(event.start)} · ${timeFormatter.format(event.start)} - ${timeFormatter.format(event.end)}`;
  }

  return `${fullDateFormatter.format(event.start)}, ${timeFormatter.format(event.start)} - ${fullDateFormatter.format(event.end)}, ${timeFormatter.format(event.end)}`;
}

function formatCalendarDateTime(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatCalendarDate(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

function escapeCalendarText(value = "") {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function getIcsContent(event) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Philosotribe//Merchant Days//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeCalendarText(event.id)}@philosotribe.org`,
    `DTSTAMP:${formatCalendarDateTime(new Date())}`,
    `SUMMARY:${escapeCalendarText(event.title)}`,
  ];

  if (event.isAllDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatCalendarDate(event.start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatCalendarDate(event.end)}`);
  } else {
    lines.push(`DTSTART:${formatCalendarDateTime(event.start)}`);
    lines.push(`DTEND:${formatCalendarDateTime(event.end)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeCalendarText(event.location)}`);
  }

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeCalendarText(event.description)}`);
  }

  lines.push(`URL:${event.htmlLink}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

function getIcsDataUrl(event) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(getIcsContent(event))}`;
}

function getGoogleAddUrl(event) {
  const addUrl = new URL("https://calendar.google.com/calendar/render");
  const startDate = event.isAllDay ? formatCalendarDate(event.start) : formatCalendarDateTime(event.start);
  const endDate = event.isAllDay ? formatCalendarDate(event.end) : formatCalendarDateTime(event.end);

  addUrl.searchParams.set("action", "TEMPLATE");
  addUrl.searchParams.set("text", event.title);
  addUrl.searchParams.set("dates", `${startDate}/${endDate}`);
  addUrl.searchParams.set("ctz", CALENDAR_TIME_ZONE);

  if (event.description) {
    addUrl.searchParams.set("details", event.description);
  }

  if (event.location) {
    addUrl.searchParams.set("location", event.location);
  }

  return addUrl.toString();
}

function getEventFileName(event) {
  const eventDate = getDateOnly(event.start);
  const eventTitle = event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${eventDate}-${eventTitle || "merchant-day"}.ics`;
}

function eventOverlapsDay(event, day) {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = addDays(dayStart, 1);
  return event.start < dayEnd && event.end > dayStart;
}

function getEventsForDay(day) {
  return calendarEvents.filter((event) => eventOverlapsDay(event, day));
}

function getUpcomingEvents() {
  return calendarEvents
    .filter((event) => event.end >= nowDate)
    .sort((firstEvent, secondEvent) => firstEvent.start - secondEvent.start);
}

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function renderStatus(message, detail) {
  if (!calendarApp) {
    return;
  }

  selectedEventId = "";
  document.body.classList.remove("event-modal-open");
  calendarApp.innerHTML = "";
  const status = createElement("div", "calendar-status");
  status.append(createElement("h2", "", message));

  if (detail) {
    status.append(createElement("p", "", detail));
  }

  const calendarLink = createElement("a", "button button-primary", "Open Google Calendar");
  calendarLink.href = PUBLIC_CALENDAR_URL;
  calendarLink.target = "_blank";
  calendarLink.rel = "noreferrer";
  status.append(calendarLink);
  calendarApp.append(status);
}

function renderNextSale(upcomingEvents) {
  const banner = createElement("section", "next-sale-banner");

  if (!upcomingEvents.length) {
    banner.append(createElement("p", "eyebrow", "Next sale"));
    banner.append(createElement("h2", "", "No public merchant days are listed yet."));
    banner.append(createElement("p", "", "New sale dates will appear here after they are added to the public calendar."));
    return banner;
  }

  const nextEvent = upcomingEvents[0];
  const content = createElement("div");
  content.append(createElement("p", "eyebrow", "Next sale"));
  content.append(createElement("h2", "", nextEvent.title));
  content.append(createElement("p", "next-sale-time", formatEventTime(nextEvent)));

  if (nextEvent.location) {
    content.append(createElement("p", "next-sale-location", nextEvent.location));
  }

  if (nextEvent.description) {
    content.append(createElement("p", "next-sale-description", nextEvent.description));
  }

  const actions = createElement("div", "next-sale-actions");
  const eventLink = createElement("a", "button button-primary", "Open Event");
  eventLink.href = nextEvent.htmlLink;
  eventLink.target = "_blank";
  eventLink.rel = "noreferrer";
  actions.append(eventLink);

  banner.append(content, actions);
  return banner;
}

function selectEvent(eventId) {
  selectedEventId = eventId;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#event-${encodeURIComponent(eventId)}`);
  renderCalendar();

  const selectedDialog = document.querySelector("[data-selected-event]");
  selectedDialog?.focus();
}

function clearSelectedEvent() {
  selectedEventId = "";
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  renderCalendar();
}

function getSelectedEvent() {
  return calendarEvents.find((event) => event.id === selectedEventId);
}

function renderEventActions(event, className = "merchant-event-actions") {
  const actions = createElement("div", className);

  const googleLink = createElement("a", "button button-primary", "Add to Google");
  googleLink.href = getGoogleAddUrl(event);
  googleLink.target = "_blank";
  googleLink.rel = "noreferrer";
  actions.append(googleLink);

  const icsLink = createElement("a", "button button-secondary", "Download .ics");
  icsLink.href = getIcsDataUrl(event);
  icsLink.download = getEventFileName(event);
  actions.append(icsLink);

  if (event.location) {
    const directionsLink = createElement("a", "button button-secondary", "Directions");
    directionsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
    directionsLink.target = "_blank";
    directionsLink.rel = "noreferrer";
    actions.append(directionsLink);
  }

  return actions;
}

function renderSelectedEvent(selectedEvent) {
  if (!selectedEvent) {
    return null;
  }

  const overlay = createElement("div", "merchant-event-modal");
  overlay.setAttribute("role", "presentation");
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      clearSelectedEvent();
    }
  });

  const card = createElement("section", "merchant-selected-event");
  card.dataset.selectedEvent = selectedEvent.id;
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-labelledby", "selected-event-title");
  card.tabIndex = -1;

  const content = createElement("div", "merchant-selected-copy");
  content.append(createElement("p", "eyebrow", "Selected event"));
  const title = createElement("h2", "", selectedEvent.title);
  title.id = "selected-event-title";
  content.append(title);
  content.append(createElement("p", "merchant-event-time", formatEventTime(selectedEvent)));

  if (selectedEvent.location) {
    content.append(createElement("p", "merchant-event-location", selectedEvent.location));
  }

  if (selectedEvent.description) {
    content.append(createElement("p", "merchant-event-description", selectedEvent.description));
  }

  const closeButton = createElement("button", "calendar-icon-button selected-event-close", "Close");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close selected event details");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", () => {
    clearSelectedEvent();
  });

  card.append(content, renderEventActions(selectedEvent), closeButton);
  overlay.append(card);
  return overlay;
}

function renderToolbar() {
  const toolbar = createElement("div", "merchant-calendar-toolbar");
  const title = createElement("h2", "", monthLabelFormatter.format(visibleMonth));
  title.setAttribute("aria-live", "polite");

  const controls = createElement("div", "merchant-calendar-controls");
  const previousButton = createElement("button", "calendar-icon-button", "Previous");
  previousButton.type = "button";
  previousButton.setAttribute("aria-label", "Previous month");
  previousButton.textContent = "<";
  previousButton.addEventListener("click", () => {
    visibleMonth = addMonths(visibleMonth, -1);
    renderCalendar();
  });

  const todayButton = createElement("button", "calendar-text-button", "Today");
  todayButton.type = "button";
  todayButton.addEventListener("click", () => {
    visibleMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
    renderCalendar();
  });

  const nextButton = createElement("button", "calendar-icon-button", "Next");
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "Next month");
  nextButton.textContent = ">";
  nextButton.addEventListener("click", () => {
    visibleMonth = addMonths(visibleMonth, 1);
    renderCalendar();
  });

  controls.append(previousButton, todayButton, nextButton);
  toolbar.append(title, controls);
  return toolbar;
}

function renderMonthGrid() {
  const monthPanel = createElement("section", "merchant-month");
  monthPanel.setAttribute("aria-label", "Monthly merchant day calendar");

  const weekdays = createElement("div", "merchant-weekdays");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((dayName) => {
    weekdays.append(createElement("span", "", dayName));
  });

  const daysGrid = createElement("div", "merchant-days-grid");
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const gridStart = addDays(firstDay, -firstDay.getDay());

  for (let index = 0; index < 42; index += 1) {
    const day = addDays(gridStart, index);
    const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
    const isToday = isSameDay(day, nowDate);
    const dayEvents = getEventsForDay(day);
    const dayCell = createElement("article", "merchant-day");

    if (!isCurrentMonth) {
      dayCell.classList.add("muted-day");
    }

    if (isToday) {
      dayCell.classList.add("today");
    }

    if (dayEvents.length) {
      dayCell.classList.add("has-events");
    }

    dayCell.append(createElement("span", "merchant-day-number", dayNumberFormatter.format(day)));

    dayEvents.slice(0, 2).forEach((event) => {
      const eventButton = createElement("button", "merchant-day-chip", event.title);
      eventButton.type = "button";
      eventButton.title = `${event.title} - ${formatEventTime(event)}`;

      if (event.id === selectedEventId) {
        eventButton.classList.add("active");
      }

      eventButton.addEventListener("click", () => {
        selectEvent(event.id);
      });
      dayCell.append(eventButton);
    });

    if (dayEvents.length > 2) {
      dayCell.append(createElement("span", "merchant-more-count", `+${dayEvents.length - 2} more`));
    }

    daysGrid.append(dayCell);
  }

  monthPanel.append(weekdays, daysGrid);
  return monthPanel;
}

function renderEventCard(event) {
  const card = createElement("article", "merchant-event-card");
  card.append(createElement("h3", "", event.title));
  card.append(createElement("p", "merchant-event-time", formatEventTime(event)));

  if (event.location) {
    card.append(createElement("p", "merchant-event-location", event.location));
  }

  if (event.description) {
    card.append(createElement("p", "merchant-event-description", event.description));
  }

  const detailButton = createElement("button", "text-link merchant-detail-button", "View details");
  detailButton.type = "button";
  detailButton.addEventListener("click", () => {
    selectEvent(event.id);
  });

  card.append(detailButton);
  return card;
}

function renderUpcomingList(upcomingEvents) {
  const listPanel = createElement("aside", "merchant-event-list");
  const heading = createElement("div", "merchant-event-list-heading");
  heading.append(createElement("p", "eyebrow", "Upcoming"));
  heading.append(createElement("h2", "", "Sale dates"));
  listPanel.append(heading);

  if (!upcomingEvents.length) {
    listPanel.append(createElement("p", "care-empty", "No public merchant days are listed yet."));
    return listPanel;
  }

  upcomingEvents.slice(0, 10).forEach((event) => {
    listPanel.append(renderEventCard(event));
  });

  return listPanel;
}

function renderCalendar() {
  if (!calendarApp) {
    return;
  }

  const upcomingEvents = getUpcomingEvents();
  const selectedEvent = getSelectedEvent();

  if (!selectedEvent) {
    selectedEventId = "";
  }

  document.body.classList.toggle("event-modal-open", Boolean(selectedEvent));
  calendarApp.innerHTML = "";
  calendarApp.append(renderNextSale(upcomingEvents));

  const calendarSurface = createElement("div", "merchant-calendar-surface");
  calendarSurface.append(renderToolbar());

  const calendarBody = createElement("div", "merchant-calendar-body");
  calendarBody.append(renderMonthGrid(), renderUpcomingList(upcomingEvents));
  calendarSurface.append(calendarBody);
  calendarApp.append(calendarSurface);

  const selectedEventModal = renderSelectedEvent(selectedEvent);
  if (selectedEventModal) {
    calendarApp.append(selectedEventModal);
  }
}

async function loadCalendarEvents() {
  if (!calendarApp) {
    return;
  }

  renderStatus("Loading merchant days", "The public calendar is loading.");

  const timeMin = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(nowDate.getFullYear() + 1, nowDate.getMonth() + 1, 1).toISOString();
  const requestUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`);

  requestUrl.searchParams.set("key", CALENDAR_API_KEY);
  requestUrl.searchParams.set("timeMin", timeMin);
  requestUrl.searchParams.set("timeMax", timeMax);
  requestUrl.searchParams.set("singleEvents", "true");
  requestUrl.searchParams.set("orderBy", "startTime");
  requestUrl.searchParams.set("maxResults", "2500");
  requestUrl.searchParams.set("timeZone", CALENDAR_TIME_ZONE);

  try {
    const response = await fetch(requestUrl.toString());

    if (!response.ok) {
      throw new Error(`Calendar request failed with ${response.status}`);
    }

    const data = await response.json();
    calendarEvents = (data.items || [])
      .filter((event) => event.status !== "cancelled")
      .map(normalizeEvent)
      .sort((firstEvent, secondEvent) => firstEvent.start - secondEvent.start);

    const initialEventId = getEventIdFromHash();
    if (calendarEvents.some((event) => event.id === initialEventId)) {
      selectedEventId = initialEventId;
    }

    renderCalendar();
  } catch (error) {
    renderStatus(
      "Calendar dates could not load",
      "The public Google Calendar is still available from the link below."
    );
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && selectedEventId) {
    clearSelectedEvent();
  }
});

loadCalendarEvents();
