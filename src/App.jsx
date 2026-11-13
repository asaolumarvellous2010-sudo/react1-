import { useEffect, useState } from 'react'
import './App.css'

const imageChoices = [
  { src: '/images/children-friends.jpg', label: 'Friends together' },
  { src: '/images/community-meals.jpg', label: 'Community meals' },
  { src: '/images/school-support.jpg', label: 'School support' },
  { src: '/images/food-relief.jpg', label: 'Food relief' },
  { src: '/images/children-together.jpg', label: 'Children together' },
]

const sampleCauses = [
  { id: 'sample-education', category: 'Education', title: 'School support for every child', description: 'Help equip a welcoming classroom with books, school bags, and the tools young learners need to thrive.', image: '/images/school-support.jpg', raised: 1850000, goal: 2500000, supporters: 128, tag: 'Learning for all', payments: {} },
  { id: 'sample-food', category: 'Food', title: 'A warm meal for every child', description: 'Support nourishing meals for children and neighbours facing a difficult season.', image: '/images/community-meals.jpg', raised: 640000, goal: 1000000, supporters: 94, tag: 'Food with dignity', payments: {} },
  { id: 'sample-relief', category: 'Emergency aid', title: 'Food packs for families in need', description: 'Help families access essential groceries and everyday supplies when they need them most.', image: '/images/food-relief.jpg', raised: 420000, goal: 900000, supporters: 51, tag: 'Care in action', payments: {} },
  { id: 'sample-community', category: 'Community', title: 'A safe place to learn and grow', description: 'Help create welcoming spaces where children can learn, play, and feel supported.', image: '/images/children-together.jpg', raised: 720000, goal: 1200000, supporters: 83, tag: 'Together we grow', payments: {} },
  { id: 'sample-health', category: 'Health', title: 'Care that reaches every family', description: 'Help connect children and families with the everyday care and support they deserve.', image: '/images/children-friends.jpg', raised: 920000, goal: 1800000, supporters: 76, tag: 'Community care', payments: {} },
]

const storageKey = 'kindred-community-causes'
const naira = (amount) => `\u20A6${Number(amount || 0).toLocaleString('en-NG')}`
const Arrow = ({ diagonal = false }) => <span aria-hidden="true" className="arrow-icon">{diagonal ? '\u2197' : '\u2192'}</span>
const paymentNames = { bank: 'Bank transfer', wallet: 'Crypto wallet', paypal: 'PayPal' }

function isPayPalLink(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ['paypal.com', 'www.paypal.com', 'paypal.me'].includes(url.hostname.toLowerCase())
  } catch {
    return false
  }
}

function isValidCommunityCause(cause) {
  if (!cause || typeof cause !== 'object' || !String(cause.id).startsWith('cause-')) return false
  if (![cause.title, cause.description, cause.category, cause.image].every((value) => typeof value === 'string')) return false
  if (!imageChoices.some((image) => image.src === cause.image) || !Number.isFinite(Number(cause.goal))) return false
  if (!cause.payments || typeof cause.payments !== 'object') return false
  if (cause.payments.paypal && !isPayPalLink(cause.payments.paypal.url)) return false
  return true
}

function getSharedCause() {
  if (!window.location.hash.startsWith('#cause=')) return null
  try {
    const cause = JSON.parse(decodeURIComponent(window.location.hash.slice(7)))
    if (isValidCommunityCause(cause)) return cause
  } catch {
    return null
  }
  return null
}

function getInitialCauses() {
  let saved = []
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
    if (Array.isArray(stored)) saved = stored.filter(isValidCommunityCause)
  } catch {
    saved = []
  }
  const shared = getSharedCause()
  const custom = shared ? [shared, ...saved.filter((cause) => cause.id !== shared.id)] : saved
  return [...sampleCauses, ...custom]
}

function App() {
  const [causes, setCauses] = useState(getInitialCauses)
  const [filter, setFilter] = useState('All causes')
  const [selectedCause, setSelectedCause] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('bank')
  const [amount, setAmount] = useState('10000')
  const [paymentNotice, setPaymentNotice] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createNotice, setCreateNotice] = useState('')
  const [createMethods, setCreateMethods] = useState(['bank'])
  const [selectedImage, setSelectedImage] = useState(imageChoices[0].src)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(causes.filter((cause) => !String(cause.id).startsWith('sample-'))))
    } catch {
      // Campaigns still work in this session if local storage is unavailable.
    }
  }, [causes])

  const filters = ['All causes', ...new Set(causes.map((cause) => cause.category))]
  const visibleCauses = filter === 'All causes' ? causes : causes.filter((cause) => cause.category === filter)

  const openSupport = (cause) => {
    const available = Object.keys(cause.payments || {})
    setSelectedCause(cause)
    setSelectedMethod(available[0] || 'bank')
    setAmount('10000')
    setPaymentNotice('')
  }

  const shareCause = async (cause) => {
    const url = `${window.location.origin}${window.location.pathname}#cause=${encodeURIComponent(JSON.stringify(cause))}`
    try {
      await window.navigator.clipboard.writeText(url)
      setShareMessage('Cause link copied. Share it with people who may want to help.')
      window.setTimeout(() => setShareMessage(''), 6000)
    } catch {
      window.prompt('Copy this cause link to share it:', url)
    }
  }

  const toggleCreateMethod = (method) => {
    setCreateMethods((current) => current.includes(method) ? current.filter((item) => item !== method) : [...current, method])
    setCreateNotice('')
  }

  const submitCause = (event) => {
    event.preventDefault()
    if (!createMethods.length) {
      setCreateNotice('Choose at least one way for supporters to contribute.')
      return
    }
    const data = new FormData(event.currentTarget)
    if (createMethods.includes('paypal') && !isPayPalLink(data.get('paypalUrl'))) {
      setCreateNotice('Use a secure PayPal.com or PayPal.me payment link.')
      return
    }
    const payments = {}
    if (createMethods.includes('bank')) payments.bank = { bankName: data.get('bankName').trim(), accountName: data.get('accountName').trim(), accountNumber: data.get('accountNumber').trim() }
    if (createMethods.includes('wallet')) payments.wallet = { network: data.get('walletNetwork'), asset: data.get('walletAsset'), address: data.get('walletAddress').trim() }
    if (createMethods.includes('paypal')) payments.paypal = { url: data.get('paypalUrl').trim() }

    const cause = {
      id: `cause-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: data.get('category'),
      title: data.get('title').trim(),
      description: data.get('description').trim(),
      image: selectedImage,
      raised: 0,
      goal: Number(data.get('goal')),
      supporters: 0,
      tag: 'Community fundraiser',
      organizer: data.get('organizer').trim(),
      email: data.get('email').trim(),
      location: data.get('location').trim(),
      payments,
      createdAt: new Date().toISOString(),
    }
    setCauses((current) => [cause, ...current])
    setFilter('All causes')
    setCreateMethods(['bank'])
    setSelectedImage(imageChoices[0].src)
    setCreateNotice('')
    setCreateOpen(false)
    window.setTimeout(() => document.getElementById('causes')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const copyPayment = async () => {
    if (Number(amount) < 500) {
      setPaymentNotice('Enter a contribution of at least \\u20A6500.')
      return
    }
    const payment = selectedCause?.payments?.[selectedMethod]
    if (!payment) return
    const details = selectedMethod === 'bank'
      ? `Bank: ${payment.bankName}\nAccount name: ${payment.accountName}\nAccount number: ${payment.accountNumber}\nAmount: ${naira(amount)}`
      : selectedMethod === 'wallet'
        ? `Network: ${payment.network}\nAsset: ${payment.asset}\nWallet address: ${payment.address}\nContribution guide: ${naira(amount)} equivalent. Confirm the token amount with the organizer before sending.`
        : payment.url
    try {
      await window.navigator.clipboard.writeText(details)
      setPaymentNotice('Payment details copied. Complete the transfer with your payment provider.')
    } catch {
      setPaymentNotice('Copy the payment details shown above and complete the transfer with your payment provider.')
    }
  }

  const activePayment = selectedCause?.payments?.[selectedMethod]

  return <div className="site-shell">
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Kindred home"><span className="brand-mark">k<span>\u00B7</span></span><span>kindred<span className="brand-period">.</span></span></a>
      <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation"><a href="#causes" onClick={() => setMenuOpen(false)}>Explore causes</a><a href="#about" onClick={() => setMenuOpen(false)}>Our story</a><a href="#impact" onClick={() => setMenuOpen(false)}>Our approach</a><button className="nav-create" type="button" onClick={() => { setCreateOpen(true); setMenuOpen(false) }}>Create a cause <Arrow /></button></nav>
    </header>

    <main>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> A little kindness goes a long way</div><h1>Hope begins where<br />kindness <em>finds us.</em></h1><p className="hero-intro">A brighter future starts with a simple act of care. Find a cause close to your heart, or bring your own community together.</p><div className="hero-actions"><a className="button button-primary" href="#causes">Explore causes <Arrow /></a><button className="text-link hero-create-link" type="button" onClick={() => setCreateOpen(true)}>Start a fundraiser <Arrow diagonal /></button></div><div className="hero-trust"><div className="avatar-stack" aria-hidden="true"><span>O</span><span>A</span><span>C</span><span>+</span></div><span><strong>Start with kindness.</strong> Every small act matters.</span></div></div>
        <div className="hero-visual"><div className="hero-image-wrap hero-image-one"><img src="/images/children-friends.jpg" alt="Two friends smiling together" /></div><div className="hero-image-wrap hero-image-two"><img src="/images/school-support.jpg" alt="Children receiving school support" /></div><div className="hero-image-wrap hero-image-three"><img src="/images/food-relief.jpg" alt="Children receiving food and everyday essentials" /></div><span className="visual-dot visual-dot-one" /><span className="visual-dot visual-dot-two" /><span className="visual-dot visual-dot-three" /></div>
      </section>

      <section className="causes-section section-wrap" id="causes"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> MAKE A DIFFERENCE</div><h2>Our causes</h2></div><p>Every story is a chance to make life a little lighter. Choose the one that speaks to you.</p></div>
        <div className="cause-toolbar"><div className="filter-row" role="group" aria-label="Filter causes">{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={filter === item ? 'filter-chip active' : 'filter-chip'}>{item}</button>)}</div><button className="button button-create" type="button" onClick={() => setCreateOpen(true)}>+ Create a cause</button></div>
        <p className="sample-note">Featured campaigns are examples. Community causes are saved in this browser; share a cause link so others can open it.</p>
        {visibleCauses.length ? <div className="cause-grid">{visibleCauses.map((cause, index) => { const progress = Math.min(Math.round((cause.raised / cause.goal) * 100), 100); return <article className="cause-card" key={cause.id} style={{ '--card-delay': `${index * 70}ms` }}><div className="cause-image"><img src={cause.image} alt="" loading="lazy" /><span className="cause-tag">{cause.tag}</span></div><div className="cause-body"><span className="cause-category">{cause.category}{cause.location ? ` · ${cause.location}` : ''}</span><h3>{cause.title}</h3><p>{cause.description}</p><div className="progress-label"><span><strong>{naira(cause.raised)}</strong> raised</span><span>of {naira(cause.goal)}</span></div><div className="progress-track" role="progressbar" aria-label={`${progress}% funded`} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${progress}%` }} /></div><div className="cause-footer"><span className="supporters"><span className="supporter-icon">\u2661</span> {cause.supporters} supporters</span><div className="cause-actions"><button type="button" className="cause-share" onClick={() => shareCause(cause)} aria-label={`Share ${cause.title}`}>Share <Arrow diagonal /></button><button type="button" className="cause-give" onClick={() => openSupport(cause)}>Support <Arrow /></button></div></div></div></article> })}</div> : <div className="empty-causes"><h3>No causes in this category yet.</h3><p>Start a fundraiser and invite others to help.</p><button className="button button-primary" onClick={() => setCreateOpen(true)}>Create a cause</button></div>}
        <div className="all-causes"><span>Every good thing starts somewhere.</span><a href="#about">See how Kindred works <Arrow diagonal /></a></div>
      </section>

      <section className="impact-strip" id="impact"><div className="impact-inner"><span className="eyebrow"><span className="eyebrow-line" /> WHY KINDRED</span><h2>Welcome to a kinder<br />way to <em>show up.</em></h2><p>Kindred brings caring people and meaningful causes closer together. Choose a story, offer what you can, and help good things grow in communities across Anambra and beyond.</p><div className="impact-actions"><a className="button button-outline" href="#about">Meet our founder <Arrow /></a><a className="button button-primary" href="#causes">Find a cause <Arrow /></a></div></div></section>

      <section className="quote-section" id="about"><div className="quote-image"><img src="/images/children-together.jpg" alt="A group of children smiling together" loading="lazy" /><span className="quote-image-label">Care is a community thing</span></div><div className="quote-copy"><span className="quote-mark">“</span><h2>We believe the best way forward is <em>together.</em></h2><p>Kindred is a small idea with a big heart: make it easier for good people to find good causes, and turn everyday generosity into real support.</p><a className="text-link quote-link" href="#footer">A note from our founder <Arrow /></a><div className="founder-note"><div className="founder-avatar">AB</div><div><strong>Achusiogu Chimaobim Brian</strong><span>Founder · Computer science student, Anambra</span></div></div></div></section>

      <section className="closing-cta"><div className="cta-decor cta-decor-left">✳</div><div className="cta-decor cta-decor-right">✿</div><div className="eyebrow eyebrow-light"><span className="eyebrow-line" /> YOUR KINDNESS CAN START TODAY</div><h2>Someone’s next chapter<br />could start with <em>you.</em></h2><p>Choose a cause. Give what you can. Watch something good grow.</p><button className="button button-cream" type="button" onClick={() => setCreateOpen(true)}>Start a fundraiser <Arrow /></button></section>
    </main>

    <footer className="site-footer" id="footer"><div className="footer-top"><a className="brand brand-footer" href="#home"><span className="brand-mark">k<span>\u00B7</span></span><span>kindred<span className="brand-period">.</span></span></a><p>Small acts. Shared hope.<br />A brighter future, together.</p><div className="footer-links"><a href="#causes">Find a cause</a><a href="#about">Our story</a><a href="mailto:hello@kindred.org">Say hello <Arrow diagonal /></a></div><button className="footer-give" type="button" onClick={() => setCreateOpen(true)}>Create a cause <Arrow /></button></div><div className="footer-bottom"><span>© 2026 Kindred Project</span><span>Created with care by <strong>Achusiogu Chimaobim Brian</strong>, a computer science student from Anambra.</span><span>Made for good things <span className="footer-heart">♥</span></span></div></footer>

    {shareMessage && <div className="share-toast" role="status">{shareMessage}<button type="button" aria-label="Dismiss message" onClick={() => setShareMessage('')}>×</button></div>}
    {selectedCause && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCause(null) }}><section className="donation-modal support-modal" role="dialog" aria-modal="true" aria-labelledby="support-title"><button type="button" className="modal-close" aria-label="Close support dialog" onClick={() => setSelectedCause(null)}>×</button><div className="modal-kicker">SUPPORT THIS COMMUNITY CAUSE</div><h2 id="support-title">Give with <em>kindness.</em></h2><p className="modal-copy">Organizer: <strong>{selectedCause.organizer || 'Kindred featured campaign'}</strong>{selectedCause.email && <> · <a href={`mailto:${selectedCause.email}`}>Contact organizer</a></>}</p><div className="modal-cause"><img src={selectedCause.image} alt="" /><div><span>{selectedCause.category}{selectedCause.location ? ` · ${selectedCause.location}` : ''}</span><strong>{selectedCause.title}</strong></div></div><label className="amount-label" htmlFor="gift-amount">Contribution amount in naira</label><div className="custom-amount"><span>₦</span><input id="gift-amount" aria-label="Contribution amount in naira" type="number" min="500" step="500" value={amount} onChange={(event) => { setAmount(event.target.value); setPaymentNotice('') }} /></div>
      {Object.keys(selectedCause.payments || {}).length ? <><div className="payment-tabs" role="tablist" aria-label="Payment methods">{Object.keys(selectedCause.payments).map((method) => <button type="button" role="tab" aria-selected={selectedMethod === method} className={selectedMethod === method ? 'payment-tab active' : 'payment-tab'} key={method} onClick={() => { setSelectedMethod(method); setPaymentNotice('') }}>{paymentNames[method]}</button>)}</div><div className="payment-details">{selectedMethod === 'bank' && activePayment && <><span className="payment-label">Bank transfer details</span><p><strong>Bank</strong>{activePayment.bankName}</p><p><strong>Account name</strong>{activePayment.accountName}</p><p><strong>Account number</strong>{activePayment.accountNumber}</p><p><strong>Transfer amount</strong>{naira(amount)}</p></>}{selectedMethod === 'wallet' && activePayment && <><span className="payment-label">Wallet details</span><p><strong>Network</strong>{activePayment.network}</p><p><strong>Asset</strong>{activePayment.asset}</p><p className="wallet-address"><strong>Wallet address</strong>{activePayment.address}</p><p><strong>Contribution guide</strong>{naira(amount)} equivalent. Confirm the token amount with the organizer before sending.</p></>}{selectedMethod === 'paypal' && activePayment && <><span className="payment-label">PayPal checkout</span><p>Open the organizer’s PayPal link and enter {naira(amount)} as your contribution.</p><a className="button button-primary paypal-link" href={activePayment.url} target="_blank" rel="noreferrer">Continue to PayPal <Arrow diagonal /></a></>}</div>{selectedMethod !== 'paypal' && <button className="button button-primary modal-submit" type="button" onClick={copyPayment}>Copy payment details</button>}{paymentNotice && <p className="form-notice success" role="status">{paymentNotice}</p>}<p className="modal-footnote">Check the recipient and payment network before sending. Kindred does not collect or process this payment.</p></> : <div className="no-payment-details"><strong>Payment details are not set up for this featured example.</strong><p>Fundraisers created on Kindred can add bank, wallet, or PayPal instructions for supporters.</p><button className="button button-outline" type="button" onClick={() => { setSelectedCause(null); setCreateOpen(true) }}>Create your own cause <Arrow /></button></div>}</section></div>}

    {createOpen && <div className="modal-backdrop create-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false) }}><section className="donation-modal create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><button type="button" className="modal-close" aria-label="Close create cause form" onClick={() => setCreateOpen(false)}>×</button><div className="modal-kicker">BRING YOUR COMMUNITY TOGETHER</div><h2 id="create-title">Create a <em>cause.</em></h2><p className="modal-copy">Share the story, set a goal, and add the payment instructions supporters will need.</p><form className="create-form" onSubmit={submitCause}><div className="form-grid"><label>Cause title<input name="title" required maxLength="72" placeholder="What are you raising support for?" /></label><label>Category<select name="category" required defaultValue="Education"><option>Education</option><option>Food</option><option>Health</option><option>Community</option><option>Emergency aid</option><option>Other</option></select></label><label>Your name<input name="organizer" required maxLength="80" placeholder="Organizer or group name" /></label><label>Contact email<input name="email" type="email" required placeholder="you@example.com" /></label><label>Community or location<input name="location" required maxLength="70" placeholder="Town, state" /></label><label>Fundraising goal (NGN)<input name="goal" type="number" min="1000" step="500" required placeholder="500000" /></label><label className="form-wide">Tell people about your cause<textarea name="description" required minLength="25" maxLength="500" rows="3" placeholder="Explain who the fundraiser helps and how contributions will be used." /></label></div>
        <fieldset className="image-picker"><legend>Choose a campaign photo</legend><div className="image-choice-grid">{imageChoices.map((image) => <label className={selectedImage === image.src ? 'image-choice selected' : 'image-choice'} key={image.src}><input type="radio" name="campaignImage" value={image.src} checked={selectedImage === image.src} onChange={() => setSelectedImage(image.src)} /><img src={image.src} alt="" /><span>{image.label}</span></label>)}</div></fieldset>
        <fieldset className="method-picker"><legend>Ways supporters can contribute</legend><div className="method-checks">{Object.entries(paymentNames).map(([method, label]) => <label key={method}><input type="checkbox" checked={createMethods.includes(method)} onChange={() => toggleCreateMethod(method)} />{label}</label>)}</div>
          {createMethods.includes('bank') && <div className="payment-fields"><strong>Bank transfer details</strong><div className="form-grid"><label>Bank name<input name="bankName" required placeholder="Bank" /></label><label>Account name<input name="accountName" required placeholder="Account holder" /></label><label>Account number<input name="accountNumber" required inputMode="numeric" pattern="[0-9]{10}" maxLength="10" placeholder="10-digit account number" /></label></div></div>}
          {createMethods.includes('wallet') && <div className="payment-fields"><strong>Crypto wallet details</strong><p className="field-help">Specify the exact network and asset so supporters can avoid sending funds on the wrong network.</p><div className="form-grid"><label>Network<select name="walletNetwork" required defaultValue=""><option value="" disabled>Select network</option><option>Bitcoin</option><option>Ethereum</option><option>BNB Smart Chain</option><option>Polygon</option><option>Tron (TRC20)</option><option>Other - see cause details</option></select></label><label>Asset<input name="walletAsset" required placeholder="BTC, ETH, USDT..." /></label><label className="form-wide">Wallet address<input name="walletAddress" required autoComplete="off" placeholder="Paste the public receiving address" /></label></div></div>}
          {createMethods.includes('paypal') && <div className="payment-fields"><strong>PayPal details</strong><label>PayPal payment link<input name="paypalUrl" type="url" required pattern="https://.*" placeholder="https://paypal.me/yourname" /></label></div>}
        </fieldset><p className="privacy-note">Cause details stay in this browser. Share the generated cause link so other people can view the fundraiser and its public payment instructions.</p>{createNotice && <p className="form-notice" role="alert">{createNotice}</p>}<button className="button button-primary modal-submit" type="submit">Publish cause and share <Arrow /></button><p className="modal-footnote">Only add payment accounts you control or are authorized to publish. Kindred does not hold or process funds.</p></form></section></div>}
  </div>
}

export default App
