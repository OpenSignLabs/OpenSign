import { OTP_LENGTH, RESEND_COOLDOWN_SEC } from './deleteUtils.js';

// 1. HTML Password Prompt Page
export const deleteUserGet = async (req, res) => {
  const { userId } = req.params;

  const extUserQuery = new Parse.Query('contracts_Users');
  extUserQuery.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
  const extUser = await extUserQuery.first({ useMasterKey: true });
  if (!extUser) return res.status(404).send('User not found.');

  const routePath = process?.env?.SERVER_URL?.includes?.('api') ? '/api' : '';

  const htmlForm = `
<html>
<head>
  <title>Delete Account</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
    .container { background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); width: 100%; max-width: 420px; text-align: center; }
    h2 { color: #dc3545; margin-bottom: 14px; }
    p.warning { color: #6c757d; font-size: 14px; margin-top: 0; margin-bottom: 18px; }

    label { display: block; margin-bottom: 10px; font-weight: 600; text-align: left; }
    input[type="text"] { width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; letter-spacing: 0.2em; }

    button { background-color: #d9534f; color: #ffffff; border: none; padding: 12px 16px; font-size: 16px; border-radius: 4px; cursor: pointer; transition: background-color 0.3s ease; }
    button:hover { background-color: #c9302c; }
    .secondary { background-color: #6c757d; }
    .secondary:hover { background-color: #5a6268; }
    .btn-block { width: 100%; }

    .link-btn { background: transparent; border: none; color: #0d6efd; text-decoration: underline; padding: 0; font-size: 14px; cursor: pointer; }
    .link-btn[disabled] { color: #6c757d; text-decoration: none; cursor: not-allowed; }

    .muted { color: #6c757d; font-size: 13px; margin-top: 8px; min-height: 18px; }
    .error { color: #c9302c; font-size: 13px; margin-top: 8px; min-height: 18px; }

    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Confirm Account Deletion</h2>

    <!-- Initial view: only Send OTP -->
    <div id="preOtp">
      <p class="warning">This action is irreversible. A verification mail will be sent to your account to your registered email.</p>
      <button type="button" id="sendOtpBtn" class="secondary btn-block">Send OTP</button>
      <div id="preMsg" class="muted"></div>
      <div id="preErr" class="error"></div>
    </div>

    <!-- Shown after OTP is sent -->
    <form id="otpForm" class="hidden" method="POST" action="${routePath}/delete-account/${userId}">
      <p class="warning">This action is irreversible. Verify with an OTP sent to your registered email.</p>
      <label for="otp">One-Time Password (OTP)</label>
      <input type="text" name="otp" id="otp" placeholder="Enter ${OTP_LENGTH}-digit OTP" required maxlength="${OTP_LENGTH}" inputmode="numeric" />

      <div style="text-align:center; margin-top: 10px;">
        <button type="submit" id="deleteBtn">Delete My Account</button>
      </div>

      <div style="text-align:center; margin-top: 10px;">
        <button type="button" id="resendOtpLink" class="link-btn">Resend OTP</button>
      </div>

      <div id="timer" class="muted"></div>
      <div id="msg" class="muted"></div>
      <div id="err" class="error"></div>
    </form>
  </div>

  <script>
    (function(){
      const preOtp = document.getElementById('preOtp');
      const sendBtn = document.getElementById('sendOtpBtn');
      const preMsg = document.getElementById('preMsg');
      const preErr = document.getElementById('preErr');

      const form = document.getElementById('otpForm');
      const otpInput = document.getElementById('otp');
      const resendLink = document.getElementById('resendOtpLink');
      const timerEl = document.getElementById('timer');
      const msgEl = document.getElementById('msg');
      const errEl = document.getElementById('err');

      const RESEND_WAIT = ${RESEND_COOLDOWN_SEC};
      let countdown = 0;
      let iv = null;

      function setText(el, t){ el.textContent = t || ''; }
      function updateResendState(){
        resendLink.disabled = countdown>0;
        if(countdown>0){
          resendLink.setAttribute('disabled','true');
          resendLink.style.pointerEvents='none';
        }else{
          resendLink.removeAttribute('disabled');
          resendLink.style.pointerEvents='auto';
        }
      }
      function tick(){
        if(countdown<=0){ clearInterval(iv); iv=null; setText(timerEl,'You can resend the OTP now.'); updateResendState(); return; }
        setText(timerEl,'Resend available in '+countdown+'s'); countdown--; updateResendState();
      }
      function startTimer(sec){ countdown=sec||RESEND_WAIT; if(iv) clearInterval(iv); tick(); iv=setInterval(tick,1000); }

      async function sendOtp(showForm){
        setText(preErr,''); setText(preMsg,'Sending OTP...');
        try {
          const resp = await fetch('${routePath}/delete-account/${userId}/otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
          const data = await resp.json().catch(()=>({}));
          if(!resp.ok){ 
            if(resp.status===429 && data?.retryAfterSec){
              startTimer(data.retryAfterSec); setText(preErr,'Please wait '+data.retryAfterSec+'s before resending.'); setText(preMsg,'');
              return;
            }
            throw new Error(data?.error || 'Failed to send OTP.');
          }
          startTimer(data?.cooldownSec || RESEND_WAIT);

          // Success: hide pre, show form
          preOtp.classList.add('hidden');
          form.classList.remove('hidden');
          setText(msgEl,'OTP sent to your registered email.');
          otpInput.focus();

        } catch(e){
          setText(preErr,e.message||'Error sending OTP.');
          setText(preMsg,'');
        }
      }

      sendBtn.addEventListener('click',()=>sendOtp(true));
      resendLink.addEventListener('click',()=>{ if(countdown<=0) sendOtp(false); });
    })();
  </script>
</body>
</html>
  `;
  res.send(htmlForm);
};
