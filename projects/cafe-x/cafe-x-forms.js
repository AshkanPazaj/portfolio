(function () {
  'use strict';

  const ORDER_ITEMS = {
    espresso: { label: 'Espresso', price: 3.5 },
    'flat-white': { label: 'Flat white', price: 4.75 },
    'oat-latte': { label: 'Oat latte', price: 5.25 },
    'pour-over': { label: 'Pour-over', price: 5.5 },
    'cold-brew': { label: 'Cold brew', price: 4.95 },
    'honey-latte': { label: 'Honey cinnamon latte', price: 6.25 },
    croissant: { label: 'Almond croissant', price: 4.5 },
    'avocado-toast': { label: 'Avocado toast', price: 12 },
    sandwich: { label: 'Breakfast sandwich', price: 9.75 },
  };

  const DELIVERY_FEE = 4.99;
  const MIN_DELIVERY_SUBTOTAL = 15;
  const MAX_ORDER_DAYS = 14;
  const MAX_RESERVE_DAYS = 60;

  const TIME_SLOTS = {
    weekday: [
      '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    ],
    sunday: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00',
    ],
    reserveWeekday: [
      '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
      '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30',
    ],
  };

  function formatMoney(value) {
    return '$' + value.toFixed(2);
  }

  function localISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatDisplayDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatDisplayTime(value) {
    if (!value) return '';
    const [h, min] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(h, min, 0, 0);
    return date.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  }

  function makeRef(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function isSunday(isoDate) {
    if (!isoDate) return false;
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(y, m - 1, d).getDay() === 0;
  }

  function setDateConstraints(input, maxDaysAhead) {
    if (!input) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    input.min = localISODate(today);
    const max = new Date(today);
    max.setDate(max.getDate() + maxDaysAhead);
    input.max = localISODate(max);
    if (!input.value || input.value < input.min) input.value = input.min;
  }

  function populateTimeSelect(select, isoDate, slots) {
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Select a time</option>';
    slots.forEach((slot) => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = formatDisplayTime(slot);
      select.appendChild(opt);
    });
    if (current && [...select.options].some((o) => o.value === current)) {
      select.value = current;
    }
  }

  function showFormError(box, message) {
    if (!box) return;
    box.textContent = message;
    box.hidden = !message;
  }

  function isValidPhone(value) {
    const digits = String(value).replace(/\D/g, '');
    return digits.length >= 10;
  }

  function isValidPostalCode(value) {
    return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(String(value).trim());
  }

  function hideFormShowSuccess(formLayout, successEl) {
    const grid = formLayout.querySelector('.cafe-form-grid');
    const header = formLayout.querySelector('.cafe-form-header');
    if (grid) grid.hidden = true;
    if (header) header.hidden = true;
    successEl.hidden = false;
    successEl.setAttribute('tabindex', '-1');
    successEl.focus({ preventScroll: true });
    successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showFormHideSuccess(formLayout, successEl) {
    const grid = formLayout.querySelector('.cafe-form-grid');
    const header = formLayout.querySelector('.cafe-form-header');
    if (grid) grid.hidden = false;
    if (header) header.hidden = false;
    successEl.hidden = true;
  }

  function initOrderForm() {
    const form = document.getElementById('cafe-order-form');
    const layout = document.querySelector('.cafe-form-layout');
    const success = document.getElementById('order-success');
    const successText = document.getElementById('order-success-text');
    const successItems = document.getElementById('order-success-items');
    const refEl = document.getElementById('order-ref');
    const againBtn = document.getElementById('order-again');
    const dateInput = document.getElementById('order-date');
    const timeSelect = document.getElementById('order-time');
    const subtotalEl = document.getElementById('order-subtotal');
    const deliveryFeeRow = document.getElementById('delivery-fee-row');
    const deliveryFeeEl = document.getElementById('order-delivery-fee');
    const totalEl = document.getElementById('order-total');
    const summaryList = document.getElementById('order-summary-list');
    const summaryEmpty = document.getElementById('order-summary-empty');
    const errorBox = document.getElementById('order-form-error');
    const deliveryPanel = document.getElementById('delivery-panel');
    const detailsLegend = document.getElementById('fulfillment-details-legend');
    const dateLabel = document.getElementById('order-date-label');
    const timeLabel = document.getElementById('order-time-label');
    const submitBtn = document.getElementById('order-submit');
    const asideTitle = document.getElementById('order-aside-title');
    const asideCopy = document.getElementById('order-aside-copy');
    if (!form || !success || !layout) return;

    setDateConstraints(dateInput, MAX_ORDER_DAYS);

    function getFulfillment() {
      const selected = form.querySelector('input[name="fulfillment"]:checked');
      return selected ? selected.value : 'pickup';
    }

    function isDelivery() {
      return getFulfillment() === 'delivery';
    }

    function getOrderLines() {
      return Object.entries(ORDER_ITEMS)
        .map(([key, item]) => {
          const input = form.elements.namedItem(key);
          const qty = Math.max(0, parseInt(input && input.value, 10) || 0);
          return qty > 0 ? { key, ...item, qty, lineTotal: qty * item.price } : null;
        })
        .filter(Boolean);
    }

    function updateFulfillmentUI() {
      const delivery = isDelivery();
      if (deliveryPanel) deliveryPanel.hidden = !delivery;
      if (deliveryFeeRow) deliveryFeeRow.hidden = !delivery;
      if (detailsLegend) {
        detailsLegend.textContent = delivery ? 'Delivery details' : 'Pickup details';
      }
      if (dateLabel) dateLabel.textContent = delivery ? 'Delivery date' : 'Pickup date';
      if (timeLabel) timeLabel.textContent = delivery ? 'Delivery window' : 'Pickup time';
      if (submitBtn) {
        submitBtn.textContent = delivery ? 'Place delivery order' : 'Place pickup order';
      }
      if (asideTitle) {
        asideTitle.textContent = delivery ? 'Delivery within 3 km' : 'Pickup at the counter';
      }
      if (asideCopy) {
        asideCopy.textContent = delivery
          ? 'We deliver to Queen West, King West, and the Entertainment District. Orders usually arrive in 30 to 45 minutes.'
          : '1 Queen West, Toronto. Orders are usually ready in 10 to 15 minutes depending on the rush.';
      }

      ['order-street', 'order-city', 'order-postal'].forEach((name) => {
        const field = form.elements.namedItem(name);
        if (field) field.required = delivery;
      });

      updateTotals();
    }

    function updateTimeSlots() {
      const slots = isSunday(dateInput.value) ? TIME_SLOTS.sunday : TIME_SLOTS.weekday;
      populateTimeSelect(timeSelect, dateInput.value, slots);
    }

    function updateTotals() {
      const lines = getOrderLines();
      const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
      const delivery = isDelivery();
      const fee = delivery && subtotal > 0 ? DELIVERY_FEE : 0;
      const total = subtotal + fee;

      if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
      if (deliveryFeeEl) deliveryFeeEl.textContent = formatMoney(fee);
      if (totalEl) totalEl.textContent = formatMoney(total);

      if (summaryList && summaryEmpty) {
        summaryList.innerHTML = '';
        if (lines.length === 0) {
          summaryEmpty.hidden = false;
        } else {
          summaryEmpty.hidden = true;
          lines.forEach((line) => {
            const li = document.createElement('li');
            li.innerHTML =
              '<span>' + line.qty + ' × ' + line.label + '</span>' +
              '<span>' + formatMoney(line.lineTotal) + '</span>';
            summaryList.appendChild(li);
          });
        }
      }

      return { lines, subtotal, fee, total };
    }

    function setQty(key, delta) {
      const input = form.elements.namedItem(key);
      if (!input) return;
      const next = Math.min(20, Math.max(0, (parseInt(input.value, 10) || 0) + delta));
      input.value = String(next);
      updateTotals();
    }

    form.querySelectorAll('.cafe-qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.cafe-order-row');
        const key = row && row.dataset.item;
        if (!key) return;
        setQty(key, btn.dataset.action === 'inc' ? 1 : -1);
      });
    });

    form.querySelectorAll('input[type="number"][name]').forEach((input) => {
      input.addEventListener('input', () => {
        const val = parseInt(input.value, 10);
        if (val > 20) input.value = '20';
        if (val < 0 || Number.isNaN(val)) input.value = '0';
        updateTotals();
      });
    });

    form.querySelectorAll('input[name="fulfillment"]').forEach((radio) => {
      radio.addEventListener('change', updateFulfillmentUI);
    });

    dateInput.addEventListener('change', updateTimeSlots);

    updateTimeSlots();
    updateFulfillmentUI();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showFormError(errorBox, '');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!isValidPhone(form.elements.namedItem('phone').value)) {
        showFormError(errorBox, 'Please enter a valid phone number (at least 10 digits).');
        form.elements.namedItem('phone').focus();
        return;
      }

      const { lines, subtotal, fee, total } = updateTotals();
      if (lines.length === 0) {
        showFormError(errorBox, 'Please add at least one item to your order.');
        return;
      }

      const delivery = isDelivery();
      if (delivery && subtotal < MIN_DELIVERY_SUBTOTAL) {
        showFormError(
          errorBox,
          'Delivery requires a minimum order of ' + formatMoney(MIN_DELIVERY_SUBTOTAL) + '.'
        );
        return;
      }

      if (delivery) {
        const postal = form.elements.namedItem('postal').value;
        if (!isValidPostalCode(postal)) {
          showFormError(errorBox, 'Please enter a valid Canadian postal code (e.g. M5H 2N2).');
          form.elements.namedItem('postal').focus();
          return;
        }
      }

      const data = new FormData(form);
      const name = data.get('name');
      const date = formatDisplayDate(data.get('date'));
      const time = formatDisplayTime(data.get('time'));
      const ref = makeRef('CXO');

      let message = 'Thanks, ' + name + '. ';
      if (delivery) {
        const street = data.get('street');
        const unit = data.get('unit');
        const city = data.get('city');
        const postal = data.get('postal');
        const address = street + (unit ? ', ' + unit : '') + ', ' + city + ', ' + postal;
        message +=
          'Your delivery is scheduled for ' + date + ' around ' + time + ' to ' + address + '. ';
      } else {
        message += 'Your pickup is scheduled for ' + date + ' at ' + time + '. ';
      }
      message += 'Estimated total: ' + formatMoney(total);
      if (delivery && fee > 0) {
        message += ' (includes ' + formatMoney(fee) + ' delivery fee).';
      } else {
        message += '.';
      }

      if (successText) successText.textContent = message;
      if (refEl) refEl.textContent = ref;
      if (successItems) {
        successItems.innerHTML = lines
          .map(
            (line) =>
              '<li><span>' +
              line.qty +
              ' × ' +
              line.label +
              '</span><span>' +
              formatMoney(line.lineTotal) +
              '</span></li>'
          )
          .join('');
      }

      hideFormShowSuccess(layout, success);
    });

    if (againBtn) {
      againBtn.addEventListener('click', () => {
        form.reset();
        const city = form.elements.namedItem('city');
        if (city) city.value = 'Toronto';
        setDateConstraints(dateInput, MAX_ORDER_DAYS);
        updateTimeSlots();
        updateFulfillmentUI();
        showFormError(errorBox, '');
        showFormHideSuccess(layout, success);
      });
    }
  }

  function initReserveForm() {
    const form = document.getElementById('cafe-reserve-form');
    const layout = document.querySelector('.cafe-form-layout');
    const success = document.getElementById('reserve-success');
    const successText = document.getElementById('reserve-success-text');
    const refEl = document.getElementById('reserve-ref');
    const againBtn = document.getElementById('reserve-again');
    const dateInput = document.getElementById('reserve-date');
    const timeSelect = document.getElementById('reserve-time');
    const errorBox = document.getElementById('reserve-form-error');
    const hoursHint = document.getElementById('reserve-hours-hint');
    if (!form || !success || !layout) return;

    setDateConstraints(dateInput, MAX_RESERVE_DAYS);

    function updateTimeSlots() {
      const sunday = isSunday(dateInput.value);
      const slots = sunday ? TIME_SLOTS.sunday : TIME_SLOTS.reserveWeekday;
      populateTimeSelect(timeSelect, dateInput.value, slots);
      if (hoursHint) {
        hoursHint.textContent = sunday
          ? 'Sunday hours: 9:00 am to 5:00 pm. We hold your table for 15 minutes past your reservation time.'
          : 'Mon to Sat: 7:30 am to 7:00 pm. We hold your table for 15 minutes past your reservation time.';
      }
    }

    dateInput.addEventListener('change', updateTimeSlots);
    updateTimeSlots();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showFormError(errorBox, '');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!isValidPhone(form.elements.namedItem('phone').value)) {
        showFormError(errorBox, 'Please enter a valid phone number (at least 10 digits).');
        form.elements.namedItem('phone').focus();
        return;
      }

      const data = new FormData(form);
      const name = data.get('name');
      const guests = data.get('guests');
      const date = formatDisplayDate(data.get('date'));
      const time = formatDisplayTime(data.get('time'));
      const seating = data.get('seating');
      const occasion = data.get('occasion');
      const seatingLabel = {
        any: 'any available table',
        counter: 'the counter',
        window: 'a window table',
        patio: 'the patio (seasonal)',
      }[seating] || 'any available table';
      const occasionLabel = {
        birthday: 'Birthday',
        date: 'Date night',
        business: 'Business meeting',
        celebration: 'Celebration',
      }[occasion];
      const ref = makeRef('CXR');

      let message =
        'Thanks, ' +
        name +
        '. We have you down for ' +
        guests +
        ' guest' +
        (guests === '1' ? '' : 's') +
        ' on ' +
        date +
        ' at ' +
        time +
        ', seated at ' +
        seatingLabel +
        '.';
      if (occasionLabel) message += ' Occasion: ' + occasionLabel + '.';
      message += ' A confirmation has been sent to ' + data.get('email') + '.';

      if (successText) successText.textContent = message;
      if (refEl) refEl.textContent = ref;

      hideFormShowSuccess(layout, success);
    });

    if (againBtn) {
      againBtn.addEventListener('click', () => {
        form.reset();
        setDateConstraints(dateInput, MAX_RESERVE_DAYS);
        updateTimeSlots();
        showFormError(errorBox, '');
        showFormHideSuccess(layout, success);
      });
    }
  }

  initOrderForm();
  initReserveForm();
})();
