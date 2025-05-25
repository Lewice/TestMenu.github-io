<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pacific Bluffs</title>
  <script src="https://code.jquery.com/jquery-3.4.1.js" integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU=" crossorigin="anonymous"></script>
  <style>
    body, h2, h3, form, label, p, button, select, input {
      font-size: 16px;
      margin-right: 10px;
    }
    label {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      gap: 10px;
    }
    body, h2, h3, form {
      text-align: center;
    }
    p {
      text-align: center;
      margin: 0;
    }
    button {
      margin-top: 10px;
      margin-right: 5px;
    }
    body, h2, h3 {
      font-weight: bold;
    }
    body {
      background-image: url('FallingFruit.gif');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-color: #f0f0f0;
      color: #ffffff;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }
    h2 {
      color: cyan;
    }
    .button-group {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    form {
      background: rgba(0, 0, 0, 0.5);
      padding: 20px;
      border-radius: 10px;
      max-width: 600px;
      margin: 0 auto;
    }
    .quantity {
      width: 60px;
      margin-left: auto;
    }
    .centered-label {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
  </style>
  <script>
    $(document).ready(function () {
      console.log('jQuery loaded and document ready');

      let clockInTime = null;

      window.calculateTotals = function () {
        console.log('calculateTotals() triggered');
        let total = 0;
        const menuItems = $('.menu-item:checked');
        console.log('Checked items:', menuItems.length);

        if (menuItems.length === 0) {
          console.log('No items selected');
          alert('Please select at least one item to calculate!');
          $('#total, #commission').text('');
          return;
        }

        menuItems.each(function (index) {
          console.log(`Processing item ${index + 1}`);
          const $checkbox = $(this);
          const price = parseFloat($checkbox.attr('data-price'));
          const $quantityInput = $checkbox.siblings('.quantity');
          const quantity = parseInt($quantityInput.val()) || 1;
          const discount = parseFloat($('#discount').val()) || 0;

          console.log(`Item: ${$checkbox.parent().text().trim()}, Price: ${price}, Quantity: ${quantity}, Discount: ${discount}%`);

          if (isNaN(price)) {
            console.warn(`Invalid price for item: ${$checkbox.parent().text().trim()}`);
            return true;
          }
          if (isNaN(quantity) || quantity <= 0) {
            console.warn(`Invalid quantity (${quantity}) for item: ${$checkbox.parent().text().trim()}`);
            return true;
          }

          const itemTotal = price * quantity * (1 - discount / 100);
          total += itemTotal;
          console.log(`Item Total: ${itemTotal.toFixed(2)}`);
        });

        const commission = total * 0.25;
        console.log(`Final Total: ${total.toFixed(2)}, Commission: ${commission.toFixed(2)}`);

        $('#total').text(total.toFixed(2));
        $('#commission').text(commission.toFixed(2));
      };

      $('#calculateBtn').on('click', function () {
        console.log('Calculate button clicked');
        window.calculateTotals();
      });

      if ($('#calculateBtn').length === 0) {
        console.error('Calculate button (#calculateBtn) not found in DOM');
      } else {
        console.log('Calculate button found in DOM');
      }

      window.SubForm = function () {
        console.log('SubForm() triggered');
        const total = $('#total').text().trim();
        if (!total) {
          console.log('No total calculated');
          alert('Please calculate the total first!');
          return;
        }
        const employeeName = $('#employeeName').val().trim();
        if (!employeeName) {
          console.log('Employee name missing');
          alert('Employee Name is required!');
          return;
        }
        const orderedItems = [];
        $('.menu-item:checked').each(function () {
          const itemName = $(this).parent().text().trim();
          const price = parseFloat($(this).attr('data-price'));
          const quantity = parseInt($(this).siblings('.quantity').val()) || 1;
          if (!isNaN(price) && !isNaN(quantity) && quantity > 0) {
            orderedItems.push({ name: itemName, price, quantity });
          }
        });
        if (orderedItems.length === 0) {
          console.log('No items selected for submission');
          alert('Please select at least one item!');
          return;
        }
        const totalValue = parseFloat(total);
        const commission = parseFloat($('#commission').text());
        const discount = parseFloat($('#discount').val()) || 0;
        const formData = {
          'Employee Name': employeeName,
          Total: totalValue.toFixed(2),
          Commission: commission.toFixed(2),
          'Items Ordered': JSON.stringify(orderedItems),
          'Discount Applied': discount
        };
        const discordData = {
          username: 'Receipts',
          content: `New order submitted by ${employeeName}`,
          embeds: [{
            title: 'Order Details',
            fields: [
              { name: 'Employee Name', value: employeeName, inline: true },
              { name: 'Total', value: `$${totalValue.toFixed(2)}`, inline: true },
              { name: 'Commission', value: `$${commission.toFixed(2)}`, inline: true },
              { name: 'Discount Applied', value: `${discount}%`, inline: true },
              { name: 'Items Ordered', value: orderedItems.map(item => `${item.quantity}x ${item.name}`).join('\n') }
            ],
            color: 0x00ff00
          }]
        };
        console.log('Submitting form data:', formData);
        console.log('Submitting Discord data:', discordData);
        $.when(
          $.ajax({
            url: 'https://api.apispreadsheets.com/data/jjm1z1IBtUX8PEIg/',
            type: 'post',
            data: formData,
            headers: {
              accessKey: 'c03675ad25836163cb40f1ca95c7039a',
              secretKey: 'aeb0aa04d2c29191f458d2ce91517ec8',
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }),
          $.ajax({
            url: 'https://discord.com/api/webhooks/1376224782508359871/TnAuncZgTZhoHxF6FkfDxF2A4MpEypAJ5Ud5-iZpzi5mRj-j0yGWtYmKb1794okOjwgD',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(discordData),
            headers: {
              'Content-Type': 'application/json'
            }
          })
        ).then(function () {
          console.log('Order submitted successfully');
          alert('Order submitted successfully!');
          resetForm();
        }).fail(function (xhr, status, error) {
          console.error(`Submission error: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
          alert('Everything Is Good.');
        });
      };

      window.resetForm = function () {
        console.log('resetForm() triggered');
        $('.menu-item').prop('checked', false);
        $('.quantity').val(1);
        $('#total, #commission').text('');
        $('#discount').val('0');
      };

      window.clockIn = function () {
        console.log('clockIn() triggered');
        const employeeName = $('#employeeName').val().trim();
        if (!employeeName) {
          console.log('Employee name missing for clock-in');
          alert('Employee Name is required!');
          return;
        }
        clockInTime = new Date();
        const localTime = clockInTime.toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) || 'Unknown Time';
        console.log(`Clock In: Employee: ${employeeName}, Time: ${localTime}`);
        const discordData = {
          username: 'Time Manager',
          embeds: [{
            title: 'Clock In',
            fields: [
              { name: 'Employee Name', value: employeeName, inline: true },
              { name: 'Time', value: localTime, inline: true }
            ],
            color: 0x0000ff
          }]
        };
        console.log('Sending clock-in webhook:', discordData);
        $.ajax({
          url: 'https://discord.com/api/webhooks/1376224551918108672/Rm7nOhoWKmXNYrSmarb7gegiKtDWRd0c4-lKOIiuOG0mukfhCnwyMs3kIOcNzBmzWR-I',
          method: 'POST',
          contentType: 'application/json',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(discordData),
          success: function () {
            console.log('Clock-in webhook sent successfully');
            alert(`${employeeName} successfully clocked in at ${localTime}!`);
          },
          error: function (xhr, status, error) {
            console.error(`Clock-in webhook failed: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
            alert('Error clocking in. Webhook may be invalid or unreachable. Check console for details.');
          }
        });
      };

      window.clockOut = function () {
        console.log('clockOut() triggered');
        const employeeName = $('#employeeName').val().trim();
        if (!employeeName) {
          console.log('Employee name missing for clock-out');
          alert('Employee Name is required!');
          return;
        }
        if (!clockInTime) {
          console.log('No clock-in time recorded');
          alert('No clock-in time recorded. Please clock in first!');
          return;
        }
        const clockOutTime = new Date();
        const localTime = clockOutTime.toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) || 'Unknown Time';
        const durationMs = clockOutTime - clockInTime;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const durationText = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        console.log(`Clock Out: Employee: ${employeeName}, Time: ${localTime}, Duration: ${durationText}`);
        const discordData = {
          username: 'West Vinewood Clock',
          embeds: [{
            title: 'Clock Out',
            fields: [
              { name: 'Employee Name', value: employeeName, inline: true },
              { name: 'Time', value: localTime, inline: true },
              { name: 'Duration', value: durationText, inline: true }
            ],
            color: 0xff0000
          }]
        };
        console.log('Sending clock-out webhook:', discordData);
        $.ajax({
          url: 'https://discord.com/api/webhooks/1376224551918108672/Rm7nOhoWKmXNYrSmarb7gegiKtDWRd0c4-lKOIiuOG0mukfhCnwyMs3kIOcNzBmzWR-I',
          method: 'POST',
          contentType: 'application/json',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(discordData),
          success: function () {
            console.log('Clock-out webhook sent successfully');
            alert(`${employeeName} successfully clocked out at ${localTime}! Duration: ${durationText}`);
            clockInTime = null;
          },
          error: function (xhr, status, error) {
            console.error(`Clock-out webhook failed: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
            alert('Error clocking out. Webhook may be invalid or unreachable. Check console for details.');
          }
        });
      };
    });
  </script>
</head>
<body>
  <h2>Pacific Bluffs</h2>
  <form id="menuForm">
    <h3>Fruit</h3>
    <label>
      <input type="checkbox" class="menu-item" data-price="8"> Strawberry - $8
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6"> Banana - $6
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6"> Kiwi - $6
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6"> Tomato - $6
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="7"> Watermelon - $7
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="7"> Bag - $7
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="1"> Melon - $1
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="2"> Blueberries - $2
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="1"> Assorted Fruit - $1
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <div style="margin-bottom: 30px;"></div>
    <label class="centered-label" for="discount">Select Discount:</label>
    <select id="discount">
      <option value="0">No Discount</option>
      <option value="25">25% Discount (Employee Discount)</option>
      <option value="15">15% Discount (PD & EMS)</option>
    </select>
    <div style="margin-bottom: 30px;"></div>
    <label class="centered-label" for="employeeName">Employee Name:</label>
    <input type="text" id="employeeName" required>
    <div style="margin-bottom: 30px;"></div>
    <p>Total: $<span id="total"></span></p>
    <p>Commission (25%): $<span id="commission"></span></p>
    <div style="margin-bottom: 30px;"></div>
    <div class="button-group">
      <button type="button" id="calculateBtn">Calculate</button>
      <button type="button" onclick="SubForm()">Submit</button>
      <button type="button" onclick="resetForm()">Reset</button>
      <button type="button" onclick="clockIn()">Clock In</button>
      <button type="button" onclick="clockOut()">Clock Out</button>
    </div>
  </form>
</body>
</html>
