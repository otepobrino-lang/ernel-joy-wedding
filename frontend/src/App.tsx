
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import "./App.css";
import {
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  Menu,
  X,
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
      "Prov. Pros. Sixto Estudillo & Aida Bula Henshall",
      "Hon. Jose Ivan Dayan C. Agda & Rowena Agda",
      "Hon. Odelon Mabutin & Sally Rosales Tiu"
    ],
  },
  {
    title: "Secondary Sponsors",
    members: [
      "Pros. Eduardo Ang Jr., CPA & Karen Tiu Songo-Ang — Candle",
      "Tee Jay R. Tan & Evangeline Rose C. Tan— Veil",
      "Imelda Cristina C. Monsanto & German R. Monsanto III - Cord",
    ],
  },
  {
    title: "Flower Girls and Bearers",
    members: [
      "Liana Glynnis A. Rodriguez — Flower Girl",
      "Pia Aliah T. Ang — Flower Girl",
      "YJulianna Margaret T. Makinano — Flower Girl",
      "Jayden James M. Amo — Bible Bearer",
      "Elijah Zeke E. Rosales — Coin Bearer",
      "Edward Francis T. Ang — Ring Bearer",
      "Aaradhiya Ty Quial — Mini Groom",
      "Aaradhiya Ty Quial — Mini Bride",
    ],
  },
  {
    title: "Celebrants",
    members: ["Most Rev. Crispin B. Vasquez, D.D.", "Rev. Fr. Jan Michael J. Gadicho", "Rev. Fr. James B. Abella", 
      "Rev. Fr. Miel Sedfrey L. Nebrida", "Rev. Fr. Leroy R. Geli"],
  },
];
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

function App() {
  type Page = "landing" | "home" | "entourage" | "wedding-day" | "rsvp";
  const getPageFromHash = (): Page => {
    const value = window.location.hash.replace(/^#\/?/, "").toLowerCase();
    if (value === "entourage" || value === "wedding-day" || value === "rsvp" || value === "home") return value;
    return "landing";
  };
  const [activePage, setActivePage] = useState<Page>(getPageFromHash);
  const [showInvitation, setShowInvitation] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState("yes");
  const [message, setMessage] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncPage = () => setActivePage(getPageFromHash());
    window.addEventListener("popstate", syncPage);
    window.addEventListener("hashchange", syncPage);
    return () => {
      window.removeEventListener("popstate", syncPage);
      window.removeEventListener("hashchange", syncPage);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInvitation(true), 3600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activePage === "landing") return;
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
        ".save-date-message-panel",
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
          if (entry.isIntersecting) entry.target.classList.add("scroll-reveal-visible");
          else entry.target.classList.remove("scroll-reveal-visible");
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" },
    );
    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [activePage]);

  const navigate = (page: Page) => {
    window.history.pushState({}, "", page === "landing" ? window.location.pathname : `#/${page}`);
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleEnter = () => navigate("home");
  const handleLandingKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleEnter();
    }
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
      attendanceResponse: attendance === "yes" ? "attending" : "celebrating_from_afar",
      message: message.trim(),
      privacyConsent: true,
      website: "",
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          getErrorMessage(result) ?? "We couldn't submit your RSVP. Please check your details and try again.",
        );
      }
      setRsvpSubmitted(true);
    } catch (error) {
      setRsvpError(
        error instanceof Error ? error.message : "We couldn't connect to the RSVP service. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetRsvp = () => {
    setRsvpSubmitted(false);
    setRsvpError("");
  };

  const renderLanding = () => (
    <section
      className="wedding-hero wedding-landing-screen"
      aria-label="Ernel and Joy wedding invitation landing page. Activate to enter."
      role="button"
      tabIndex={0}
      onClick={handleEnter}
      onKeyDown={handleLandingKeyDown}
    >
      <video className="satin-background" autoPlay muted loop playsInline preload="auto" poster="/media/ej-monogram.png" aria-hidden="true">
        <source src="/media/red-satin.mp4" type="video/mp4" />
      </video>
      <div className="satin-overlay" aria-hidden="true" />
      <div className="satin-vignette" aria-hidden="true" />
      <div className="hero-frame" aria-hidden="true"><span className="frame-inner" /></div>
      <div className="hero-content">
        <p className="hero-eyebrow">Together with our families</p>
        <div className="monogram-stage">
          <h1 className="visually-hidden">Ernel and Joy — Wedding Invitation</h1>
          <div className="name name-ernel" aria-label="ERNEL">ERNEL</div>
          <div className="monogram-wrap">
            <img className="monogram-image" src="/media/ej-monogram.png" alt="E and J intertwined wedding monogram" fetchPriority="high" />
          </div>
          <div className="name name-joy" aria-label="JOY">JOY</div>
        </div>
        <div className="hero-identity-caption" aria-label="Wedding couple names and date">
          <p>ERNEL R. CHENG &amp; JERIC JOY TY QUIAL</p>
        </div>
        <div className={`hero-details ${showInvitation ? "details-visible" : ""}`}>
          <div className="gold-divider" aria-hidden="true"><span /><Heart size={15} strokeWidth={1.3} /><span /></div>
          <p className="invitation-title">Request the pleasure of your company</p>
          <p className="invitation-subtitle">As we begin our forever together</p>
          <button className="explore-button" onClick={(event) => { event.stopPropagation(); handleEnter(); }} type="button">
            <span>Discover our wedding</span><ArrowDown size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="hero-footer"><span>Ernel &amp; Joy</span><span className="footer-separator">✦</span><span>Our forever begins here</span></div>
      <div className="sound-note" aria-label="Background video is muted"><VolumeX size={13} strokeWidth={1.5} /><span>Silent film</span></div>
      <p className="landing-tap-hint">CLICK ANYWHERE TO ENTER</p>
    </section>
  );

  const renderNavigation = () => (
    <header className="wedding-site-header">
      <button className="site-brand" type="button" onClick={() => navigate("home")} aria-label="Return to wedding home">
        <span className="site-brand-monogram">E<span>&amp;</span>J</span>
      </button>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="wedding-site-nav"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        {mobileMenuOpen ? <X size={24} strokeWidth={1.8} /> : <Menu size={24} strokeWidth={1.8} />}
      </button>
      <nav id="wedding-site-nav" className={`wedding-site-nav ${mobileMenuOpen ? "mobile-menu-open" : ""}`} aria-label="Wedding pages">
        <button className={activePage === "home" ? "active" : ""} onClick={() => navigate("home")} type="button">Home</button>
        <button className={activePage === "entourage" ? "active" : ""} onClick={() => navigate("entourage")} type="button">Entourage</button>
        <button className={activePage === "wedding-day" ? "active" : ""} onClick={() => navigate("wedding-day")} type="button">Wedding Day</button>
        <button className={activePage === "rsvp" ? "active" : ""} onClick={() => navigate("rsvp")} type="button">RSVP</button>
      </nav>
    </header>
  );

  const renderEntouragePage = () => (
    <section className="entourage-section section-padding page-content-section" id="entourage">
      <div className="section-heading">
        <p className="section-eyebrow">Surrounded by love</p>
        <h2 className="section-title">Our Entourage</h2>
        <p className="section-description">The beloved family and friends who will stand beside us on our special day.</p>
      </div>
      <div className="entourage-grid">
        {entourageGroups.map((group) => (
          <article className="entourage-card" key={group.title}>
            <div className="entourage-heart"><Heart size={17} strokeWidth={1.2} /></div>
            <h3>{group.title}</h3><span className="entourage-rule" />
            <ul>{group.members.map((member) => <li key={member} style={{ textTransform: "none" }}>{member}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );

  const renderWeddingDayPage = () => (
    <section className="details-section section-padding page-content-section" id="wedding-details">
      <div className="section-heading">
        <p className="section-eyebrow">Please join us</p>
        <h2 className="section-title">The Wedding Day</h2>
        <p className="section-description">Two special places, one unforgettable celebration.</p>
      </div>
      <div className="venue-grid">
        <article className="venue-card">
          <div className="venue-image-wrap"><img className="venue-image" src="/media/church-venue.jpg" alt="Cathedral Parish of the Nativity of Our Lady" loading="lazy" /><span className="venue-image-label">The Ceremony</span></div>
          <div className="venue-content">
            <p className="venue-kicker">The Wedding Ceremony</p><h3>Cathedral Parish of the Nativity of Our Lady</h3>
            <p className="venue-location"><MapPin size={15} /> Borongan, Eastern Samar</p>
            <div className="venue-meta"><span><CalendarDays size={16} /> December 19, 2026</span><span><Clock3 size={16} /> 2:00 PM</span></div>
            <div className="venue-qr"><QRCodeSVG value={churchMapUrl} size={112} bgColor="#fff9ef" fgColor="#4a0018" level="H" /><p>Scan to find the church</p></div>
            <a className="map-link" href={churchMapUrl} target="_blank" rel="noreferrer">Open church location <span aria-hidden="true">↗</span></a>
          </div>
        </article>
        <article className="venue-card">
          <div className="venue-image-wrap"><img className="venue-image" src="/media/reception-venue.jpg" alt="Oikos Village Borongan reception venue" loading="lazy" /><span className="venue-image-label">The Reception</span></div>
          <div className="venue-content">
            <p className="venue-kicker">Dinner &amp; Celebration</p><h3>Oikos Village Borongan</h3>
            <p className="venue-location"><MapPin size={15} /> Borongan, Eastern Samar</p>
            <div className="venue-meta"><span><CalendarDays size={16} /> December 19, 2026</span><span><Clock3 size={16} /> 5:00 PM</span></div>
            <div className="venue-qr"><QRCodeSVG value={receptionMapUrl} size={112} bgColor="#fff9ef" fgColor="#4a0018" level="H" /><p>Scan to find the reception</p></div>
            <a className="map-link" href={receptionMapUrl} target="_blank" rel="noreferrer">Open reception location <span aria-hidden="true">↗</span></a>
          </div>
        </article>
        <article className="venue-card">
          <div className="venue-image-wrap"><img className="venue-image" src="/media/accommodation.png" alt="Travel and accommodation building in Borongan" loading="lazy" /><span className="venue-image-label">Prim &amp; Hotel</span></div>
          <div className="venue-content">
            <p className="venue-kicker">Travel &amp; Accommodation</p><h3>Prim &amp; Hotel</h3>
            <p className="venue-location"><MapPin size={15} /> G. Abogado St., Borongan, Eastern Samar, Philippines, 6800</p>
            <div className="venue-meta"><span><CalendarDays size={16} /> December 19, 2026</span><span><MapPin size={16} /> Borongan, Eastern Samar</span></div>
            <div className="venue-qr"><QRCodeSVG value={accommodationMapUrl} size={112} bgColor="#fff9ef" fgColor="#4a0018" level="H" /><p>Scan to find accommodation</p></div>
            <a className="map-link" href={accommodationMapUrl} target="_blank" rel="noreferrer">View accommodation location <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      </div>
      <DressCode />
    </section>
  );

  const renderRsvpPage = () => (
    <section className="rsvp-section section-padding rsvp-page-section" id="rsvp">
      <video className="rsvp-satin-background" autoPlay muted loop playsInline preload="auto" poster="/media/ej-monogram.png" aria-hidden="true">
        <source src="/media/red-satin.mp4" type="video/mp4" />
      </video>
      <div className="rsvp-satin-overlay" aria-hidden="true" />
      <div className="rsvp-card">
        {rsvpSubmitted ? (
          <div className="rsvp-success" role="status">
            <CheckCircle2 size={34} strokeWidth={1.4} /><h4>Thank you, {guestName.trim()}!</h4>
            <p>Your RSVP has been received. Thank you for sharing this special moment with us!</p>
            <button type="button" className="rsvp-reset" onClick={resetRsvp}>Review response</button>
          </div>
        ) : (
          <>
            <p className="section-eyebrow">Kindly respond</p><h3 className="rsvp-title">Will you celebrate with us?</h3>
            <p className="rsvp-description">Please let us know if you can join our special day.</p>
            <form className="rsvp-form" onSubmit={handleRsvp}>
              <label htmlFor="guest-name">Your full name</label>
              <input id="guest-name" name="fullName" type="text" autoComplete="name" required maxLength={100} value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Enter your full name" />
              <label htmlFor="attendance">Will you attend?</label>
              <select id="attendance" name="attendanceResponse" required value={attendance} onChange={(event) => setAttendance(event.target.value)}>
                <option value="yes">Joyfully accepts</option><option value="no">Regretfully declines</option>
              </select>
              <label htmlFor="guest-message">A message for the couple <span className="rsvp-optional">(optional)</span></label>
              <textarea id="guest-message" name="message" maxLength={500} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share your well wishes..." />
              {rsvpError && <p className="rsvp-error" role="alert">{rsvpError}</p>}
              <button type="submit" className="rsvp-submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit RSVP"}{!isSubmitting && <Heart size={15} />}</button>
              <p className="rsvp-demo-note">Your RSVP will be sent to our wedding RSVP service.</p>
            </form>
          </>
        )}
      </div>
    </section>
  );

  const renderHomePage = () => (
    <>
      <section className="wedding-collage-home" aria-label="Ernel and Joy wedding invitation">
        <div className="collage-envelope" aria-hidden="true">
          <img className="collage-envelope-art" src="/media/home-layout/open-envelope.png" alt="" />
          <figure className="collage-envelope-photo">
            <img src="/media/home-layout/prenup-02-romantic.png" alt="Ernel and Joy sharing a romantic moment" />
          </figure>
        </div>

        <section className="collage-welcome" aria-label="With love in our hearts">
          <img className="collage-welcome-art" src="/media/home-layout/welcome-plaque.png" alt="" />
          <div className="collage-welcome-copy">
            <p className="collage-welcome-eyebrow">With love in our hearts</p>
            <TypewriterWelcome />
          </div>
        </section>

        <div className="collage-polaroids" aria-label="Couple photographs">
          <img src="/media/home-layout/polaroid-pair.png" alt="Two Polaroid photographs of Ernel and Joy" />
        </div>

        <button className="collage-rsvp" type="button" onClick={() => navigate("rsvp")} aria-label="Open the RSVP page">
          <img src="/media/home-layout/rsvp-envelope.png" alt="Burgundy RSVP envelope with champagne-gold details" />
        </button>

        <button className="collage-details" type="button" onClick={() => navigate("wedding-day")} aria-label="View The Wedding Day details">
          <img src="/media/home-layout/details-plaque.png" alt="The Details ornamental burgundy plaque" />
        </button>

        <div className="collage-entourage" role="link" tabIndex={0} aria-label="Open the Entourage page" onClick={() => navigate("entourage")} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); navigate("entourage"); } }}>
          <img className="collage-entourage-art" src="/media/home-layout/entourage-frame.png" alt="Entourage plaque with two Polaroid photographs of Ernel and Joy" />
          <button className="collage-entourage-photo collage-entourage-photo-one" type="button" aria-label="View the first couple photograph and entourage" onClick={(event) => { event.stopPropagation(); navigate("entourage"); }} />
          <button className="collage-entourage-photo collage-entourage-photo-two" type="button" aria-label="View the second couple photograph and entourage" onClick={(event) => { event.stopPropagation(); navigate("entourage"); }} />
        </div>

        <button className="collage-wax-seal" type="button" onClick={() => navigate("home")} aria-label="Return to the wedding home">
          <img src="/media/home-layout/wax-seal-sprig.png" alt="" />
        </button>

        <img className="collage-flower-stamps" src="/media/home-layout/flower-stamps.png" alt="Two vintage floral postage stamps" />

      </section>

      <section className="countdown-section section-padding" id="countdown">
        <div className="section-heading"><p className="section-eyebrow">Counting down to forever</p><h2 className="section-title">Until We Say “I Do”</h2><p className="section-description">We would be honored to celebrate this day with you.</p></div>
        <Countdown />
      </section>
    </>
  );

  if (activePage === "landing") return <main className="wedding-page">{renderLanding()}</main>;

  return (
    <main className="wedding-page wedding-main-site">
      {renderNavigation()}
      {activePage === "home" && renderHomePage()}
      {activePage === "entourage" && renderEntouragePage()}
      {activePage === "wedding-day" && renderWeddingDayPage()}
      {activePage === "rsvp" && renderRsvpPage()}
      <footer className="wedding-text-footer">
        <p className="footer-couple-name">ERNEL &amp; JOY</p>
        <p>December 19, 2026 <span>·</span> Borongan, Eastern Samar</p>
        <p className="footer-closing-line">With love, and gratitude for being part of our beginning.</p>
      </footer>
    </main>
  );
}

export default App;
