// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const slotsContainer = document.getElementById('slotsContainer');
    const selectedTimeInput = document.getElementById('selectedTime');
    const submitBtn = document.getElementById('submitBtn');
    const bookingForm = document.getElementById('bookingForm');
    const alertContainer = document.getElementById('alertContainer');

    // Restrict date selection to current date onwards
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    // Handle date selection change
    dateInput.addEventListener('change', async () => {
        const selectedDate = dateInput.value;
        
        // Reset selected time slot on date change
        selectedTimeInput.value = '';
        submitBtn.disabled = true;

        if (!selectedDate) {
            slotsContainer.innerHTML = '<small class="text-muted">Select a date to view available time slots</small>';
            return;
        }

        slotsContainer.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Loading slots...';

        try {
            const response = await fetch(`../api/get_slots.php?date=${encodeURIComponent(selectedDate)}`);
            const contentType = response.headers.get('content-type') || '';

            if (!contentType.includes('application/json')) {
                throw new Error('Invalid server response format');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch slots');

            renderSlots(availableTimes, data.booked_slots || []);
        } catch (err) {
            showAlert(err.message, 'danger');
            slotsContainer.innerHTML = '<small class="text-danger">Failed to load available slots</small>';
        }
    });

    // Render interactive time slots
    function renderSlots(allSlots, bookedSlots) {
        slotsContainer.innerHTML = '';

        allSlots.forEach(time => {
            const isBooked = bookedSlots.includes(time);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn btn-outline-secondary slot-btn ${isBooked ? 'disabled' : ''}`;
            btn.textContent = time;
            btn.disabled = isBooked;

            if (!isBooked) {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedTimeInput.value = time;
                    
                    // Enable submit button when date and time are both selected
                    submitBtn.disabled = false;
                });
            }

            slotsContainer.appendChild(btn);
        });
    }

    // Submit booking request safely
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            service: document.getElementById('service').value,
            date: dateInput.value,
            time: selectedTimeInput.value
        };

        // Validate complete payload
        if (!payload.date || !payload.time) {
            showAlert('Please select both a date and an available time slot.', 'warning');
            return;
        }

        submitBtn.disabled = true;

        try {
            const response = await fetch('../api/book.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Booking failed');

            showAlert(result.message, 'success');
            bookingForm.reset();
            selectedTimeInput.value = '';
            slotsContainer.innerHTML = '<small class="text-muted">Select a date to view available time slots</small>';
        } catch (err) {
            showAlert(err.message, 'danger');
            submitBtn.disabled = false;
        }
    });

    function showAlert(message, type) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
});