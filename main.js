import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://cioxdkeaiweytbfwpoxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpb3hka2VhaXdleXRiZndwb3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDMsImV4cCI6MjA2OTg3Nzc0M30.VKtTNR77xAQlP9Js7KKSjfhv-S0f6dq85mR-zeI5GYw'
);

const hallInput = document.getElementById('hall');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const noteInput = document.getElementById('note');
const display = document.getElementById('bookingDisplay');

// ✅ Band qilish funksiyasi
async function book() {
  const hall = hallInput.value;
  const date = dateInput.value;
  const time = timeInput.value;
  const note = noteInput.value;
  if (!hall || !date || !time) return alert("Barcha maydonlar to'ldirilsin");

  const { error } = await supabase.from('bookings').insert([{ hall, date, time, note }]);
  if (error) {
    alert('❌ Xatolik: ' + error.message);
    return;
  }

  await fetchAndRender(); // ✅ Pastdagi ro‘yxatni darhol yangilaydi
  alert('✅ Band qilindi');
}

// ❌ Bandni bekor qilish
async function cancelBooking() {
  const hall = hallInput.value;
  const date = dateInput.value;
  const time = timeInput.value;

  const { error } = await supabase.from('bookings')
    .delete()
    .eq('hall', hall)
    .eq('date', date)
    .eq('time', time);

  if (error) {
    alert('❌ Bekor qilishda xatolik: ' + error.message);
    return;
  }

  await fetchAndRender();
  alert('❌ Band bekor qilindi');
}

// 🔍 Tekshirish
async function checkBooking() {
  const hall = hallInput.value;
  const date = dateInput.value;

  const { data, error } = await supabase.from('bookings')
    .select('*')
    .eq('hall', hall)
    .eq('date', date);

  if (error) {
    alert('❌ Tekshirishda xatolik: ' + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert('✅ Bo‘sh: Band yo‘q');
  } else {
    alert('❌ Band mavjud:\n' + data.map(d => `🕒 ${d.time} – ${d.note}`).join('\n'));
  }
}

// 📋 Ro‘yxatni chizish
function render(data) {
  display.innerHTML = "";
  if (!data || data.length === 0) {
    display.innerHTML = "<p>🚫 Hozircha hech qanday band yo‘q.</p>";
    return;
  }

  // Eng so‘nggi bandlar yuqorida chiqishi uchun tartiblash
  const sorted = data.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

  for (const b of sorted) {
    const div = document.createElement("div");
    div.innerHTML = `<b>${b.hall}</b> | 📅 ${b.date} | 🕒 ${b.time}<br />📝 ${b.note}`;
    display.appendChild(div);
  }
}

// 🔁 Real-time kanal
supabase.channel('booking-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
    fetchAndRender();
  })
  .subscribe();

// 🧲 Ma'lumotlarni yangilash
async function fetchAndRender() {
  const { data, error } = await supabase.from('bookings').select('*');
  if (!error) render(data);
}

// ▶️ Dastlabki yuklash
fetchAndRender();

// 👉 Tugmalarni ulash
document.getElementById('bookBtn').addEventListener('click', book);
document.getElementById('cancelBtn').addEventListener('click', cancelBooking);
document.getElementById('checkBtn').addEventListener('click', checkBooking);
