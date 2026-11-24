<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>e-Cops · Sign In</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #16406A 0%, #1C4E80 55%, #2C6AA6 100%);
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 40px 40px 30px;
      width: 100%; max-width: 400px;
      text-align: center;
      box-shadow: 0 24px 60px rgba(16,32,44,0.30);
    }
    .crest {
      width: 64px; height: 64px; border-radius: 16px;
      background: #1C4E80;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
      box-shadow: 0 6px 18px rgba(28,78,128,0.35);
    }
    .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: #16202C; }
    .sub1  { font-size: 14px; font-weight: 600; color: #1C4E80; margin-top: 4px; }
    .sub2  { font-size: 13px; color: #5A6676; margin-top: 2px; }
    .divider { border: none; border-top: 1px solid #E3E8EE; margin: 24px 0 20px; }
    .field { margin-bottom: 14px; text-align: left; }
    label {
      display: block; font-size: 13px; font-weight: 600; color: #16202C; margin-bottom: 6px;
    }
    input[type="text"], input[type="password"] {
      width: 100%; padding: 11px 12px;
      background: #fff; border: 1.5px solid #9FB3CC; border-radius: 6px;
      color: #16202C; font-family: inherit; font-size: 14px; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input[type="text"]:focus, input[type="password"]:focus {
      border-color: #1C4E80; box-shadow: 0 0 0 3px rgba(28,78,128,0.15);
    }
    input::placeholder { color: #9AA4B0; }
    .pw-wrap { position: relative; }
    .pw-wrap input { padding-right: 44px; }
    .pw-toggle {
      position: absolute; right: 4px; top: 0; bottom: 0; width: 38px;
      display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; cursor: pointer; color: #5A6676; padding: 0;
    }
    .pw-toggle:hover { color: #1C4E80; }
    .btn-signin {
      width: 100%; padding: 13px 0; margin-top: 6px;
      background: #1C4E80; color: #fff; border: none; border-radius: 8px;
      font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
      transition: background 0.15s;
    }
    .btn-signin:hover { background: #16406A; }
    .error-box {
      background: #FEF3F2; border: 1px solid #FECDCA; color: #B91C1C;
      font-size: 13px; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; text-align: left;
    }
    .footer-note { font-size: 12px; color: #8A94A1; margin-top: 16px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="crest">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8.3 7.5 9.9 4.4-1.6 7.5-5.3 7.5-9.9v-6L12 2.5Z" fill="#fff" fill-opacity="0.95"/>
        <path d="M12 7.3l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L12 7.3Z" fill="#1C4E80"/>
      </svg>
    </div>

    <div class="brand">e-Cops</div>
    <div class="sub1">Bengaluru City Police</div>
    <div class="sub2">Virtual Police Station</div>

    <hr class="divider"/>

    <#if message?has_content && message.type == 'error'>
      <div class="error-box">${kcSanitize(message.summary)?no_esc}</div>
    </#if>

    <form action="${url.loginAction}" method="post">
      <input type="hidden" id="id-hidden-input" name="credentialId" value="${(auth.selectedCredential)!''}"/>

      <div class="field">
        <label for="username">Username or email</label>
        <input id="username" name="username" type="text"
               value="${(login.username)!''}"
               placeholder="e.g. officer_kumar"
               autocomplete="username" autofocus
               <#if usernameEditDisabled??>disabled</#if>/>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <div class="pw-wrap">
          <input id="password" name="password" type="password"
                 placeholder="Enter your password" autocomplete="current-password"/>
          <button type="button" class="pw-toggle" id="pwToggle" aria-label="Show password" onclick="togglePw()">
            <svg id="eyeOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg id="eyeOff" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.06 6.06A13.2 13.2 0 0 0 2 11s3.5 7 10 7a9.12 9.12 0 0 0 5.94-2.06"/><path d="m1 1 22 22"/>
            </svg>
          </button>
        </div>
      </div>

      <button class="btn-signin" type="submit" name="login">Sign in</button>
    </form>

    <p class="footer-note">Authorised personnel only · BNSS 2023<br/>Government of Karnataka</p>
  </div>
  <script>
    function togglePw() {
      var i = document.getElementById('password');
      var show = i.type === 'password';
      i.type = show ? 'text' : 'password';
      document.getElementById('pwToggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      document.getElementById('eyeOpen').style.display = show ? 'none' : 'block';
      document.getElementById('eyeOff').style.display = show ? 'block' : 'none';
    }
  </script>
</body>
</html>
