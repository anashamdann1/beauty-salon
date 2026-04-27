 // ─── CURSOR ───────────────────────────────
 const cursor = document.getElementById('cursor');
 const ring = document.getElementById('cursorRing');
 document.addEventListener('mousemove', e => {
   cursor.style.left = e.clientX + 'px';
   cursor.style.top = e.clientY + 'px';
   setTimeout(() => {
     ring.style.left = e.clientX + 'px';
     ring.style.top = e.clientY + 'px';
   }, 80);
 });

 // ─── NAV SCROLL ───────────────────────────
 window.addEventListener('scroll', () => {
   document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
 });

 // ─── MOBILE MENU ─────────────────────────
 document.getElementById('hamburger').addEventListener('click', () => {
   document.getElementById('mobileMenu').classList.add('open');
 });
 document.getElementById('mobileClose').addEventListener('click', closeMobile);
 function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }

 // ─── REVEAL ON SCROLL ─────────────────────
 const revealEls = document.querySelectorAll('.reveal');
 const io = new IntersectionObserver(entries => {
   entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }});
 }, { threshold: 0.12 });
 revealEls.forEach(el => io.observe(el));

 // ─── SERVICE PAGES ────────────────────────
 function showService(id) {
   document.getElementById('main-site').style.display = 'none';
   document.querySelectorAll('.service-page').forEach(p => p.classList.remove('active'));
   document.getElementById('page-' + id).classList.add('active');
   window.scrollTo(0, 0);
 }
 function hideService() {
   document.getElementById('main-site').style.display = 'block';
   document.querySelectorAll('.service-page').forEach(p => p.classList.remove('active'));
   setTimeout(() => {
     document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
   }, 100);
 }
 function goToBooking(service) {
   document.getElementById('main-site').style.display = 'block';
   document.querySelectorAll('.service-page').forEach(p => p.classList.remove('active'));
   setTimeout(() => {
     document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
     const sel = document.getElementById('f-service');
     for (let i = 0; i < sel.options.length; i++) {
       if (sel.options[i].text.includes(service)) { sel.selectedIndex = i; break; }
     }
   }, 100);
 }

 // ─── TIME SLOTS ───────────────────────────
 let selectedTime = '';
 function selectTime(el) {
   if (el.classList.contains('taken')) return;
   document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
   el.classList.add('selected');
   selectedTime = el.textContent;
 }

 // ─── BOOKING → GMAIL ──────────────────────
 function submitBooking() {
   const fname = document.getElementById('f-fname').value.trim();
   const lname = document.getElementById('f-lname').value.trim();
   const email = document.getElementById('f-email').value.trim();
   const phone = document.getElementById('f-phone').value.trim();
   const service = document.getElementById('f-service').value;
   const date = document.getElementById('f-date').value;
   const message = document.getElementById('f-message').value.trim();

   if (!fname || !email || !service || !date || !selectedTime) {
     alert('narrobeauty0@gmail.com');
     return;
   }

   const subject = encodeURIComponent(`Booking Request – ${service} – ${date} at ${selectedTime}`);
   const body = encodeURIComponent(
`Hello Narro Beauty Team,

I would like to book an appointment. Here are my details:

Name: ${fname} ${lname}
Email: ${email}
Phone: ${phone || 'Not provided'}
Service: ${service}
Preferred Date: ${date}
Preferred Time: ${selectedTime}
${message ? '\nAdditional notes:\n' + message : ''}

Please confirm my appointment at your earliest convenience.

Best regards,
${fname} ${lname}`
   );

   const salonEmail = 'narrobeauty0@gmail.com';
   window.location.href = `mailto:${salonEmail}?subject=${subject}&body=${body}`;

   setTimeout(() => {
     document.getElementById('booking-form-inner').style.display = 'none';
     document.getElementById('booking-success').style.display = 'block';
   }, 800);
 }

 function resetBooking() {
   document.getElementById('booking-form-inner').style.display = 'block';
   document.getElementById('booking-success').style.display = 'none';
 }

 // ─── SET MIN DATE ──────────────────────────
 const dateInput = document.getElementById('f-date');
 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 dateInput.min = tomorrow.toISOString().split('T')[0];

 // ─── AR / CAMERA ──────────────────────────
 let stream = null;
 let arMode = 'brows';
 let animFrame = null;

 async function startCamera() {
   try {
     stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
     const video = document.getElementById('ar-video');
     video.srcObject = stream;
     await video.play();
     document.getElementById('ar-label').textContent = 'Live Preview — ' + arMode.toUpperCase();
     document.getElementById('btn-start').style.display = 'none';
     drawAROverlay();
   } catch(e) {
     alert('Camera access denied or not available. Please allow camera access in your browser and try again.');
   }
 }

 function stopCamera() {
   if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
   if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
   const canvas = document.getElementById('ar-canvas');
   const ctx = canvas.getContext('2d');
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   document.getElementById('ar-label').textContent = 'Select a look & start camera';
   document.getElementById('btn-start').style.display = 'inline-block';
 }

 function setARMode(mode) {
   arMode = mode;
   document.querySelectorAll('#ar-brows, #ar-lips, #ar-eyeliner').forEach(b => b.classList.remove('active'));
   document.getElementById('ar-' + mode).classList.add('active');
   document.getElementById('ar-label').textContent = stream ? 'Live Preview — ' + mode.toUpperCase() : 'Select a look & start camera';
 }

 function drawAROverlay() {
   const video = document.getElementById('ar-video');
   const canvas = document.getElementById('ar-canvas');
   const ctx = canvas.getContext('2d');
   canvas.width = video.videoWidth || 640;
   canvas.height = video.videoHeight || 480;

   function draw() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     const w = canvas.width, h = canvas.height;
     const cx = w / 2, cy = h / 2;

     ctx.save();
     ctx.globalAlpha = 0.75;

     if (arMode === 'brows') {
       // Left brow
       ctx.beginPath();
       ctx.moveTo(cx - 160, cy - 105);
       ctx.bezierCurveTo(cx - 130, cy - 125, cx - 90, cy - 130, cx - 50, cy - 110);
       ctx.lineWidth = 14;
       ctx.strokeStyle = '#3d2e22';
       ctx.lineCap = 'round';
       ctx.stroke();
       // Right brow
       ctx.beginPath();
       ctx.moveTo(cx + 50, cy - 110);
       ctx.bezierCurveTo(cx + 90, cy - 130, cx + 130, cy - 125, cx + 160, cy - 105);
       ctx.lineWidth = 14;
       ctx.stroke();

     } else if (arMode === 'lips') {
       // Lips
       ctx.beginPath();
       ctx.moveTo(cx - 60, cy + 90);
       ctx.bezierCurveTo(cx - 40, cy + 75, cx - 10, cy + 72, cx, cy + 78);
       ctx.bezierCurveTo(cx + 10, cy + 72, cx + 40, cy + 75, cx + 60, cy + 90);
       ctx.bezierCurveTo(cx + 45, cy + 118, cx, cy + 125, cx - 45, cy + 118);
       ctx.closePath();
       ctx.fillStyle = 'rgba(176, 80, 100, 0.6)';
       ctx.fill();
       // Cupid's bow
       ctx.beginPath();
       ctx.moveTo(cx - 60, cy + 90);
       ctx.bezierCurveTo(cx - 40, cy + 82, cx - 18, cy + 78, cx - 5, cy + 84);
       ctx.bezierCurveTo(cx - 10, cy + 74, cx - 2, cy + 70, cx, cy + 73);
       ctx.bezierCurveTo(cx + 2, cy + 70, cx + 10, cy + 74, cx + 5, cy + 84);
       ctx.bezierCurveTo(cx + 18, cy + 78, cx + 40, cy + 82, cx + 60, cy + 90);
       ctx.strokeStyle = 'rgba(176, 80, 100, 0.9)';
       ctx.lineWidth = 2; ctx.stroke();

     } else if (arMode === 'eyeliner') {
       // Left eye liner
       ctx.beginPath();
       ctx.moveTo(cx - 145, cy - 55);
       ctx.bezierCurveTo(cx - 110, cy - 68, cx - 70, cy - 68, cx - 40, cy - 55);
       ctx.bezierCurveTo(cx - 20, cy - 46, cx - 15, cy - 42, cx - 15, cy - 42);
       ctx.strokeStyle = '#1a1410';
       ctx.lineWidth = 4; ctx.lineCap = 'round';
       ctx.stroke();
       // Right eye liner
       ctx.beginPath();
       ctx.moveTo(cx + 40, cy - 55);
       ctx.bezierCurveTo(cx + 70, cy - 68, cx + 110, cy - 68, cx + 145, cy - 55);
       ctx.bezierCurveTo(cx + 155, cy - 47, cx + 160, cy - 42, cx + 160, cy - 42);
       ctx.stroke();
     }

     ctx.restore();
     animFrame = requestAnimationFrame(draw);
   }
   draw();
 }

 function captureAR() {
   const video = document.getElementById('ar-video');
   const canvas = document.getElementById('ar-canvas');
   const capture = document.createElement('canvas');
   capture.width = canvas.width;
   capture.height = canvas.height;
   const ctx2 = capture.getContext('2d');
   ctx2.save();
   ctx2.translate(capture.width, 0);
   ctx2.scale(-1, 1);
   ctx2.drawImage(video, 0, 0, capture.width, capture.height);
   ctx2.restore();
   ctx2.drawImage(canvas, 0, 0);
   const link = document.createElement('a');
   link.download = 'narro-beauty-tryon.png';
   link.href = capture.toDataURL('image/png');
   link.click();
 }
