
import { useEffect, useState, type FormEvent } from "react";
import "./App.css";
import {
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  VolumeX,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
).replace(/\/+$/, "");
const WEDDING_DATE = new Date("2026-12-19T14:00:00+08:00").getTime();
const churchMapUrl =
  "https://www.google.com/maps/search/?api=1&query=Cathedral+Parish+of+the+Nativity+of+Our+Lady+Borongan+Eastern+Samar";
const receptionMapUrl =
  "https://www.google.com/maps/search/?api=1&query=Oikos+Village+Borongan+Eastern+Samar";
const accommodationMapUrl =
  "https://maps.app.goo.gl/otayczNfT4wwWb1z7";
const entourageGroups = [
  {
    title: "Maid and Matron of Honor",
    members: [
      "Jeric Jane Ty Quial — Maid of Honor",
      "Irah Adelita T. Makinano — Matron of Honor",
      "Gloria B. Cheng — Matron of Honor",
    ],
  },
  {
    title: "Best Man and Men of Honor",
    members: [
      "Teofil Y. Rediang, CPA — Best Man",
      "Julius D. Makinano — Man of Honor",
      "Erich R. Cheng — Man of Honor",
    ],
  },
  {
    title: "Bridesmaid/Bridesmen",
    members: [
    "Dra. Jhea Allyza B. Quial",
    "Dra. Melanie C. Chicano",
    "Sarah Chua Co",
    "Renz Kimberly E. Camargo",
    "Nikki Jean S. Obrino",
    "Princess May P. Corpuz",
    "Kim Andrea Ty Lee Tan Be",
    "Kaye Vicenta Felize T. Ang",
    "Miyben Antonette Q. Ladera",
    "Danella Yvette B. Cheng",
    "Genes R. Paciencia",
    "Elbert Q. Rodriguez, Jr."
    ],
  },
  {
    title: "Groomsmen",
    members: [
      "James Vergel L. Biliran",
      "Anthony B. Cepeda",
      "Conrad Q. Tabanao",
      "Joseph Mikhail M. Erot",
      "Atty. Michael Noel D. Obrino, CPA",
      "Dave Erwin B. Cheng",
      "Sebastian Cheng",
      "Jared Matthew T. Makinano",
      "Derrick C. Quial",
      "Dean Earnest B. Cheng"
    ],
  },
  {
    title: "Principal Sponsors",
    members: [
      "Leo Ty Quial & Mary Grace C. Quial",
      "Minda Nerissa Q. Ladera & Ruben C. Ladera",
      "Zenaida B. Quial & Jessie Alberto Ty Quial",
      "Crisanto A. Lim & Ma. Lina Q. Lim",
      "Romeo Ty Quial & Eva L. Quial",
      "Gilberto Ty Quial & Teresa C. Quial",
      "Tomas Rosales & Amor Rosales",
      "Alona Q. Carzon & Adelito C. Carzon",
      "Atty. Fidel Amacna & Fe Ann I. Amacna",
      "Dir. Max Aljibe & Ma. Fe Abunda",
      "Hon. Jose Ivan Dayan C. Agda & Rowena Agda",
      "Hon. Odelon Mabutin & Sally Rosales Tiu",
      "Prov. Pros. Sixto Estudillo & Aida Bula Henshall"
    ],
  },
  {
    title: "Secondary Sponsors",
    members: [
      "Pros. Eduardo Ang Jr., CPA & Karen Tiu Songo-Ang — CANDLE",
      "	Tee Jay R. Tan & Evangeline Rose C. Tan— VEIL",
      "Imelda Cristina C. Monsanto & German R. Monsanto III - CORD",
    ],
  },
  {
    title: "Flower Girls and Bearers",
    members: [
      "Liana Glynnis A. Rodriguez — Flower Girl",
      "Pia Aliah T. Ang — Flower Girl",
      "Julianna Margaret T. Makinano — Flower Girl",
      "Jayden James M. Amo — Bible Bearer",
      "Elijah Zeke E. Rosales — Coin Bearer",
      "Edward Francis T. Ang — Ring Bearer",
      "Aaradhiya Ty Quial — Mini Groom",
      "Faye Yvette C. Cheng — Mini Bride",
    ],
  },
  {
    title: "Celebrants",
    members: ["Most Rev. Crispin B. Vasquez, D.D.", "Rev. Fr. Jan Michael J. Gadicho", "Rev. Fr. James B. Abella", 
      "Rev. Fr. Miel Sedfrey L. Nebrida", "Rev. Fr. Leroy R. Geli"],
  },
];
const prenupPhotos = {
  opening: "/media/prenup-01-embraced.png",
  welcome: "/media/prenup-02-romantic.png",
  entourage: "/media/prenup-03-ceremonial.png",
  venues: "/media/prenup-04-regal.png",
  rsvp: "/media/prenup-05-traditional.png",
  closing: "/media/prenup-06-crimson.png",
};
type CountdownValues = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};
function calculateCountdown(): CountdownValues {
  const difference = Math.max(0, WEDDING_DATE - Date.now());
  return {
    
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    finished: difference <= 0,
  };
}
const WELCOME_MESSAGE = "With grateful hearts and a promise for forever, we invite you to share in the blessing of our wedding day. Together with our families, we would love for you to witness our vows and enjoy the celebration as we step into this chapter. Having you by our side means everything!";

function TypewriterWelcome() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const target = document.getElementById("welcome-message");
    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisibleCharacters(WELCOME_MESSAGE.length);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted || visibleCharacters >= WELCOME_MESSAGE.length) return;
    const timer = window.setTimeout(() => {
      setVisibleCharacters((current) => Math.min(current + 1, WELCOME_MESSAGE.length));
    }, 27);
    return () => window.clearTimeout(timer);
  }, [hasStarted, visibleCharacters]);

  return (
    <p className="welcome-copy welcome-typewriter" id="welcome-message" aria-label={WELCOME_MESSAGE}>
      <span aria-hidden="true">{WELCOME_MESSAGE.slice(0, visibleCharacters)}</span>
      {visibleCharacters < WELCOME_MESSAGE.length && hasStarted && (
        <span className="typewriter-caret" aria-hidden="true" />
      )}
    </p>
  );
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(calculateCountdown);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(calculateCountdown());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];
  return (
    <div className="countdown-wrap">
      {timeLeft.finished ? (
        <p className="countdown-finished">
          Today marks the beginning of our forever.
        </p>
      ) : (
        <div
          className="countdown-grid"
          aria-label="Countdown to the wedding"
        >
          {units.map((unit) => (
            <div className="countdown-unit" key={unit.label}>
              <span className="countdown-number">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="countdown-label">{unit.label}</span>
            </div>
          ))}
        </div>
      )}
      <p className="countdown-date">
        December 19, 2026 <span>·</span> 2:00 PM Philippine Time
      </p>
    </div>
  );
}
function getErrorMessage(result: unknown): string | null {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }
  if (
    typeof result === "object" &&
    result !== null &&
    "message" in result &&
    typeof result.message === "string"
  ) {
    return result.message;
  }
  return null;
}
function DressCode() {
  return (
    <section
      className="dress-code-section section-padding"
      id="dress-code"
      style={{ background: "#fffaf1", color: "#31000f" }}
    >
      <div className="section-heading" style={{ color: "#31000f" }}>
        <p className="section-eyebrow" style={{ color: "#31000f" }}>Dressed for the celebration</p>
        <h2 className="section-title" style={{ color: "#31000f" }}>Wedding Dress Code</h2>
        <p className="section-description" style={{ color: "#31000f" }}>
          “To keep our photos cohesive, please avoid 
          wearing red, gold, champagne, beige, black, and white.”.
        </p>
      </div>
      <div
        className="dress-code-image-wrap"
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src="/media/wedding-dress-code.png"
          alt="Wedding dress code guide for Ernel and Joy's wedding"
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </section>
  );
}

function SaveTheDate() {
  const year = 2026;
  const monthIndex = 11;
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => 0),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <section className="save-date-section section-padding" id="save-the-date">
      <div className="save-date-frame save-date-calendar-layout">
        <div className="save-date-photo-panel">
          <span className="save-date-tape save-date-tape-top" aria-hidden="true" />
          <img
            className="save-date-couple-photo"
            src={prenupPhotos.welcome}
            alt="Ernel and Joy together in their prenup portrait"
            loading="lazy"
          />
          <span className="save-date-photo-caption" aria-hidden="true" />
          <span className="save-date-tape save-date-tape-bottom" aria-hidden="true" />
        </div>
        <div className="save-date-calendar-panel">
          <p className="save-date-heading">SAVE THE DATE</p>
          <p className="save-date-month">DECEMBER 19, 2026</p>
          <div className="save-date-calendar" role="img" aria-label="December 2026 calendar with December 19 circled">
            {weekdays.map((day) => (
              <span className="save-date-weekday" key={day}>{day}</span>
            ))}
            {calendarCells.map((day, index) =>
              day === 0 ? (
                <span className="save-date-calendar-empty" key={`empty-${index}`} aria-hidden="true" />
              ) : (
                <span
                  className={`save-date-calendar-day ${day === 19 ? "save-date-wedding-day" : ""}`}
                  key={day}
                  aria-label={day === 19 ? "December 19, wedding day" : `December ${day}, ${year}`}
                >
                  {day}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
function App() {
  const [showInvitation, setShowInvitation] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState("yes");
  const [message, setMessage] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setShowInvitation(true), 3600);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll<HTMLElement>(
      [
        ".welcome-section",
        ".photo-collage-section .section-heading",
        ".photo-collage-item",
        ".entourage-section .section-heading",
        ".entourage-card",
        ".details-section .section-heading",
        ".venue-card",
        ".dress-code-section .section-heading",
        ".dress-code-image-wrap",
        ".countdown-section .section-heading",
        ".countdown-unit",
        ".countdown-date",
        ".save-date-photo-panel",
        ".save-date-calendar-panel",
        ".rsvp-card",
      ].join(","),
    );

    if (reduceMotion) {
      targets.forEach((element) => element.classList.add("scroll-reveal-visible"));
      return;
    }

    targets.forEach((element) => {
      element.classList.add("scroll-reveal");
      const siblingIndex = element.parentElement
        ? Array.from(element.parentElement.children).indexOf(element)
        : 0;
      element.style.setProperty("--reveal-delay", `${Math.min(siblingIndex * 70, 280)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-reveal-visible");
          } else {
            entry.target.classList.remove("scroll-reveal-visible");
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    targets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
  const handleExplore = () => {
    document.getElementById("welcome")?.scrollIntoView({
      behavior: "smooth",
    });
  };
  const handleRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!guestName.trim()) {
      setRsvpError("Please enter your full name.");
      return;
    }
    setIsSubmitting(true);
    setRsvpError("");
    const payload = {
      fullName: guestName.trim(),
      attendanceResponse:
        attendance === "yes" ? "attending" : "celebrating_from_afar",
      message: message.trim(),
      privacyConsent: true,
      website: "",
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          getErrorMessage(result) ??
            "We couldn't submit your RSVP. Please check your details and try again.",
        );
      }
      setRsvpSubmitted(true);
    } catch (error) {
      setRsvpError(
        error instanceof Error
          ? error.message
          : "We couldn't connect to the RSVP service. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetRsvp = () => {
    setRsvpSubmitted(false);
    setRsvpError("");
  };
  return (
    <main className="wedding-page">
      <section
        className="wedding-hero"
        aria-label="Ernel and Joy wedding introduction"
      >
        <video
          className="satin-background"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/media/ej-monogram.png"
          aria-hidden="true"
        >
          <source src="/media/red-satin.mp4" type="video/mp4" />
        </video>
        <div className="satin-overlay" aria-hidden="true" />
        <div className="satin-vignette" aria-hidden="true" />
        <div className="hero-frame" aria-hidden="true">
          <span className="frame-inner" />
        </div>
        <div className="hero-content">
          <p className="hero-eyebrow">Together with our families</p>
          <div className="monogram-stage">
            <h1 className="visually-hidden">
              Ernel and Joy — Wedding Invitation
            </h1>
            <div className="name name-ernel" aria-label="ERNEL">
              ERNEL
            </div>
            <div className="monogram-wrap">
              <img
                className="monogram-image"
                src="/media/ej-monogram.png"
                alt="E and J intertwined wedding monogram"
                fetchPriority="high"
              />
            </div>
            <div className="name name-joy" aria-label="JOY">
              JOY
            </div>
          </div>
          <div className="hero-identity-caption" aria-label="Wedding couple names and date">
            <p>ERNEL R. CHENG &amp; JERIC JOY TY QUAIL</p>
          </div>
          <div
            className={`hero-details ${
              showInvitation ? "details-visible" : ""
            }`}
          >
            <div className="gold-divider" aria-hidden="true">
              <span />
              <Heart size={15} strokeWidth={1.3} />
              <span />
            </div>
            <p className="invitation-title">
              Request the pleasure of your company
            </p>
            <p className="invitation-subtitle">
              As we begin our forever together
            </p>
            <button
              className="explore-button"
              onClick={handleExplore}
              type="button"
            >
              <span>Discover our wedding</span>
              <ArrowDown size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="hero-footer">
          <span>Ernel &amp; Joy</span>
          <span className="footer-separator">✦</span>
          <span>Our forever begins here</span>
        </div>
        <div className="sound-note" aria-label="Background video is muted">
          <VolumeX size={13} strokeWidth={1.5} />
          <span>Silent film</span>
        </div>
      </section>
      <section className="welcome-section section-padding" id="welcome">
        <div className="section-ornament">
          <Heart size={18} />
        </div>
        <p className="section-eyebrow">With love in our hearts</p>
        <h2 className="section-title">A beautiful beginning</h2>
        <TypewriterWelcome />
        <p className="script-signature">With love, Ernel &amp; Joy</p>
      </section>
      <section className="photo-collage-section section-padding" id="our-photos">
        <div className="section-heading">
          <p className="section-eyebrow">Little moments, forever memories</p>
          <h2 className="section-title">A Glimpse of Us</h2>
          <p className="section-description">
            A few moments from our journey, gathered with love as we look forward to our wedding day.
          </p>
        </div>
        <div className="photo-collage-grid">
          {[
            { src: prenupPhotos.opening, alt: "Ernel and Joy sharing a moment together", className: "collage-photo-tall" },
            { src: prenupPhotos.welcome, alt: "A romantic prenup moment of Ernel and Joy", className: "collage-photo-wide" },
            { src: prenupPhotos.entourage, alt: "Ernel and Joy in their wedding attire", className: "collage-photo-small" },
            { src: prenupPhotos.venues, alt: "A portrait from Ernel and Joy's prenup session", className: "collage-photo-small" },
            { src: prenupPhotos.rsvp, alt: "Ernel and Joy in traditional attire", className: "collage-photo-wide" },
            { src: prenupPhotos.closing, alt: "Ernel and Joy's crimson-themed prenup portrait", className: "collage-photo-tall" },
          ].map((photo, index) => (
            <figure className={`photo-collage-item ${photo.className} polaroid-${index + 1}`} key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} />
              <span className="photo-clothespin" aria-hidden="true" />
            </figure>
          ))}
        </div>
      </section>
      <section className="entourage-section section-padding" id="entourage">
        <div className="section-heading">
          <p className="section-eyebrow">Surrounded by love</p>
          <h2 className="section-title">Our Entourage</h2>
          <p className="section-description">
            The beloved family and friends who will stand beside us on our
            special day.
          </p>
        </div>
        <div className="entourage-grid">
          {entourageGroups.map((group) => (
            <article className="entourage-card" key={group.title}>
              <div className="entourage-heart">
                <Heart size={17} strokeWidth={1.2} />
              </div>
              <h3>{group.title}</h3>
              <span className="entourage-rule" />
              <ul>
                {group.members.map((member) => (
                  <li key={member} style={{ textTransform: "none" }}>{member}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section
        className="details-section section-padding"
        id="wedding-details"
      >
        <div className="section-heading">
          <p className="section-eyebrow">Please join us</p>
          <h2 className="section-title">The Wedding Day</h2>
          <p className="section-description">
            Two special places, one unforgettable celebration.
          </p>
        </div>
        <div className="venue-grid">
          <article className="venue-card">
            <div className="venue-image-wrap">
              <img
                className="venue-image"
                src="/media/church-venue.jpg"
                alt="Cathedral Parish of the Nativity of Our Lady"
                loading="lazy"
              />
              <span className="venue-image-label">The Ceremony</span>
            </div>
            <div className="venue-content">
              <p className="venue-kicker">The Wedding Ceremony</p>
              <h3>Cathedral Parish of the Nativity of Our Lady</h3>
              <p className="venue-location">
                <MapPin size={15} /> Borongan, Eastern Samar
              </p>
              <div className="venue-meta">
                <span>
                  <CalendarDays size={16} /> December 19, 2026
                </span>
                <span>
                  <Clock3 size={16} /> 2:00 PM
                </span>
              </div>
              <div className="venue-qr">
                <QRCodeSVG
                  value={churchMapUrl}
                  size={112}
                  bgColor="#fff9ef"
                  fgColor="#4a0018"
                  level="H"
                />
                <p>Scan to find the church</p>
              </div>
              <a
                className="map-link"
                href={churchMapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open church location <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
          <article className="venue-card">
            <div className="venue-image-wrap">
              <img
                className="venue-image"
                src="/media/reception-venue.jpg"
                alt="Oikos Village Borongan reception venue"
                loading="lazy"
              />
              <span className="venue-image-label">The Reception</span>
            </div>
            <div className="venue-content">
              <p className="venue-kicker">Dinner &amp; Celebration</p>
              <h3>Oikos Village Borongan</h3>
              <p className="venue-location">
                <MapPin size={15} /> Borongan, Eastern Samar
              </p>
              <div className="venue-meta">
                <span>
                  <CalendarDays size={16} /> December 19, 2026
                </span>
                <span>
                  <Clock3 size={16} /> 5:00 PM
                </span>
              </div>
              <div className="venue-qr">
                <QRCodeSVG
                  value={receptionMapUrl}
                  size={112}
                  bgColor="#fff9ef"
                  fgColor="#4a0018"
                  level="H"
                />
                <p>Scan to find the reception</p>
              </div>
              <a
                className="map-link"
                href={receptionMapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open reception location <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
          <article className="venue-card">
            <div className="venue-image-wrap">
              <img
                className="venue-image"
                src="/media/accommodation.png"
                alt="Prim Hotel in Borongan"
                loading="lazy"
              />
              <span className="venue-image-label">Prim &amp; Hotel</span>
            </div>
            <div className="venue-content">
              <p className="venue-kicker">Prim &amp; Hotel</p>
              <h3>Travel &amp; Accommodation</h3>
              <p className="venue-location">
                <MapPin size={15} /> G. Abogado St., Borongan, Eastern Samar, Philippines, 6800
              </p>
              <div className="venue-meta">
                <span>
                  <CalendarDays size={16} /> December 19, 2026
                </span>
                <span>
                  <MapPin size={16} /> Borongan, Eastern Samar
                </span>
              </div>
              <div className="venue-qr">
                <QRCodeSVG
                  value={accommodationMapUrl}
                  size={112}
                  bgColor="#fff9ef"
                  fgColor="#4a0018"
                  level="H"
                />
                <p>Scan to find accommodation</p>
              </div>
              <a
                className="map-link"
                href={accommodationMapUrl}
                target="_blank"
                rel="noreferrer"
              >
                View accommodation location <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </section>
      <DressCode />
      <section className="countdown-section section-padding" id="countdown">
        <div className="section-heading">
          <p className="section-eyebrow">Counting down to forever</p>
          <h2 className="section-title">Until We Say “I Do”</h2>
          <p className="section-description">
            We would be honored to celebrate this day with you.
          </p>
        </div>
        <Countdown />
      </section>
      <SaveTheDate />
      <section className="rsvp-section section-padding rsvp-final-section rsvp-animated-background" id="rsvp">
        <video
          className="satin-background"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/media/red-satin.mp4" type="video/mp4" />
        </video>
        <div className="satin-overlay" aria-hidden="true" />
        <div className="satin-vignette" aria-hidden="true" />
        <div className="rsvp-card">
          {rsvpSubmitted ? (
            <div className="rsvp-success" role="status">
              <CheckCircle2 size={34} strokeWidth={1.4} />
              <h4>Thank you, {guestName.trim()}!</h4>
              <p>
                Your RSVP has been received. Thank you for sharing this
                special moment with us!
              </p>
              <button
                type="button"
                className="rsvp-reset"
                onClick={resetRsvp}
              >
                Review response
              </button>
            </div>
          ) : (
            <>
              <p className="section-eyebrow">Kindly respond</p>
              <h3 className="rsvp-title">Will you celebrate with us?</h3>
              <p className="rsvp-description">
                Please let us know if you can join our special day.
              </p>
              <form className="rsvp-form" onSubmit={handleRsvp}>
              <label htmlFor="guest-name">Your full name</label>
              <input
                id="guest-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Enter your full name"
              />
              <label htmlFor="attendance">Will you attend?</label>
              <select
                id="attendance"
                name="attendanceResponse"
                required
                value={attendance}
                onChange={(event) => setAttendance(event.target.value)}
              >
                <option value="yes">Joyfully accepts</option>
                <option value="no">Regretfully declines</option>
              </select>
              <label htmlFor="guest-message">
                A message for the couple{" "}
                <span className="rsvp-optional">(optional)</span>
              </label>
              <textarea
                id="guest-message"
                name="message"
                maxLength={500}
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share your well wishes..."
              />
              {rsvpError && (
                <p className="rsvp-error" role="alert">
                  {rsvpError}
                </p>
              )}
              <button
                type="submit"
                className="rsvp-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit RSVP"}
                {!isSubmitting && <Heart size={15} />}
              </button>
              <p className="rsvp-demo-note">
                Your RSVP will be sent to our wedding RSVP service.
              </p>
            
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
export default App;
