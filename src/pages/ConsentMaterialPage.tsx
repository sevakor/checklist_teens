import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppMenu } from "../components/AppMenu";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const consentSections = [
  { id: "consent-components", label: "5 складових згоди" },
  { id: "checking-consent", label: "Як запитувати й перевіряти згоду" },
  { id: "declining-consent", label: "Якщо відмовляєшся ти" },
  { id: "receiving-decline", label: "Якщо відмовили тобі" },
] as const;

type ConsentSectionId = (typeof consentSections)[number]["id"];

const consentPrinciples = [
  {
    title: "1. Вільна й добровільна",
    paragraphs: [
      "Згода є справжньою лише тоді, коли людина може безпечно сказати і «так», і «ні». Її не можна отримати тиском, погрозами, обманом, шантажем, почуттям провини або нескінченними вмовляннями",
      "Фрази на кшталт «якби ти мене любив/ла…», «усі це вже роблять», «ти ж обіцяв/ла» або погрози розривом стосунків — це тиск, а не шлях до згоди",
    ],
  },
  {
    title: "2. Чітка й поінформована",
    paragraphs: [
      "Людина має розуміти, на що саме погоджується, і мати важливу для рішення інформацію. Згода на одну дію не означає згоди на іншу: поцілунок не є згодою на секс, а згода на секс з презервативом не є згодою на секс без нього",
      "Навіть якщо людина раніше вже на щось погоджувалася, про згоду потрібно запитати знову",
    ],
  },
  {
    title: "3. Активна й висловлена",
    paragraphs: [
      "Згоду має бути видно або чутно в словах і діях людини. Мовчання або те, що людина не сказала «ні», не означає «так». Вагання, невпевненість, завмирання, відстороненість або невідповідність між словами й мовою тіла — привід зупинитися і перепитати",
      "Згода не обов’язково має звучати формально. «Так, я хочу», «мені це подобається» або «продовжуй» — це зрозумілі способи її висловити",
    ],
  },
  {
    title: "4. Постійна й взаємна",
    paragraphs: [
      "Згода — це не одне «так» на початку, а постійний спільний процес. Кожен може передумати будь-якої миті: навіть якщо сам був ініціатором, раніше казав «так», вже роздягнувся або близькість уже почалася. Причину пояснювати не потрібно",
      "Усі залучені мають хотіти цієї взаємодії. Якщо хоч одна людина не погоджується або хоче зупинитися, потрібно зупинитися",
    ],
  },
  {
    title: "5. Можлива й усвідомлена",
    paragraphs: [
      "Людина має бути здатною зрозуміти, що відбувається, прийняти рішення і повідомити про нього. Не може дати згоду людина, яка спить, непритомна або перебуває під таким сильним впливом алкоголю чи інших речовин, що не розуміє ситуації або не може чітко висловитися",
      "Здатність дати згоду залежить також від віку та обставин, адже закон встановлює вік сексуальної згоди. Якщо людина не може чітко відповісти або немає впевненості, що вона здатна погодитися, будь-яку сексуальну взаємодію потрібно відкласти",
    ],
  },
] as const;

function ConsentPrinciplesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const position = activeIndex + 1;

  return (
    <div
      aria-label="П’ять складових згоди"
      aria-roledescription="карусель"
      className="consent-carousel"
      role="region"
    >
      <div className="consent-carousel-progress-row">
        <p aria-live="polite" className="consent-carousel-count">
          {position} із {consentPrinciples.length}
        </p>
        <div
          aria-label={`Складова ${position} із ${consentPrinciples.length}`}
          aria-valuemax={consentPrinciples.length}
          aria-valuemin={1}
          aria-valuenow={position}
          className="consent-carousel-progress"
          role="progressbar"
        >
          <span
            className="consent-carousel-progress-fill"
            style={{ width: `${(position / consentPrinciples.length) * 100}%` }}
          />
        </div>
      </div>

      <div
        aria-atomic="true"
        aria-live="polite"
        className="consent-carousel-slides"
        id="consent-carousel-slides"
      >
        {consentPrinciples.map((principle, index) => {
          const active = index === activeIndex;

          return (
            <article
              aria-hidden={!active}
              className={`consent-carousel-slide${active ? " is-active" : ""}`}
              key={principle.title}
            >
              <h3>{principle.title}</h3>
              {principle.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          );
        })}
      </div>

      <div className="consent-carousel-actions">
        <button
          aria-controls="consent-carousel-slides"
          className="secondary-button"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          type="button"
        >
          Назад
        </button>
        <button
          aria-controls="consent-carousel-slides"
          className="primary-button"
          disabled={activeIndex === consentPrinciples.length - 1}
          onClick={() =>
            setActiveIndex((index) =>
              Math.min(consentPrinciples.length - 1, index + 1),
            )
          }
          type="button"
        >
          Далі
        </button>
      </div>
    </div>
  );
}

type ConsentDisclosureSectionProps = {
  children: ReactNode;
  id: ConsentSectionId;
  open: boolean;
  onToggle: () => void;
  prose?: boolean;
  title: string;
};

function ConsentDisclosureSection({
  children,
  id,
  open,
  onToggle,
  prose = false,
  title,
}: ConsentDisclosureSectionProps) {
  const headingId = `${id}-heading`;
  const panelId = `${id}-panel`;

  return (
    <section className="material-section material-disclosure-section" id={id}>
      <h2 id={headingId}>
        <button
          aria-controls={panelId}
          aria-expanded={open}
          onClick={onToggle}
          type="button"
        >
          <span>{title}</span>
          <span aria-hidden="true" className="material-disclosure-arrow">
            ↓
          </span>
        </button>
      </h2>
      <div
        aria-labelledby={headingId}
        className={`material-disclosure-panel${prose ? " material-prose" : ""}`}
        hidden={!open}
        id={panelId}
        role="region"
      >
        {children}
      </div>
    </section>
  );
}

export function ConsentMaterialPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [openSection, setOpenSection] = useState<ConsentSectionId | null>(null);

  useEffect(() => {
    document.title = "Згода — корисні матеріали";
    window.scrollTo({ top: 0, behavior: "instant" });
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const moveToSection = (id: ConsentSectionId) => {
    setOpenSection(id);
    window.requestAnimationFrame(() => {
      const section = document.getElementById(id);
      const trigger = section?.querySelector("button");
      if (!section || !(trigger instanceof HTMLButtonElement)) return;

      section.scrollIntoView?.({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      trigger.focus({ preventScroll: true });
    });
  };

  const toggleSection = (id: ConsentSectionId) => {
    setOpenSection((current) => (current === id ? null : id));
  };

  return (
    <div className="material-article-shell">
      <header className="checklist-header material-article-header">
        <Link className="back-link" to="/materials">
          <span aria-hidden="true">←</span> Усі матеріали
        </Link>
        <AppMenu />
      </header>

      <main className="material-article-page">
        <article>
          <header className="material-article-intro">
            <h1 ref={titleRef} tabIndex={-1}>
              Що важливо знати про згоду
            </h1>
            <div className="material-lead">
              <p>
                Згода — це вільне і взаємне рішення брати участь у певній
                взаємодії: від обіймів, поцілунків і фотографування до сексуальної
                близькості. Вона потрібна щоразу і для кожної окремої дії
              </p>
              <p>
                Повага до згоди — це спосіб подбати про безпеку, довіру й комфорт
                кожного. Мовчання, завмирання, відсутність опору або попереднє «так»
                не означають згоди. Якщо немає впевненості — потрібно зупинитися й
                запитати
              </p>
            </div>
          </header>

          <nav aria-label="Зміст матеріалу" className="material-toc">
            {consentSections.map((section) => (
              <button
                key={section.id}
                onClick={() => moveToSection(section.id)}
                type="button"
              >
                <span>{section.label}</span>
                <span aria-hidden="true">↓</span>
              </button>
            ))}
          </nav>

          <ConsentDisclosureSection
            id="consent-components"
            onToggle={() => toggleSection("consent-components")}
            open={openSection === "consent-components"}
            title="5 складових згоди"
          >
            <ConsentPrinciplesCarousel />
          </ConsentDisclosureSection>

          <ConsentDisclosureSection
            id="checking-consent"
            onToggle={() => toggleSection("checking-consent")}
            open={openSection === "checking-consent"}
            prose
            title="Як запитувати й перевіряти згоду"
          >
            <p>
              Запитання про згоду не має бути незручним або надто формальним.
              Можна говорити прямо і природно:
            </p>

            <blockquote className="material-quote-list">
              <p>«Можна тебе поцілувати?»</p>
              <p>«Тобі це подобається?»</p>
              <p>«Хочеш продовжити?»</p>
              <p>«Хочеш трохи сповільнитися або зупинитися?»</p>
              <p>«Що тобі зараз комфортно?»</p>
            </blockquote>

            <ul>
              <li>
                Став запитання, які дають змогу чесно відповісти, а не підштовхують
                до «правильної» відповіді
              </li>
              <li>
                Звертай увагу і на слова, і на мову тіла. Якщо вони не збігаються,
                зупинися і перепитай
              </li>
              <li>
                Сприймай «не знаю», «можливо», мовчання або вагання як привід
                зробити паузу, а не як приховане «так»
              </li>
              <li>
                Перевіряй згоду знову, якщо взаємодія змінюється або триває далі
              </li>
            </ul>
          </ConsentDisclosureSection>

          <ConsentDisclosureSection
            id="declining-consent"
            onToggle={() => toggleSection("declining-consent")}
            open={openSection === "declining-consent"}
            prose
            title="Якщо відмовляєшся ти"
          >
            <p>
              Ти маєш право відмовитися від будь-якої дії або зупинитися будь-якої
              миті. Для цього не потрібні «достатньо серйозна» причина чи
              виправдання. Ти нічого не винен/на за поцілунки, подарунки, побачення,
              витрачені гроші, стосунки чи попередню згоду
            </p>
            <p>Можна сказати:</p>

            <blockquote className="material-quote-list">
              <p>«Ні, я не хочу»</p>
              <p>«Не зараз»</p>
              <p>«Я передумав/ла»</p>
              <p>«Мені некомфортно. Зупинися»</p>
              <p>«Це моя межа»</p>
              <p>«Я хочу піти»</p>
            </blockquote>

            <p>
              Відмова може бути короткою. Не обов’язково звучати ввічливо, якщо
              поруч із людиною небезпечно. Якщо твою відмову ігнорують, намагайся
              відійти у безпечне місце та звернутися до людини, якій довіряєш
            </p>
            <p>
              Якщо ти завмер/ла, злякався/лася або не зміг/ла чинити опір, це не
              означає, що ти погодився/лася. Відповідальність за порушення твоїх меж
              несе людина, яка їх не поважала, а не ти
            </p>
          </ConsentDisclosureSection>

          <ConsentDisclosureSection
            id="receiving-decline"
            onToggle={() => toggleSection("receiving-decline")}
            open={openSection === "receiving-decline"}
            prose
            title="Якщо відмовили тобі"
          >
            <p>
              Зупинися одразу. Не тисни, не вмовляй, не питай знову й знову, не
              ображай і не змушуй людину почуватися винною. Відмова не є запрошенням
              «переконати» іншу людину
            </p>
            <p>Можна відповісти:</p>

            <blockquote className="material-quote-list">
              <p>«Добре, дякую, що сказав/ла»</p>
              <p>«Звісно, ми можемо зупинитися»</p>
              <p>«Усе гаразд. Ти нічого не мусиш»</p>
            </blockquote>

            <p>
              Відмова може засмутити, розчарувати або збентежити — такі почуття
              нормальні. Але впоратися з ними — твоя відповідальність. Можна взяти
              паузу, переключитися на іншу активність або поговорити з кимось, кому
              довіряєш, — але не перекладати ці емоції на людину, яка відмовила
            </p>
            <p>
              Чуже «ні» не обов’язково означає відмову від тебе як від людини. Воно
              може означати «не ця дія», «не зараз» або просто «я не хочу». Навіть у
              близьких стосунках ніхто не зобов’язаний погоджуватися на дотики чи
              секс
            </p>
          </ConsentDisclosureSection>
        </article>
      </main>
    </div>
  );
}
