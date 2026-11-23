<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>e-Cops · Sign In</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      background-image: url('${url.resourcesPath}/img/crime-tape.png');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-family: 'Space Grotesk', system-ui, sans-serif;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, rgba(10,10,10,0.93) 0%, rgba(55,30,30,0.82) 50%, rgba(10,10,10,0.93) 100%);
      z-index: 0;
    }

    .card {
      position: relative;
      z-index: 1;
      background: rgba(55,30,30,0.75);
      border: 2px solid #726E68;
      border-radius: 4px;
      padding: 40px 52px 44px;
      width: 420px;
      max-width: calc(100vw - 32px);
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 0 1px #33312F, 0 32px 80px rgba(10,10,10,0.95);
    }

    /* ---- Globe logo ---- */
    .logo-svg { display: block; margin: 0 auto; overflow: visible; }

    /* ---- Text ---- */
    .sub1 {
      font-family: 'Anton', Impact, sans-serif;
      font-size: 12px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #726E68;
      margin-top: 4px;
      margin-bottom: 4px;
    }
    .sub2 {
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #726E68;
      opacity: 0.75;
      margin-bottom: 28px;
    }

    .divider {
      border: none;
      border-top: 1px solid rgba(114,110,104,0.27);
      margin-bottom: 24px;
    }

    /* ---- Error ---- */
    .error-box {
      background: rgba(55,30,30,0.9);
      border: 1px solid #726E68;
      border-radius: 3px;
      color: #B7B4AE;
      font-size: 12px;
      letter-spacing: 0.04em;
      padding: 10px 14px;
      margin-bottom: 20px;
      text-align: left;
    }

    /* ---- Form ---- */
    .field { margin-bottom: 16px; text-align: left; }

    label {
      display: block;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #726E68;
      margin-bottom: 6px;
    }

    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 11px 14px;
      background: #33312F;
      border: 1px solid #726E68;
      border-radius: 3px;
      color: #B7B4AE;
      font-family: 'Space Grotesk', system-ui, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;
    }
    input[type="text"]:focus,
    input[type="password"]:focus {
      border-color: #B7B4AE;
    }
    input[type="text"]::placeholder,
    input[type="password"]::placeholder {
      color: rgba(183,180,174,0.3);
    }

    .btn-signin {
      width: 100%;
      padding: 14px 0;
      background: transparent;
      border: 1.5px solid #726E68;
      border-radius: 3px;
      color: #B7B4AE;
      font-family: 'Anton', Impact, sans-serif;
      font-size: 15px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.15s, color 0.15s;
    }
    .btn-signin:hover {
      background: #726E68;
      color: #0A0A0A;
    }

    .footer-note {
      font-size: 10px;
      color: #726E68;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 20px;
    }

    /* ---- Bottom bar ---- */
    .bottom-bar {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      border-top: 1px solid #33312F;
      background: rgba(10,10,10,0.8);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
    }
    .bottom-bar span {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .bottom-bar .left  { color: #726E68; }
    .bottom-bar .right { color: #33312F; }
  </style>
</head>
<body>

<div class="overlay"></div>

<div class="card">

  <!-- Globe logo (pure SVG matching the React LoginPage) -->
  <svg class="logo-svg" viewBox="-130 -128 260 256" width="200" height="200">
    <defs>
      <clipPath id="gc"><circle cx="0" cy="0" r="88"/></clipPath>
      <clipPath id="of"><rect x="-200" y="0" width="400" height="200"/></clipPath>
      <clipPath id="ob"><rect x="-200" y="-200" width="400" height="200"/></clipPath>
    </defs>
    <!-- Globe fill -->
    <circle cx="0" cy="0" r="88" fill="#0A0A0A"/>
    <!-- Grid lines -->
    <g clip-path="url(#gc)" stroke="#B7B4AE" stroke-width="0.8" fill="none" opacity="0.45">
      <ellipse cx="0" cy="-66" rx="57.3" ry="16.0"/>
      <ellipse cx="0" cy="-44" rx="76.1" ry="21.3"/>
      <ellipse cx="0" cy="-22" rx="85.2" ry="23.9"/>
      <ellipse cx="0" cy="0"   rx="88"   ry="24.6"/>
      <ellipse cx="0" cy="22"  rx="85.2" ry="23.9"/>
      <ellipse cx="0" cy="44"  rx="76.1" ry="21.3"/>
      <ellipse cx="0" cy="66"  rx="57.3" ry="16.0"/>
      <ellipse cx="0" cy="0" rx="24.6" ry="88" transform="rotate(0)"/>
      <ellipse cx="0" cy="0" rx="24.6" ry="88" transform="rotate(30)"/>
      <ellipse cx="0" cy="0" rx="24.6" ry="88" transform="rotate(60)"/>
      <ellipse cx="0" cy="0" rx="24.6" ry="88" transform="rotate(90)"/>
      <ellipse cx="0" cy="0" rx="24.6" ry="88" transform="rotate(120)"/>
      <ellipse cx="0" cy="0" rx="24.6" ry="88" transform="rotate(150)"/>
    </g>
    <!-- Globe border -->
    <circle cx="0" cy="0" r="88" fill="none" stroke="#B7B4AE" stroke-width="1.5"/>
    <!-- Orbit ring back -->
    <ellipse cx="4" cy="10" rx="118" ry="28" fill="none" stroke="#726E68" stroke-width="3"
      transform="rotate(-18)" clip-path="url(#ob)" stroke-dasharray="4 2"/>
    <!-- e-Cops text -->
    <text x="0" y="18" text-anchor="middle"
      font-family="Anton, Impact, sans-serif" font-size="58"
      fill="#B7B4AE" stroke="#0A0A0A" stroke-width="6" paint-order="stroke"
      letter-spacing="-1">e-Cops</text>
    <!-- Orbit ring front -->
    <ellipse cx="4" cy="10" rx="118" ry="28" fill="none" stroke="#B7B4AE" stroke-width="3"
      transform="rotate(-18)" clip-path="url(#of)"/>
    <circle cx="112" cy="30" r="5" fill="#B7B4AE" transform="rotate(-18, 4, 10)"/>
    <!-- Stars -->
    <polygon points="-118,31 -114.5,38.5 -118,46 -121.5,38.5" fill="#B7B4AE"
      transform="scale(1.1) translate(0,-4)"/>
    <polygon points="-118,30 -109,38.5 -118,47 -127,38.5" fill="#B7B4AE" opacity="0"/>
    <polygon fill="#B7B4AE"
      points="-118,31 -114.9,34.1 -118,37.2 -121.1,34.1
              -118,31 -115,38.5 -118,46 -121,38.5"/>
    <!-- 4-pointed stars proper -->
    <g fill="#B7B4AE">
      <polygon points="-118,22 -116,38.5 -118,55 -120,38.5"/>
      <polygon points="-131,38.5 -118,36.5 -105,38.5 -118,40.5"/>
    </g>
    <g fill="#B7B4AE">
      <polygon points="106,-70 107.6,-61 106,-52 104.4,-61"/>
      <polygon points="98,-61 106,-59.4 114,-61 106,-62.6"/>
    </g>
    <g fill="#B7B4AE" opacity="0.7">
      <polygon points="-90,-86 -88.8,-80 -90,-74 -91.2,-80"/>
      <polygon points="-96,-80 -90,-78.8 -84,-80 -90,-81.2"/>
    </g>
    <g fill="#B7B4AE" opacity="0.6">
      <polygon points="118,64 119,70 118,76 117,70"/>
      <polygon points="112,70 118,69 124,70 118,71"/>
    </g>
  </svg>

  <p class="sub1">Bengaluru City Police</p>
  <p class="sub2">Virtual Police Station</p>
  <hr class="divider"/>

  <!-- Error message -->
  <#if message?has_content && message.type == 'error'>
    <div class="error-box">${kcSanitize(message.summary)?no_esc}</div>
  </#if>

  <!-- Login form -->
  <form action="${url.loginAction}" method="post">
    <input type="hidden" id="id-hidden-input" name="credentialId" value="${(auth.selectedCredential)!''}"/>

    <div class="field">
      <label for="username">Username or Email</label>
      <input
        id="username" name="username" type="text"
        value="${(login.username)!''}"
        placeholder="Enter your username"
        autocomplete="username"
        autofocus
        <#if usernameEditDisabled??>disabled</#if>
      />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <input
        id="password" name="password" type="password"
        placeholder="Enter your password"
        autocomplete="current-password"
      />
    </div>

    <button class="btn-signin" type="submit" name="login">Sign In</button>
  </form>

  <p class="footer-note">BNSS 2023 · Authorised Personnel Only</p>
</div>

<div class="bottom-bar">
  <span class="left">Government of Karnataka</span>
  <span class="right">Restricted Access</span>
</div>

</body>
</html>
