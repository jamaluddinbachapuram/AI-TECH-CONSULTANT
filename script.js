'use strict'

// ---------- KNOWLEDGE LIBRARY ----------

const articles = [
  {
    id: 1,
    title: 'How to Reset Your Password',
    category: 'account',
    summary: 'Steps for recovering access when you forget your password.',
    keywords: [
      'password',
      'reset',
      'forgot',
      'login',
      'sign in',
      'account access',
    ],
    answer:
      "Open the sign-in page and select 'Forgot Password'. Enter your registered email address and follow the password-reset instructions. If you do not receive the email, check your spam folder and confirm that you entered the correct address.",
  },
  {
    id: 2,
    title: 'Troubleshooting Common Technical Issues',
    category: 'account',
    summary:
      'Basic checks to try when a website or application is not working.',
    keywords: [
      'technical',
      'error',
      'bug',
      'not working',
      'crash',
      'slow',
      'issue',
    ],
    answer:
      'Start by refreshing the page and checking your internet connection. If the problem continues, clear the browser cache, try another browser, and note any error messages. For unresolved issues, share the steps that caused the problem with the support team.',
  },
  {
    id: 3,
    title: 'Understanding Membership Plans',
    category: 'membership',
    summary: 'Learn how to review plan details and membership benefits.',
    keywords: [
      'membership',
      'plan',
      'subscription',
      'upgrade',
      'benefits',
      'member',
    ],
    answer:
      'Review the available membership plans and compare their features, limits, and renewal terms. Choose the plan that matches your needs. Before upgrading or cancelling, check the current terms and any applicable charges.',
  },
  {
    id: 4,
    title: 'Payment and Billing Help',
    category: 'payments',
    summary: 'What to check when a payment fails or a charge looks unfamiliar.',
    keywords: [
      'payment',
      'billing',
      'charge',
      'invoice',
      'refund',
      'money',
      'transaction',
    ],
    answer:
      'Check your payment method, billing details, and transaction status. If a payment failed, confirm that your bank or payment provider did not decline it. For an unfamiliar charge or refund request, keep the transaction reference and contact the billing team. Never share your full card number or password.',
  },
  {
    id: 5,
    title: 'Creating a Better Website Design',
    category: 'design',
    summary: 'Practical ideas for making a website clear and easy to use.',
    keywords: [
      'design',
      'website',
      'layout',
      'ui',
      'ux',
      'responsive',
      'color',
    ],
    answer:
      'Use a clear visual hierarchy, readable typography, consistent spacing, and a small set of complementary colors. Make the main action easy to find. Test the layout on mobile and desktop, provide visible keyboard focus, and ensure text has sufficient contrast.',
  },
  {
    id: 6,
    title: 'Managing Your Account Details',
    category: 'account',
    summary: 'Keep your account information accurate and secure.',
    keywords: ['account', 'profile', 'email', 'details', 'security', 'update'],
    answer:
      "Open your account settings and review the profile information you can update. Use a strong, unique password and enable additional security options when available. If you cannot change a detail, contact the service's official support channel.",
  },
  {
    id: 7,
    title: 'Understanding Refund Requests',
    category: 'payments',
    summary: 'Prepare the information needed to ask about a refund.',
    keywords: ['refund', 'return', 'cancel', 'billing', 'payment'],
    answer:
      "Review the service's refund and cancellation policy first. Keep the order number, transaction date, and a short explanation of the request. Contact the official billing team for a decision; eligibility and processing times depend on the service's actual policy.",
  },
  {
    id: 8,
    title: 'Improving a Website on Mobile',
    category: 'design',
    summary: 'Make websites more usable on phones and tablets.',
    keywords: ['mobile', 'responsive', 'phone', 'tablet', 'screen', 'design'],
    answer:
      'Use a responsive layout, flexible widths, readable font sizes, and touch-friendly buttons. Avoid horizontal scrolling, test forms on small screens, and optimize large images. Check the page at several viewport widths before publishing.',
  },
]

// ---------- APP STATE ----------

const STORAGE_KEY = 'aiTechConsultantProgressV1'

const progress = {
  draftsCreated: 0,
  scopesPrepared: 0,
  articlesViewed: [],
}

let currentCategory = 'all'

// ---------- DOM HELPERS ----------

function getElement(id) {
  return document.getElementById(id)
}

function showFeedback(elementId, message, isError = false) {
  const element = getElement(elementId)

  if (!element) return

  element.textContent = message
  element.classList.toggle('error', isError)
}

function showAppMessage(message, type = 'success') {
  const messageBox = getElement('appMessage')

  messageBox.textContent = message
  messageBox.className = `alert alert-${type}`
  messageBox.classList.remove('d-none')

  // The message remains visible until another action replaces it
  // or the user navigates to another tool.
}

function hideAppMessage() {
  const messageBox = getElement('appMessage')
  messageBox.classList.add('d-none')
  messageBox.textContent = ''
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.warn('Progress could not be saved in this browser.', error)
  }
}

function loadProgress() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)

    if (!savedData) return

    const parsedData = JSON.parse(savedData)

    progress.draftsCreated = Number.isFinite(parsedData.draftsCreated)
      ? Math.max(0, parsedData.draftsCreated)
      : 0

    progress.scopesPrepared = Number.isFinite(parsedData.scopesPrepared)
      ? Math.max(0, parsedData.scopesPrepared)
      : 0

    progress.articlesViewed = Array.isArray(parsedData.articlesViewed)
      ? parsedData.articlesViewed.filter(id =>
          articles.some(article => article.id === id),
        )
      : []
  } catch (error) {
    console.warn('Saved progress could not be loaded.', error)
  }
}

function updateDashboard() {
  getElement('articleCount').textContent = progress.articlesViewed.length
  getElement('draftCount').textContent = progress.draftsCreated
  getElement('scopeCount').textContent = progress.scopesPrepared
}

// ---------- NAVIGATION ----------

function switchTask(taskName) {
  const sectionIds = {
    knowledge: 'knowledgeSection',
    inbox: 'inboxSection',
    scope: 'scopeSection',
  }

  if (!sectionIds[taskName]) return

  Object.entries(sectionIds).forEach(([task, sectionId]) => {
    getElement(sectionId).classList.toggle('d-none', task !== taskName)
  })

  document.querySelectorAll('.task-tab').forEach(button => {
    const isActive = button.dataset.task === taskName

    button.classList.toggle('active', isActive)
    button.setAttribute('aria-selected', String(isActive))
  })

  hideAppMessage()
}

// ---------- KNOWLEDGE BRAIN ----------

function getFilteredArticles() {
  const category = getElement('categoryFilter').value
  const query = getElement('questionInput').value.trim().toLowerCase()

  return articles.filter(article => {
    const matchesCategory = category === 'all' || article.category === category

    if (!matchesCategory) return false
    if (!query) return true

    const searchableText = [
      article.title,
      article.summary,
      article.category,
      article.answer,
      ...article.keywords,
    ]
      .join(' ')
      .toLowerCase()

    const queryWords = query
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)

    return queryWords.some(word => searchableText.includes(word))
  })
}

function renderArticles() {
  const articleList = getElement('articleList')
  const filteredArticles = getFilteredArticles()

  articleList.replaceChildren()

  getElement('libraryCount').textContent = `${filteredArticles.length} article${
    filteredArticles.length === 1 ? '' : 's'
  }`

  if (filteredArticles.length === 0) {
    const emptyMessage = document.createElement('div')
    emptyMessage.className = 'empty-state'
    emptyMessage.textContent =
      'No matching articles found. Try a different question or category.'
    articleList.appendChild(emptyMessage)
    return
  }

  filteredArticles.forEach(article => {
    const card = document.createElement('article')
    card.className = 'article-card'

    const badge = document.createElement('span')
    badge.className = 'category-badge'
    badge.textContent = article.category

    const title = document.createElement('h4')
    title.textContent = article.title

    const summary = document.createElement('p')
    summary.textContent = article.summary

    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = progress.articlesViewed.includes(article.id)
      ? 'Read again →'
      : 'Read article →'

    button.addEventListener('click', () => openArticle(article.id))

    card.append(badge, title, summary, button)
    articleList.appendChild(card)
  })
}

function openArticle(articleId) {
  const article = articles.find(item => item.id === articleId)

  if (!article) return

  if (!progress.articlesViewed.includes(articleId)) {
    progress.articlesViewed.push(articleId)
    saveProgress()
    updateDashboard()
  }

  const answerBox = getElement('knowledgeAnswer')
  answerBox.replaceChildren()

  const heading = document.createElement('h4')
  heading.textContent = article.title

  const category = document.createElement('span')
  category.className = 'category-badge mb-3'
  category.textContent = article.category

  const paragraph = document.createElement('p')
  paragraph.textContent = article.answer

  answerBox.append(heading, category, paragraph)

  getElement('questionInput').value = article.title
  renderArticles()
  showAppMessage(`Opened article: ${article.title}`)
}

function findKnowledgeAnswer() {
  const query = getElement('questionInput').value.trim()
  const category = getElement('categoryFilter').value

  if (!query) {
    showAppMessage(
      'Enter a question or keyword to search the knowledge library.',
      'warning',
    )
    getElement('questionInput').focus()
    return
  }

  const words = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)

  const ranked = articles
    .filter(article => category === 'all' || article.category === category)
    .map(article => {
      const title = article.title.toLowerCase()
      const summary = article.summary.toLowerCase()
      const searchable = [
        title,
        summary,
        article.category,
        article.answer,
        ...article.keywords,
      ]
        .join(' ')
        .toLowerCase()

      let score = 0

      words.forEach(word => {
        if (title.includes(word)) score += 5
        if (summary.includes(word)) score += 3
        if (article.keywords.some(keyword => keyword.includes(word))) score += 4
        if (searchable.includes(word)) score += 1
      })

      return {
        article,
        score,
      }
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)

  renderArticles()

  if (ranked.length > 0) {
    openArticle(ranked[0].article.id)
    showAppMessage('Found a relevant article in your sample knowledge library.')
  } else {
    const answerBox = getElement('knowledgeAnswer')
    answerBox.replaceChildren()

    const heading = document.createElement('h4')
    heading.textContent = 'No exact match found'

    const paragraph = document.createElement('p')
    paragraph.textContent =
      'Try keywords such as password, payment, membership, website design, mobile, or technical issue. This prototype searches sample articles only.'

    answerBox.append(heading, paragraph)
    showAppMessage('No matching article found. Try another keyword.', 'warning')
  }
}

// ---------- INBOX AGENT ----------

function generateEmailReply() {
  const category = getElement('emailCategory').value
  const customerMessage = getElement('emailInput').value.trim()

  if (!customerMessage) {
    showFeedback(
      'draftFeedback',
      "Please enter the customer's message first.",
      true,
    )
    getElement('emailInput').focus()
    return
  }

  const replies = {
    technical: {
      subject: 'Technical support',
      body: "Thank you for contacting us. I'm sorry you're experiencing this technical issue. Please try refreshing the page and checking your internet connection. If the issue continues, let us know which steps caused it and include any error message you see so our team can investigate further.",
    },
    billing: {
      subject: 'Billing support',
      body: 'Thank you for reaching out about your billing concern. We understand how important it is to have clear and accurate payment information. Please share your order or transaction reference through our official support channel. Our team can review the details and explain the next steps in accordance with the applicable billing policy.',
    },
    feature: {
      subject: 'Feature request',
      body: 'Thank you for sharing your feature suggestion with us. We appreciate your feedback and the time you took to explain what would be helpful. We will document your suggestion for review. While we cannot promise a delivery date, feedback like yours helps us evaluate future improvements.',
    },
    account: {
      subject: 'Account access support',
      body: 'Thank you for contacting us about your account access. Please use the official password-reset option on the sign-in page and check your inbox and spam folder for the instructions. For your security, please do not send us your password or verification codes. If you still cannot sign in, let our support team know the error message.',
    },
  }

  const reply = replies[category]

  const draft =
    `Subject: ${reply.subject}\n\n` +
    `Hello,\n\n` +
    `${reply.body}\n\n` +
    `If you have any additional details, please reply to this message and we will be happy to help.\n\n` +
    `Best regards,\nCustomer Support Team`

  getElement('draftOutput').value = draft
  updateCharacterCount()

  progress.draftsCreated += 1
  saveProgress()
  updateDashboard()

  showFeedback(
    'draftFeedback',
    'Reply generated. Review and edit it before copying or approving.',
  )

  showAppMessage('Customer reply draft created successfully.')
}

function updateCharacterCount() {
  const length = getElement('draftOutput').value.length
  getElement('characterCount').textContent = `${length} character${
    length === 1 ? '' : 's'
  }`
}

async function copyDraft() {
  const draft = getElement('draftOutput').value.trim()

  if (!draft) {
    showFeedback(
      'draftFeedback',
      'Generate or enter a reply before copying it.',
      true,
    )
    return
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(draft)
    } else {
      const temporaryTextArea = document.createElement('textarea')
      temporaryTextArea.value = draft
      temporaryTextArea.style.position = 'fixed'
      temporaryTextArea.style.opacity = '0'
      document.body.appendChild(temporaryTextArea)
      temporaryTextArea.select()

      const copied = document.execCommand('copy')
      temporaryTextArea.remove()

      if (!copied) throw new Error('Copy command was not successful.')
    }

    showFeedback('draftFeedback', 'Reply copied to your clipboard.')
  } catch (error) {
    showFeedback(
      'draftFeedback',
      'Automatic copying failed. Select the reply text and copy it manually.',
      true,
    )
  }
}

function approveDraft() {
  const draft = getElement('draftOutput').value.trim()

  if (!draft) {
    showFeedback(
      'draftFeedback',
      'Create or enter a reply before approving it.',
      true,
    )
    return
  }

  showFeedback(
    'draftFeedback',
    'Marked as approved in this session. Please verify the content before sending.',
  )
}

function clearDraft() {
  getElement('emailInput').value = ''
  getElement('draftOutput').value = ''
  updateCharacterCount()
  showFeedback('draftFeedback', 'Reply fields cleared.')
}

// ---------- MEETING TO SCOPE ----------

function estimateProjectTasks(notes) {
  const text = notes.toLowerCase()

  const taskDefinitions = [
    {
      name: 'Requirements review and planning',
      keywords: ['requirement', 'planning', 'plan', 'meeting', 'scope'],
      hours: 4,
    },
    {
      name: 'UI/UX and visual design',
      keywords: ['design', 'ui', 'ux', 'wireframe', 'prototype', 'layout'],
      hours: 8,
    },
    {
      name: 'Responsive website or frontend development',
      keywords: [
        'website',
        'frontend',
        'front-end',
        'html',
        'css',
        'page',
        'responsive',
        'interface',
      ],
      hours: 16,
    },
    {
      name: 'Backend and API development',
      keywords: [
        'backend',
        'back-end',
        'api',
        'server',
        'database',
        'integration',
      ],
      hours: 16,
    },
    {
      name: 'Login and account functionality',
      keywords: [
        'login',
        'log in',
        'authentication',
        'signup',
        'sign up',
        'account',
        'password',
      ],
      hours: 8,
    },
    {
      name: 'Dashboard and reporting',
      keywords: ['dashboard', 'report', 'analytics', 'chart', 'admin'],
      hours: 8,
    },
    {
      name: 'Payment functionality',
      keywords: [
        'payment',
        'checkout',
        'billing',
        'transaction',
        'subscription',
      ],
      hours: 10,
    },
    {
      name: 'Testing and quality assurance',
      keywords: ['test', 'testing', 'qa', 'quality', 'bug', 'debug'],
      hours: 6,
    },
    {
      name: 'Deployment and handover',
      keywords: [
        'deploy',
        'deployment',
        'hosting',
        'launch',
        'publish',
        'handover',
      ],
      hours: 4,
    },
  ]

  const selectedTasks = taskDefinitions.filter(task =>
    task.keywords.some(keyword => text.includes(keyword)),
  )

  if (selectedTasks.length === 0) {
    selectedTasks.push({
      name: 'Initial implementation and discovery',
      hours: 8,
    })

    selectedTasks.push({
      name: 'Testing and review',
      hours: 4,
    })
  }

  if (!selectedTasks.some(task => task.name.includes('Requirements'))) {
    selectedTasks.unshift({
      name: 'Requirements review and planning',
      hours: 4,
    })
  }

  return selectedTasks
}

function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function generateProjectScope() {
  const notes = getElement('meetingInput').value.trim()
  const rate = Number(getElement('hourlyRate').value)
  const contingency = Number(getElement('contingency').value)

  if (!notes) {
    showFeedback(
      'scopeFeedback',
      'Please enter your meeting notes first.',
      true,
    )
    getElement('meetingInput').focus()
    return
  }

  if (!Number.isFinite(rate) || rate < 0) {
    showFeedback(
      'scopeFeedback',
      'Enter a valid non-negative hourly rate.',
      true,
    )
    getElement('hourlyRate').focus()
    return
  }

  if (!Number.isFinite(contingency) || contingency < 0 || contingency > 100) {
    showFeedback(
      'scopeFeedback',
      'Contingency must be between 0 and 100 percent.',
      true,
    )
    getElement('contingency').focus()
    return
  }

  const tasks = estimateProjectTasks(notes)
  const baseHours = tasks.reduce((total, task) => total + task.hours, 0)
  const contingencyHours = baseHours * (contingency / 100)
  const totalHours = baseHours + contingencyHours
  const baseCost = baseHours * rate
  const contingencyCost = baseCost * (contingency / 100)
  const totalCost = baseCost + contingencyCost

  const taskLines = tasks.map(
    (task, index) => `${index + 1}. ${task.name} — ${task.hours} hours`,
  )

  const scope = `PROJECT SCOPE — INITIAL DRAFT
========================================

1. PROJECT OVERVIEW
Based on the meeting notes, this project will address the following requirements:

${notes}

2. PROPOSED TASKS
${taskLines.join('\n')}

3. ESTIMATION SUMMARY
Base estimated effort: ${baseHours} hours
Contingency: ${contingency}% (${contingencyHours.toFixed(1)} hours)
Total estimated effort: ${totalHours.toFixed(1)} hours

Hourly rate: ${formatRupees(rate)}
Base estimated cost: ${formatRupees(baseCost)}
Contingency allowance: ${formatRupees(contingencyCost)}
TOTAL ESTIMATED COST: ${formatRupees(totalCost)}

4. ASSUMPTIONS
- Estimates are based only on the supplied meeting notes.
- Requirements, integrations, and technical complexity must be confirmed.
- Client feedback and approval timelines may affect delivery.
- Any work outside the agreed scope may require a revised estimate.

5. ITEMS TO CONFIRM
- Final features and acceptance criteria
- Design and content responsibilities
- Required integrations and third-party services
- Testing, deployment, and maintenance expectations
- Project milestones, deadlines, and payment terms

6. NEXT STEPS
1. Review this draft with the client or project team.
2. Confirm the task list and effort estimates.
3. Agree on milestones, deliverables, and acceptance criteria.
4. Approve the final scope before starting implementation.

DISCLAIMER
This is an illustrative planning estimate generated by keyword matching.
It is not an AI model assessment, a binding quotation, or a guarantee of delivery time.`

  getElement('scopeOutput').value = scope

  progress.scopesPrepared += 1
  saveProgress()
  updateDashboard()

  showFeedback(
    'scopeFeedback',
    'Project scope generated. Review the task list, hours, and cost before approval.',
  )

  showAppMessage('Project scope generated successfully.')
}

function approveScope() {
  const scope = getElement('scopeOutput').value.trim()

  if (!scope) {
    showFeedback(
      'scopeFeedback',
      'Generate a project scope before approving it.',
      true,
    )
    return
  }

  showFeedback(
    'scopeFeedback',
    'Marked as approved in this session. Confirm the estimates with your project team.',
  )
}

function clearScope() {
  getElement('scopeOutput').value = ''
  showFeedback('scopeFeedback', 'Project scope cleared.')
}

// ---------- RESET ALL PROGRESS ----------

function resetAllProgress() {
  const confirmed = window.confirm(
    'Reset all progress? This will clear your counters, viewed-article history, generated reply, and generated project scope.',
  )

  if (!confirmed) return

  progress.draftsCreated = 0
  progress.scopesPrepared = 0
  progress.articlesViewed = []

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Saved progress could not be removed.', error)
  }

  // Clear generated content and feedback.
  getElement('questionInput').value = ''
  getElement('categoryFilter').value = 'all'
  getElement('emailInput').value = ''
  getElement('draftOutput').value = ''
  getElement('meetingInput').value = ''
  getElement('hourlyRate').value = '1000'
  getElement('contingency').value = '15'
  getElement('scopeOutput').value = ''

  getElement('knowledgeAnswer').innerHTML =
    '<p class="muted mb-0">Your answer will appear here. You can also open an article from the library.</p>'

  showFeedback('draftFeedback', '')
  showFeedback('scopeFeedback', '')
  updateCharacterCount()
  updateDashboard()
  renderArticles()
  switchTask('knowledge')

  showAppMessage('All progress has been reset.')
}

// ---------- EVENT LISTENERS ----------

function initializeApp() {
  loadProgress()
  updateDashboard()
  updateCharacterCount()
  renderArticles()

  document.querySelectorAll('.task-tab').forEach(button => {
    button.addEventListener('click', () => {
      switchTask(button.dataset.task)
    })
  })

  getElement('askBtn').addEventListener('click', findKnowledgeAnswer)

  getElement('questionInput').addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      findKnowledgeAnswer()
    }
  })

  getElement('categoryFilter').addEventListener('change', renderArticles)

  getElement('draftBtn').addEventListener('click', generateEmailReply)
  getElement('draftOutput').addEventListener('input', updateCharacterCount)
  getElement('copyDraftBtn').addEventListener('click', copyDraft)
  getElement('approveDraftBtn').addEventListener('click', approveDraft)
  getElement('clearDraftBtn').addEventListener('click', clearDraft)

  getElement('scopeBtn').addEventListener('click', generateProjectScope)
  getElement('approveScopeBtn').addEventListener('click', approveScope)
  getElement('resetScopeBtn').addEventListener('click', clearScope)

  getElement('resetAllBtn').addEventListener('click', resetAllProgress)
}

// Run after the HTML elements are available.
document.addEventListener('DOMContentLoaded', initializeApp)
