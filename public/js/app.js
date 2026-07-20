// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const slotsContainer = document.getElementById('slotsContainer');
    const selectedTimeInput = document.getElementById('selectedTime');
    const submitBtn = document.getElementById('submitBtn');
    const bookingForm = document.getElementById('bookingForm');
    const alertContainer = document.getElementById('alertContainer');

    // Restrict date picker to current date onwards
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    // Safe helper function to parse JSON responses and handle HTML server errors
    async function safeFetchJson(url, options = {}) {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type') || '';

        // Verify if the server returned valid JSON content
        if (!contentType.includes('application/json')) {
            const rawText = await response.text();
            console.error('Server returned non-JSON response:', rawText);
            throw new Error('Server returned HTML instead of JSON. Check backend server logs.');
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'An error occurred while processing the request.');
        }

        return data;
    }

    // Fetch occupied slots on date selection
    dateInput.addEventListener('change', async () => {
        const selectedDate = dateInput.value;
        if (!selectedDate) return;

        slotsContainer.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Loading slots...';
        selectedTimeInput.value = '';
        submitBtn.disabled = true;

        try {
            const data = await safeFetchJson(`../api/get_slots.php?date=${encodeURIComponent(selectedDate)}`);
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
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            date: dateInput.value,
            time: selectedTimeInput.value
        };

        submitBtn.disabled = true;

        try {
            const result = await safeFetchJson('../api/book.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            showAlert(result.message, 'success');
            bookingForm.reset();
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