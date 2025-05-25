<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Menu</title>
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
      gap: 10px; /* Space between checkbox, text, and quantity input */
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
      background-color: #f0f0f0; /* Fallback color */
      color: #ffffff; /* White text for better contrast */
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); /* Text shadow for readability */
    }
    h2 {
      color: cyan; /* Cyan color for Pacific Bluffs header */
    }
    .button-group {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    /* Optional: Add a semi-transparent overlay for better readability */
    form {
      background: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
      padding: 20px;
      border-radius: 10px;
      max-width: 600px;
      margin: 0 auto;
    }
    .quantity {
      width: 60px; /* Consistent width for quantity inputs */
      margin-left: auto; /* Push quantity inputs to the right for alignment */
    }
  </style>
  <script>
    $(document).ready(function () {
      // Store clock-in time
      let clockInTime = null;

      // Calculate Totals
      window.calculateTotals = function () {
        console.log('calculateTotals() triggered'); // Debug: Confirm function is called
        let total = 0;
        const menuItems = $('.menu-item:checked');
        console.log('Checked items:', menuItems.length); // Debug: Log number of checked items
        if (menuItems.length === 0) {
          alert('Please select at least one item to calculate!');
          $('#total, #commission').html('');
          return;
        }
        menuItems.each(function () {
          const price = parseFloat($(this).attr('data-price'));
          const quantity = parseInt($(this).next('.quantity').val()) || 0;
          const discount = parseFloat($('#discount').val()) || 0;
          console.log(`Processing item - Price: ${price}, Quantity: ${quantity}, Discount: ${discount}%`); // Debug: Log item details
          if (!isNaN(price) && !isNaN(quantity) && quantity > 0) {
            const itemTotal = price * quantity * (1 - (discount / 100));
            total += itemTotal;
            console.log(`Item: ${$(this).text().trim()}, Item Total: ${itemTotal.toFixed(2)}`); // Debug: Log item total
          } else {
            console.warn(`Skipping item: Invalid price (${price}) || quantity (${quantity})`);
          }
        });
        const commission = total * 0.25;
        $('#total').text(total.toFixed(2));
        $('#commission').html(commission.toFixed(2));
        console.log(`Final total: ${total.toFixed(2)}, Commission: ${commission.toFixed(2)}`); // Debug: Log final results
      });

      // Bind Calculate button
      $('#calculateBtn').on('click', function () {
        console.log('Calculate button clicked'); // Debug: Confirm button click
        window.calculateTotals();
      });

      // Submit Form
      window.SubForm = function () {
        const total = $('#orderTotal').text().trim();
        if (!total) {
          alert('Please calculate the total first!');
          return;
        }
        const employeeName = $('#employeeNameInput').val().trim();
        if (!employeeName) {
          alert('Employee Name is required!');
          return;
        }
        const orderedItems = [];
        $('.menu-item:checked').each(function () {
          const itemName = $(this).parent().text().trim();
          const price = parseFloat($(this).data('price'));
          const quantity = parseInt($(this).next('.quantity').val()) || 0;
          if (!isNaN(price) && !isNaN(quantity) && quantity > 0) {
            orderedItems.push({ name: itemName, price: price, quantity: quantity });
          }
        });
        if (orderedItems.length === 0) {
          alert('Please select at least one item!');
          return;
        }
        const totalValue = parseFloat(total);
        const commissionValue = parseFloat($('#commission').text());
        const discountValue = parseFloat($('#discount').val()) || 0;
        const formData = {
          'Employee Name': employeeName,
          'Total': totalValue.toFixed(2),
          'Commission': commissionValue.toFixed(2),
          'Items Ordered': JSON.stringify(orderedItems),
          'Discount %': discountValue
        };
        const discordData = {
          username: 'Webhook',
          content: `New order submitted by ${employeeName}`,
          embeds: [
            {
              title: 'Order Details',
              fields: [
                { name: 'Employee Name', value: employeeName, inline: true },
                { name: 'Total', value: `$${totalValue.toFixed(2)}`, inline: true },
                { name: 'Commission', value: `$${commissionValue.toFixed(2)}`, inline: true },
                { name: 'Discount %', value: `${discountValue}%`, inline: true },
                { name: 'Items Ordered', value: orderedItems.map(item => `${item.quantity}x ${item.name}`).join('\n') }
              ],
              color: 0x00ff00
            }
          ]
        };
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
          alert('Order submitted successfully!');
          resetForm();
        }).fail(function (xhr, status, error) {
          alert('Error submitting order. Please try again.');
          console.error(`Submission error: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
        });
      };

      // Reset Form
      window.resetForm = function () {
        $('.menu-item').prop('checked', false);
        $('.quantity').val(1);
        $('#total, #commission').html('');
        $('#discount').val('0');
      };

      // Clock In
      window.clockIn = function () {
        console.log('clockIn() triggered');
        const employeeName = $('#employeeNameInput').val().trim();
        if (!employeeName) {
          alert('Employee Name is required!');
          console.warn('Clock-in aborted: Employee name is empty');
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
          username: 'Pacific Bluffs Clock',
          embeds: [
            {
              title: 'Clock In',
              fields: [
                { name: 'Employee Name', value: employeeName, inline: true },
                { name: 'Time', value: localTime, inline: true }
              ],
              color: 0x0000ff
            }
          ]
        };
        console.log('Sending clock-in webhook:', JSON.stringify(discordData));
        $.ajax({
          url: 'https://discord.com/api/webhooks/1376224551918108672/Rm7nOhoWKmXNYrSmarb7gegiKtDWRd0c4-lKOIiuOG0mukfhCnwyMs3kIOcNzBmzWR-I',
          method: 'POST',
          contentType: 'application/json',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(discordData),
          success: function () {
            alert(`${employeeName} successfully clocked in at ${localTime}!`);
            console.log('Clock-in webhook sent successfully');
          },
          error: function (xhr, status, error) {
            alert('Error clocking in. Webhook may be invalid or unreachable. Check console for details.');
            console.error(`Clock-in webhook failed: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
          }
        });
      };

      // Clock Out
      window.clockOut = function () {
        console.log('clockOut() triggered');
        const employeeName = $('#employeeNameInput').val().trim();
        if (!employeeName) {
          alert('Employee Name is required!');
          console.warn('Clock-out aborted: Employee name is empty');
          return;
        }
        if (!clockInTime) {
          alert('No clock-in time recorded. Please clock in first!');
          console.warn('Clock-out aborted: No clock-in time recorded');
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
        // Calculate duration
        const durationMs = clockOutTime - clockInTime;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const durationText = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        console.log(`Clock Out: Employee: ${employeeName}, Time: ${localTime}, Duration: ${durationText}`);
        const discordData = {
          username: 'West Vinewood Clock',
          embeds: [
            {
              title: 'Clock Out',
              fields: [
                { name: 'Employee Name', value: employeeName, inline: true },
                { name: 'Time', value: localTime, inline: true },
                { name: 'Duration', value: durationText, inline: true }
              ],
              color: 0xff0000
            }
          ]
        };
        console.log('Sending clock-out webhook:', JSON.stringify(discordData));
        $.ajax({
          url: 'https://discord.com/api/webhooks/1376224551918108672/Rm7nOhoWKmXNYrSmarb7gegiKtDWRd0c4-lKOIiuOG0mukfhCnwyMs3kIOcNzBmzWR-I',
          method: 'POST',
          contentType: 'application/json',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(discordData),
          success: function () {
            alert(`${employeeName} successfully clocked out at ${localTime}! Duration: ${durationText}`);
            console.log('Clock-out webhook sent successfully');
            clockInTime = null; // Reset clock-in time
          },
          error: function (xhr, status, error) {
            alert('Error clocking out. Webhook may be invalid or unreachable. Check console for details.');
            console.error(`Clock-out webhook failed: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
          }
        });
      };
    });
  </script>
</head>
<body>
  <h2>Pacific Bluffs</h2>
  <form id="menuForm">
    <h3>Service Items</h3>
    <label>
      <input type="checkbox" class="menu-item" data-price="8000"> Repair - $8000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6500"> Spark Plugs - $6500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6500"> Tire Replacement - $6500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6500"> Brake Pads - $6500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="7000"> Air Filters - $7000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="7000"> Engine Oil - $7000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="7000"> Clutch Replacement - $7000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="7000"> Suspension Part - $7000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="25000"> Full Service - $25000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <h3>Standard Options</h3>
    <label>
      <input type="checkbox" class="menu-item" data-price="5000"> Tire Smoke - $5000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="8000"> Performance Parts - $8000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="8000"> Extras Kit - $8000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="10000"> Radio - $10000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="20000"> Nos - $20000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6500"> Headlights - $6500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="6500"> Neon Lights - $6500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="8000"> Body Kits - $8000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="8000"> Respray - $8000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="13500"> Bulletproof Tires - $13500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="7500"> Wheels/Rims - $7500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="0"> Armor/Tint - $0
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="5000"> Stance - $5000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <h3>Transmission Upgrades</h3>
    <label>
      <input type="checkbox" class="menu-item" data-price="20000"> Engine - $20000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="12500"> Turbo Charge - $12500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="12500"> Ceramic Brakes - $12500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="12500"> AWD - $12500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="12500"> FWD - $12500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="13500"> Tire Swap - $13500
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="25000"> Advanced Repair Kit - $25000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <label>
      <input type="checkbox" class="menu-item" data-price="10000"> Drift Tune Kit - $10000
      <input type="number" class="quantity" value="1" min="1">
    </label>
    <div style="margin-bottom: 30px;"></div>
    <label for="discount">Select Discount:</label>
    <select id="discount">
      <option value="0">No Discount</option>
      <option value="25">25% Discount (Employee Discount)</option>
      <option value="15">15% Discount (PD & EMS)</option>
    </select>
    <div style="margin-bottom: 30px;"></div>
    <label for="employeeName">Employee Name:</label>
    <input type="text" id="employeeName" required>
    <div style="margin-bottom: 30px;"></div>
    <p>Total: $<span id="total"></span></p>
    <p>Commission (25%): $<span id="commission"></span></p>
    <div style="margin-bottom: 30px;"></div>
    <div class="button-group">
      <button type="button" id="calculateBtn" onclick="calculateTotals()">Calculate</button>
      <button type="button" onclick="SubForm()">Submit</button>
      <button type="button" onclick="resetForm()">Reset</button>
      <button type="button" onclick="clockIn()">Clock In</button>
      <button type="button" onclick="clockOut()">Clock Out</button>
    </div>
  </form>
</body>
</html>
