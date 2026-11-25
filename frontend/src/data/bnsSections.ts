// Common BNS 2023 (Bharatiya Nyaya Sanhita) sections with their IPC equivalents,
// for the charge-sheet "sections invoked" picker. Not exhaustive — the field also
// accepts free text (e.g. a subsection like "BNS 303(2)").
export interface BnsSection {
  code: string   // stored token, e.g. "BNS 303"
  title: string  // offence
  ipc: string    // corresponding IPC section(s)
}

export const BNS_SECTIONS: BnsSection[] = [
  // Offences affecting the human body
  { code: 'BNS 103', title: 'Murder', ipc: '302' },
  { code: 'BNS 105', title: 'Culpable homicide not amounting to murder', ipc: '304' },
  { code: 'BNS 106', title: 'Causing death by negligence', ipc: '304A' },
  { code: 'BNS 109', title: 'Attempt to murder', ipc: '307' },
  { code: 'BNS 115', title: 'Voluntarily causing hurt', ipc: '323' },
  { code: 'BNS 117', title: 'Voluntarily causing grievous hurt', ipc: '325' },
  { code: 'BNS 118', title: 'Hurt by dangerous weapons or means', ipc: '324 / 326' },
  { code: 'BNS 126', title: 'Wrongful restraint', ipc: '341' },
  { code: 'BNS 127', title: 'Wrongful confinement', ipc: '342' },
  { code: 'BNS 131', title: 'Assault or criminal force', ipc: '352' },
  { code: 'BNS 137', title: 'Kidnapping', ipc: '363' },
  { code: 'BNS 140', title: 'Kidnapping for ransom', ipc: '364A' },

  // Offences against women / children
  { code: 'BNS 64',  title: 'Rape', ipc: '376' },
  { code: 'BNS 74',  title: 'Assault to outrage modesty of a woman', ipc: '354' },
  { code: 'BNS 75',  title: 'Sexual harassment', ipc: '354A' },
  { code: 'BNS 79',  title: 'Word or gesture to insult modesty of a woman', ipc: '509' },
  { code: 'BNS 80',  title: 'Dowry death', ipc: '304B' },
  { code: 'BNS 85',  title: 'Cruelty by husband or relatives', ipc: '498A' },

  // Offences against property
  { code: 'BNS 303', title: 'Theft', ipc: '378 / 379' },
  { code: 'BNS 304', title: 'Snatching', ipc: '— (new)' },
  { code: 'BNS 305', title: 'Theft in a dwelling / of means of transport', ipc: '380' },
  { code: 'BNS 306', title: 'Theft by clerk or servant', ipc: '381' },
  { code: 'BNS 308', title: 'Extortion', ipc: '383 / 384' },
  { code: 'BNS 309', title: 'Robbery', ipc: '390 / 392' },
  { code: 'BNS 310', title: 'Dacoity', ipc: '391 / 395' },
  { code: 'BNS 314', title: 'Dishonest misappropriation of property', ipc: '403' },
  { code: 'BNS 316', title: 'Criminal breach of trust', ipc: '405 / 406' },
  { code: 'BNS 317', title: 'Stolen property (receiving/retaining)', ipc: '410 / 411' },
  { code: 'BNS 318', title: 'Cheating', ipc: '415 / 420' },
  { code: 'BNS 319', title: 'Cheating by personation', ipc: '416 / 419' },
  { code: 'BNS 324', title: 'Mischief', ipc: '425 / 427' },
  { code: 'BNS 329', title: 'Criminal trespass / house-trespass', ipc: '441 / 448' },
  { code: 'BNS 331', title: 'House-breaking', ipc: '445 / 454 / 457' },

  // Documents & forgery
  { code: 'BNS 336', title: 'Forgery', ipc: '463 / 465' },
  { code: 'BNS 338', title: 'Forgery of valuable security or will', ipc: '467' },
  { code: 'BNS 340', title: 'Using as genuine a forged document', ipc: '471' },

  // Public tranquillity & others
  { code: 'BNS 61',  title: 'Criminal conspiracy', ipc: '120B' },
  { code: 'BNS 62',  title: 'Attempt to commit offences', ipc: '511' },
  { code: 'BNS 189', title: 'Unlawful assembly', ipc: '141 / 143' },
  { code: 'BNS 191', title: 'Rioting', ipc: '146 / 147' },
  { code: 'BNS 196', title: 'Promoting enmity between groups', ipc: '153A' },
  { code: 'BNS 270', title: 'Public nuisance', ipc: '268 / 290' },
  { code: 'BNS 299', title: 'Outraging religious feelings', ipc: '295A' },
  { code: 'BNS 351', title: 'Criminal intimidation', ipc: '503 / 506' },
  { code: 'BNS 352', title: 'Intentional insult to provoke breach of peace', ipc: '504' },
  { code: 'BNS 356', title: 'Defamation', ipc: '499 / 500' },
]
