import Link from 'next/link'
import React from 'react'
import { Box } from '@mui/material'
import {
  MdArrowForward,
  MdBolt,
  MdCategory,
  MdChevronRight,
  MdDryCleaning,
  MdLocalShipping,
  MdLocationOn,
  MdLogin,
  MdQrCode2,
  MdRestaurant,
  MdShield,
  MdShoppingCart,
  MdSpeed,
  MdSportsMartialArts,
  MdTrendingUp,
} from 'react-icons/md'
import HeaderFooterLayout from '@/components/layout/HeaderFooterLayout/HeaderFooterLayout'
import './landing.css'

/** Sample catalog stats (replace with API when Strapi is wired). */
const SAMPLE_STATS = [
  { key: 's1', value: '52', label: 'Rural stations linked', hint: 'Sample rollout map' },
  { key: 's2', value: '100%', label: 'Official canteen pricing', hint: 'Slab-aligned SKUs' },
  { key: 's3', value: '24/7', label: 'Order when you can', hint: 'Pickup per unit schedule' },
]

const MARQUEE_ITEMS = [
  { key: 'm1', text: 'Ration bundles', tag: 'Trending' },
  { key: 'm2', text: 'Monsoon kit refresh', tag: 'Hot' },
  { key: 'm3', text: 'QR pickup pilots', tag: 'New' },
  { key: 'm4', text: 'Duty boots — Type B', tag: 'Top rated' },
  { key: 'm5', text: 'Station-scoped carts', tag: 'Secure' },
  { key: 'm6', text: 'Weekend convoy sync', tag: 'Logistics' },
]

const TRUST_CHIPS = ['HTTPS session', 'Role-based access', 'Audit-friendly trail', 'Pickup windows', 'No markups']

/** Sample categories for the home grid. */
const SAMPLE_CATEGORIES = [
  {
    key: 'c1',
    name: 'Monthly rations',
    blurb: 'Atta, rice, pulses, sugar — entitlement-checked at checkout (demo).',
    skuHint: '128 sample SKUs',
    Icon: MdRestaurant,
  },
  {
    key: 'c2',
    name: 'Uniforms & kit',
    blurb: 'Summer/winter issue, belts, caps, and station-specific bundles.',
    skuHint: '64 sample lines',
    Icon: MdDryCleaning,
  },
  {
    key: 'c3',
    name: 'Field essentials',
    blurb: 'Boots, rain gear, torches, and bags sized from your logged profile.',
    skuHint: '41 sample items',
    Icon: MdSportsMartialArts,
  },
]

/** Sample featured products (prices illustrative only). */
const SAMPLE_FEATURED = [
  {
    key: 'p1',
    name: 'Duty boot — Type B (black)',
    priceSlab: '₹2,840 · sample slab',
    stock: 'In stock · 6 pairs',
    tag: 'Uniform',
    Icon: MdSportsMartialArts,
    trending: true,
  },
  {
    key: 'p2',
    name: 'Monthly ration pack (officer)',
    priceSlab: '₹1,180 · sample bundle',
    stock: 'Eligible on file',
    tag: 'Ration',
    Icon: MdRestaurant,
    trending: true,
  },
  {
    key: 'p3',
    name: 'Monsoon parka — L',
    priceSlab: '₹1,450 · sample rate',
    stock: 'Low · 3 units',
    tag: 'Gear',
    Icon: MdDryCleaning,
    trending: false,
  },
  {
    key: 'p4',
    name: 'LED torch (rechargeable)',
    priceSlab: '₹620 · sample',
    stock: 'In stock · 24 units',
    tag: 'Equipment',
    Icon: MdCategory,
    trending: false,
  },
]

/** Order preview lines inside the hero mock card. */
const SAMPLE_CART_PREVIEW = [
  { key: 'o1', label: 'Monthly ration pack', tag: 'In policy', tagVariant: 'ok' },
  { key: 'o2', label: 'Duty boots (size logged)', tag: 'Qty 1', tagVariant: 'default' },
  { key: 'o3', label: 'Pickup station', tag: 'Rural Outpost 14', tagVariant: 'default' },
]

const HOW_IT_WORKS_STEPS = [
  { key: '1', stepLabel: 'Step 1', title: 'Verify & sign in', Icon: MdLogin, highlight: false },
  { key: '2', stepLabel: 'Step 2', title: 'Browse the catalog', Icon: MdCategory, highlight: false },
  { key: '3', stepLabel: 'Step 3', title: 'Build your cart', Icon: MdShoppingCart, highlight: false },
  { key: '4', stepLabel: 'Step 4', title: 'Confirm pickup station', Icon: MdLocationOn, highlight: false },
  {
    key: '5',
    stepLabel: 'Step 5',
    title: 'Routed & scheduled',
    Icon: MdLocalShipping,
    highlight: true,
  },
  { key: '6', stepLabel: 'Step 6', title: 'Collect with QR', Icon: MdQrCode2, highlight: false },
]

const BENTO_BLOCKS = [
  {
    key: 'b1',
    wide: true,
    kicker: 'Why teams like it',
    title: 'One calm flow from browse → QR — built for long shifts and short windows.',
    text: 'Glass-clear pricing, fewer trips to HQ, and a cart that respects station cut-offs. Swap this panel for a hero video or map when you ship.',
  },
  {
    key: 'b2',
    title: 'Fast to scan',
    text: 'Large type, obvious CTAs, and contrast-safe tags — tuned for outdoor glare.',
    Icon: MdSpeed,
  },
  {
    key: 'b3',
    title: 'Trust-first',
    text: 'Session-scoped access with sample “verified” cues you can wire to SSO.',
    Icon: MdShield,
  },
  {
    key: 'b4',
    title: 'Ops-aware',
    text: 'Pickup + routing language matches how convoys and outposts already talk.',
    Icon: MdBolt,
  },
]

const SAMPLE_TESTIMONIALS = [
  {
    key: 't1',
    stars: 5,
    quote: '“Finally a flow that matches how we actually collect — the QR handoff is crystal clear in the demo.”',
    name: 'SI Meera Patil',
    role: 'Rural outpost lead · sample persona',
  },
  {
    key: 't2',
    stars: 5,
    quote: '“Feels like a modern consumer app, but the copy stays strictly canteen-realistic. Rare combo.”',
    name: 'ASI Rahul Verma',
    role: 'Logistics desk · sample persona',
  },
  {
    key: 't3',
    stars: 4,
    quote: '“We still run parallel on paper, but this UI wins the room in reviews — especially the stats strip.”',
    name: 'HC Kavita Nair',
    role: 'Training cell · sample persona',
  },
]

const SAMPLE_FAQ = [
  {
    key: 'f1',
    q: 'Is this live inventory?',
    a: 'No — this frontend uses sample SKUs and stock strings. Connect Strapi (or your ERP bridge) to replace the placeholders.',
  },
  {
    key: 'f2',
    q: 'Can we brand this per district?',
    a: 'Yes. Tokens live under `.pm-landing` in `landing.css`, and the mesh background can be swapped for photography with the same glass cards.',
  },
  {
    key: 'f3',
    q: 'Where do notices come from?',
    a: 'Right now they are static objects in `page.js`. Point them at a CMS collection when editors are ready.',
  },
]

const SAMPLE_NOTICES = [
  {
    key: 'n1',
    date: '12 Apr 2026',
    title: 'Demo window: ration bundle cut-off',
    text: 'Sample data only — orders placed before Thursday 18:00 route with the weekend convoy list.',
  },
  {
    key: 'n2',
    date: '03 Apr 2026',
    title: 'Uniform measurement refresh',
    text: 'Illustrative notice — please confirm boot size and cap band once per quarter in your profile.',
  },
]

const HERO_NAV = [
  { href: '#categories', label: 'Categories' },
  { href: '#spotlight', label: 'Spotlight' },
  { href: '#how-it-works', label: 'Flow' },
  { href: '#stories', label: 'Stories' },
  { href: '#faq', label: 'FAQ' },
]

const Page = () => {
  const marqueeDup = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <HeaderFooterLayout>
      <Box sx={{ pt: '70px' }}>
        <div className="pm-landing">
          <div id="main-content" className="pm-landing-inner">
            <section className="hero hero--fold" aria-labelledby="hero-title">
              <div className="hero-inner hero-layout">
                <div className="hero-copy">
                  <div className="hero-badge-row">
                    <span className="hero-badge">
                      <span className="hero-badge__dot" aria-hidden />
                      Live UI preview
                    </span>
                    <span className="hero-badge hero-badge--soft">
                      <MdTrendingUp size={16} aria-hidden style={{ color: '#cc3366' }} />
                      Trending layout kit · 2026
                    </span>
                  </div>

                  <ul className="hero-nav">
                    {HERO_NAV.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>

                  <p className="hero-eyebrow">Rural canteen · Official rates · Station pickup</p>
                  <h1 id="hero-title">
                    Save time.{' '}
                    <span className="pm-gradient-text">Order smarter</span> — without the HQ run.
                  </h1>
                  <p className="hero-lead">
                    PoliceMart is your online window for subsidized rations, uniforms, gear, and essentials—priced per
                    canteen rules and routed to your assigned outpost for collection.
                  </p>
                  <p className="hero-sub">
                    Browse categories anytime, build your cart with confidence, and collect on the schedule your unit
                    already follows—no duplicate paperwork at the window.
                  </p>

                  <div className="hero-social">
                    <div className="hero-avatars" aria-hidden>
                      <span className="hero-avatar" />
                      <span className="hero-avatar" />
                      <span className="hero-avatar" />
                      <span className="hero-avatar" />
                    </div>
                    <p className="hero-social__text">
                      <strong>240+ demo sessions</strong> this month on the prototype — social proof placeholder until
                      analytics ships.
                    </p>
                  </div>

                  <ul className="hero-trust" aria-label="Key points">
                    <li>Verified officer access</li>
                    <li>Transparent catalog</li>
                    <li>Pickup aligned to logistics</li>
                  </ul>
                  <div className="hero-actions">
                    <Link href="#categories" className="cta-btn">
                      Browse inventory
                      <MdArrowForward size={18} aria-hidden />
                    </Link>
                    <Link href="#how-it-works" className="cta-btn cta-btn--ghost">
                      See how it works
                    </Link>
                  </div>
                  <p className="hero-footnote">
                    Pricing follows published canteen slabs. Live stock and entitlements appear after you sign in.
                  </p>
                  <div className="hero-chips" aria-label="Assurances">
                    <span className="hero-chip">Secure session</span>
                    <span className="hero-chip">Station-scoped pickup</span>
                    <span className="hero-chip">QR-ready collection</span>
                  </div>
                </div>

                <div className="hero-visual" aria-hidden="true">
                  <div className="hero-glow" />
                  <div className="hero-mock">
                    <div className="hero-mock__bar">
                      <span className="hero-mock__dot" />
                      <span className="hero-mock__dot" />
                      <span className="hero-mock__dot" />
                      <span className="hero-mock__title">Order preview (sample)</span>
                    </div>
                    <div className="hero-mock__body">
                      {SAMPLE_CART_PREVIEW.map((row) => (
                        <div key={row.key} className="hero-mock__row">
                          <span className="hero-mock__label">{row.label}</span>
                          <span
                            className={
                              row.tagVariant === 'ok' ? 'hero-mock__tag hero-mock__tag--ok' : 'hero-mock__tag'
                            }
                          >
                            {row.tag}
                          </span>
                        </div>
                      ))}
                      <div className="hero-mock__qr">
                        <div className="hero-mock__qr-box" />
                        <div>
                          <p className="hero-mock__qr-title">Pickup code</p>
                          <p className="hero-mock__qr-hint">Show at collection window</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="marquee-wrap" role="presentation">
              <div className="marquee">
                <div className="marquee__track">
                  {marqueeDup.map((item, idx) => (
                    <span key={`${item.key}-${idx}`} className="marquee__item">
                      <span>{item.tag}</span> {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="trust-strip" aria-label="Trust and compliance highlights">
              <span className="trust-strip__label">Built like a product</span>
              {TRUST_CHIPS.map((label) => (
                <span key={label} className="trust-chip">
                  {label}
                </span>
              ))}
            </div>

            <section className="stats-banner" aria-labelledby="stats-eyebrow">
              <p id="stats-eyebrow" className="stats-banner__eyebrow">
                At a glance
              </p>
              <div className="stats-banner__row">
                {SAMPLE_STATS.map((s) => (
                  <div key={s.key} className="stat-item">
                    <span className="stat-value">{s.value}</span>
                    <p className="stat-label">{s.label}</p>
                    <span className="stat-hint">{s.hint}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="categories" className="section-block" aria-labelledby="cat-title">
              <div className="section-head-row">
                <div className="section-head">
                  <p className="section-kicker">Sample catalog</p>
                  <h2 id="cat-title" className="section-title">
                    Start from a category
                  </h2>
                  <p className="section-desc">
                    These cards use static sample copy for layout. Hook them to Strapi categories when your content
                    model is ready.
                  </p>
                </div>
                <Link href="#spotlight" className="cta-btn cta-btn--ghost cta-btn--sm">
                  Next: Spotlight
                  <MdChevronRight size={18} aria-hidden />
                </Link>
              </div>
              <div className="cat-grid">
                {SAMPLE_CATEGORIES.map(({ key, name, blurb, skuHint, Icon }) => (
                  <article key={key} className="cat-card">
                    <div className="cat-card__icon" aria-hidden>
                      <Icon size={22} />
                    </div>
                    <h3 className="cat-card__name">{name}</h3>
                    <p className="cat-card__blurb">{blurb}</p>
                    <span className="cat-card__meta">{skuHint}</span>
                  </article>
                ))}
              </div>
            </section>

            <section id="spotlight" className="section-block section-block--tight-top" aria-labelledby="feat-title">
              <div className="section-head-row">
                <div className="section-head">
                  <p className="section-kicker">Spotlight</p>
                  <h2 id="feat-title" className="section-title">
                    Featured items (sample SKUs)
                  </h2>
                  <p className="section-desc">
                    Illustrative prices and stock counts for UI only — they are not live inventory.
                  </p>
                </div>
                <span className="hero-badge hero-badge--soft" style={{ alignSelf: 'center' }}>
                  <MdTrendingUp size={16} aria-hidden style={{ color: '#cc3366' }} />
                  Trending ribbons = demo only
                </span>
              </div>
              <div className="feat-grid">
                {SAMPLE_FEATURED.map(({ key, name, priceSlab, stock, tag, Icon, trending }) => (
                  <article key={key} className="feat-card">
                    {trending ? <span className="feat-card__ribbon">Trending</span> : null}
                    <div className="feat-card__thumb" aria-hidden>
                      <Icon size={40} />
                    </div>
                    <div className="feat-card__body">
                      <span className="feat-card__tag">{tag}</span>
                      <h3 className="feat-card__name">{name}</h3>
                      <p className="feat-card__price">{priceSlab}</p>
                      <p className="feat-card__stock">{stock}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-block" aria-labelledby="bento-title">
              <div className="section-head">
                <p className="section-kicker">Experience</p>
                <h2 id="bento-title" className="section-title">
                  Product polish, without losing the mission tone
                </h2>
                <p className="section-desc">
                  Bento grids are everywhere in 2026 SaaS landings — here is a compact version that still reads serious.
                </p>
              </div>
              <div className="bento">
                {BENTO_BLOCKS.map((b) =>
                  b.wide ? (
                    <div key={b.key} className="bento__cell bento__cell--wide">
                      <p className="bento__kicker">{b.kicker}</p>
                      <h3 className="bento__title">{b.title}</h3>
                      <p className="bento__text">{b.text}</p>
                    </div>
                  ) : (
                    <div key={b.key} className="bento__cell">
                      <div className="bento__icon" aria-hidden>
                        <b.Icon />
                      </div>
                      <h3>{b.title}</h3>
                      <p>{b.text}</p>
                    </div>
                  ),
                )}
              </div>
            </section>

            <section id="how-it-works" className="section-block" aria-labelledby="hiw-title">
              <div className="section-head">
                <p className="section-kicker">Flow</p>
                <h2 id="hiw-title" className="section-title">
                  How it works
                </h2>
                <p className="section-desc">Six steps from sign-in to QR pickup — sample journey for the prototype.</p>
              </div>
              <div className="steps-grid">
                {HOW_IT_WORKS_STEPS.map(({ key, stepLabel, title, Icon, highlight }) => (
                  <article
                    key={key}
                    className={highlight ? 'step-card step-card--highlight' : 'step-card'}
                  >
                    <p className="step-card__label">{stepLabel}</p>
                    <div className="step-card__icon" aria-hidden>
                      <Icon />
                    </div>
                    <h3 className="step-card__title">{title}</h3>
                  </article>
                ))}
              </div>
            </section>

            <section id="stories" className="section-block" aria-labelledby="stories-title">
              <div className="section-head">
                <p className="section-kicker">Social proof</p>
                <h2 id="stories-title" className="section-title">
                  What reviewers are saying
                </h2>
                <p className="section-desc">Synthetic quotes for layout — replace with real feedback or case studies.</p>
              </div>
              <div className="testimonial-grid">
                {SAMPLE_TESTIMONIALS.map((t) => (
                  <blockquote key={t.key} className="testimonial">
                    <div className="testimonial__stars" aria-label={`${t.stars} out of 5 stars`}>
                      {'★'.repeat(t.stars)}
                      <span style={{ opacity: 0.35 }}>{'★'.repeat(5 - t.stars)}</span>
                    </div>
                    <p className="testimonial__quote">{t.quote}</p>
                    <footer className="testimonial__meta">
                      <p className="testimonial__name">{t.name}</p>
                      <p className="testimonial__role">{t.role}</p>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>

            <section className="section-block" aria-labelledby="news-title">
              <div className="section-head">
                <p className="section-kicker">Notices</p>
                <h2 id="news-title" className="section-title">
                  Station announcements
                </h2>
                <p className="section-desc">Demo announcements — swap for CMS-driven posts later.</p>
              </div>
              <div className="notice-list">
                {SAMPLE_NOTICES.map((n) => (
                  <article key={n.key} className="notice">
                    <span className="notice__date">{n.date}</span>
                    <div>
                      <h3 className="notice__title">{n.title}</h3>
                      <p className="notice__text">{n.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="faq" className="section-block" aria-labelledby="faq-title">
              <div className="section-head">
                <p className="section-kicker">FAQ</p>
                <h2 id="faq-title" className="section-title">
                  Quick answers
                </h2>
                <p className="section-desc">Native disclosure widgets — no extra JavaScript.</p>
              </div>
              <div className="faq-list">
                {SAMPLE_FAQ.map((item) => (
                  <details key={item.key} className="faq-item">
                    <summary>{item.q}</summary>
                    <p className="faq-item__body">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="section-block" aria-labelledby="cta-title">
              <div className="cta-band">
                <h2 id="cta-title">Ready when your unit is</h2>
                <p>
                  This page uses sample data end-to-end. Connect Strapi collections for categories, products, and notices
                  when your backend fields are stable.
                </p>
                <div className="cta-row">
                  <Link href="/blogs" className="cta-btn">
                    View blog
                    <MdArrowForward size={18} aria-hidden />
                  </Link>
                  <Link href="/contact-us" className="cta-btn cta-btn--ghost">
                    Contact demo
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Box>
    </HeaderFooterLayout>
  )
}

export default Page
