document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initFilters();
  initTripNote();
  initEnquiry();
  initGallery();
});

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    const target = event.target;
    if (target instanceof Element && target.closest(".nav-toggle, .site-nav")) return;
    closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

function initFilters() {
  const pills = [...document.querySelectorAll(".pill")];
  const cards = [...document.querySelectorAll("[data-place]")];
  const empty = document.querySelector(".empty");
  if (!pills.length || !cards.length) return;

  const params = new URLSearchParams(window.location.search);
  let place = params.get("place") || "";

  const draw = () => {
    const region = pills.find((pill) => pill.classList.contains("is-on"))?.dataset.region || "all";
    let shown = 0;
    cards.forEach((card) => {
      const placeOk = !place || card.dataset.place === place;
      const regionOk = region === "all" || card.dataset.region === region;
      const visible = placeOk && regionOk;
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    if (empty) {
      empty.classList.toggle("is-on", shown === 0);
    }
    const count = document.querySelector("[data-count]");
    if (count) {
      const noun = shown === 1 ? count.dataset.one : count.dataset.many;
      count.textContent = noun ? `${shown} ${noun}` : String(shown);
    }
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      place = "";
      pills.forEach((item) => item.classList.remove("is-on"));
      pill.classList.add("is-on");
      pill.setAttribute("aria-pressed", "true");
      pills.filter((item) => item !== pill).forEach((item) => item.setAttribute("aria-pressed", "false"));
      draw();
    });
  });

  draw();
}

function initTripNote() {
  const note = document.querySelector("[data-trip-note]");
  if (!note) return;
  const params = new URLSearchParams(window.location.search);
  const bits = [];
  if (params.get("place")) bits.push(labelFor(params.get("place")));
  if (params.get("date")) bits.push(params.get("date"));
  if (params.get("travelers")) bits.push(`${params.get("travelers")} travelers`);
  if (!bits.length) return;
  const query = new URLSearchParams();
  if (params.get("place")) query.set("destination", params.get("place"));
  if (params.get("date")) query.set("departure", params.get("date"));
  if (params.get("travelers")) query.set("travelers", params.get("travelers"));
  note.hidden = false;
  note.innerHTML = `Planning for ${bits.join(" · ")}. <a href="contact.html?${query.toString()}">Continue to the enquiry form</a> when a place feels right.`;
}

function labelFor(id) {
  const names = {
    ghana: "Ghana",
    kenya: "Kenya",
    morocco: "Morocco",
    zanzibar: "Zanzibar",
    santorini: "Santorini",
    egypt: "Egypt",
    japan: "Japan",
    italy: "Italy"
  };
  return names[id] || id;
}

function initEnquiry() {
  const form = document.querySelector("#enquiry");
  if (!form) return;
  const thanks = document.querySelector("#thanks");
  const params = new URLSearchParams(window.location.search);
  const asking = document.querySelector("#asking");

  if (params.get("destination") && form.elements.destination) {
    form.elements.destination.value = params.get("destination");
  }
  if (params.get("departure") && form.elements.departure) {
    form.elements.departure.value = params.get("departure");
  }
  if (params.get("package") && asking) {
    asking.hidden = false;
    asking.textContent = `You're asking about ${params.get("package")}.`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;
    form.querySelectorAll(".error").forEach((node) => {
      node.textContent = "";
    });

    ["name", "email", "phone", "destination", "departure", "message"].forEach((name) => {
      const field = form.elements[name];
      const error = form.querySelector(`[data-error-for="${name}"]`);
      if (field && !String(field.value).trim()) {
        valid = false;
        if (error) error.textContent = "This field is required.";
      }
    });

    const email = form.elements.email;
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      valid = false;
      const error = form.querySelector('[data-error-for="email"]');
      if (error) error.textContent = "Enter a valid email address.";
    }

    const departure = form.elements.departure;
    const returning = form.elements.return;
    if (departure && returning && departure.value && returning.value && returning.value < departure.value) {
      valid = false;
      const error = form.querySelector('[data-error-for="return"]');
      if (error) error.textContent = "Return should be on or after departure.";
    }

    if (!valid) return;

    const payload = Object.fromEntries(new FormData(form).entries());
    const reference = `FH-${Math.floor(1000 + Math.random() * 9000)}`;
    const saved = JSON.parse(localStorage.getItem("flyhigh.enquiries") || "[]");
    saved.push({ ...payload, reference, savedAt: new Date().toISOString() });
    localStorage.setItem("flyhigh.enquiries", JSON.stringify(saved));

    form.hidden = true;
    if (thanks) {
      thanks.classList.add("is-on");
      thanks.querySelector("[data-name]").textContent = payload.name.split(" ")[0];
      thanks.querySelector("[data-ref]").textContent = reference;
    }
  });
}

function initGallery() {
  const button = document.querySelector("[data-pause]");
  const track = document.querySelector(".reel-track");
  if (!button || !track) return;
  button.addEventListener("click", () => {
    const paused = track.classList.toggle("is-paused");
    button.setAttribute("aria-pressed", String(paused));
    button.textContent = paused ? "Play gallery" : "Pause gallery";
  });
}
