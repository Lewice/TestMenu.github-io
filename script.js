$(document).ready(function () {
  console.log('jQuery loaded and document ready');

  let clockInTime = null;
  let isEditMode = false;
  let originalItems = [];
  let customDiscount = null; // Store custom discount value (null means no custom discount)

  // Save original menu items before editing
  function saveOriginalItems() {
    originalItems = [];
    $('.menu-item').each(function () {
      const $label = $(this).parent();
      const name = $label.text().trim().split(' - $')[0];
      const price = parseFloat($(this).attr('data-price'));
      if (name && !isNaN(price)) {
        originalItems.push({ name, price });
      }
    });
    console.log('Original items saved:', originalItems);
  }

  // Toggle edit mode
  function toggleEditMode() {
    isEditMode = !isEditMode;
    if (isEditMode) {
      saveOriginalItems();
      $('.menu-item').each(function () {
        const $label = $(this).parent();
        const name = $label.text().trim().split(' - $')[0];
        const price = $(this).attr('data-price');
        $label.html(
          `<input type="checkbox" class="menu-item" data-price="${price}">
           <input type="text" class="edit-name" value="${name}">
           - $<input type="number" class="edit-price" value="${price}" min="0" step="0.01">
           <input type="number" class="quantity" value="1" min="1">`
        );
      });
      $('#menuForm').addClass('edit-mode');
      $('.edit-controls').show();
      console.log('Edit mode enabled');
    } else {
      $('.menu-item').each(function (index) {
        if (originalItems[index]) {
          const $label = $(this).parent();
          const { name, price } = originalItems[index];
          $(this).attr('data-price', price);
          $label.html(
            `<input type="checkbox" class="menu-item" data-price="${price}"> ${name} - $${price}
             <input type="number" class="quantity" value="1" min="1">`
          );
        }
      });
      $('#menuForm').removeClass('edit-mode');
      $('.edit-controls').hide();
      console.log('Edit mode disabled');
    }
  }

  // Save edited items
  function saveEdits() {
    $('.menu-item').each(function (index) {
      const $label = $(this).parent();
      const newName = $label.find('.edit-name').val().trim();
      const newPrice = parseFloat($label.find('.edit-price').val());
      if (newName && !isNaN(newPrice) && newPrice >= 0) {
        originalItems[index] = { name: newName, price: newPrice };
        $(this).attr('data-price', newPrice);
        $label.html(
          `<input type="checkbox" class="menu-item" data-price="${newPrice}"> ${newName} - $${newPrice}
           <input type="number" class="quantity" value="1" min="1">`
        );
      }
    });
    isEditMode = false;
    $('#menuForm').removeClass('edit-mode');
    $('.edit-controls').hide();
    console.log('Edits saved:', originalItems);
    alert('Menu items updated successfully!');
  }

  // Cancel edits
  function cancelEdits() {
    $('.menu-item').each(function (index) {
      if (originalItems[index]) {
        const $label = $(this).parent();
        const { name, price } = originalItems[index];
        $(this).attr('data-price', price);
        $label.html(
          `<input type="checkbox" class="menu-item" data-price="${price}"> ${name} - $${price}
           <input type="number" class="quantity" value="1" min="1">`
        );
      }
    });
    isEditMode = false;
    $('#menuForm').removeClass('edit-mode');
    $('.edit-controls').hide();
    console.log('Edits canceled');
    alert('Changes discarded.');
  }

  // Hotkey for edit mode (Ctrl+Shift+E)
  $(document).on('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      console.log('Ctrl+Shift+E pressed, toggling edit mode');
      toggleEditMode();
    }
  });

  // Hotkey for custom discount (Ctrl+Shift+D)
  $(document).on('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      console.log('Ctrl+Shift+D pressed, prompting for custom discount');
      const discountInput = prompt('Enter custom discount percentage (0-100):');
      const parsedDiscount = parseFloat(discountInput);
      if (!isNaN(parsedDiscount) && parsedDiscount >= 0 && parsedDiscount <= 100) {
        customDiscount = parsedDiscount;
        // Update dropdown to show custom discount temporarily
        $('#discount').val('0'); // Reset to "No Discount" to avoid confusion
        console.log(`Custom discount set to ${customDiscount}%`);
        alert(`Custom discount set to ${customDiscount}%`);
        // Recalculate totals if items are selected
        if ($('.menu-item:checked').length > 0) {
          window.calculateTotals();
        }
      } else {
        console.log('Invalid discount input:', discountInput);
        alert('Please enter a valid discount percentage between 0 and 100.');
      }
    }
  });

  // Save and Cancel buttons
  $('#saveEditsBtn').on('click', function () {
    console.log('Save edits button clicked');
    saveEdits();
  });

  $('#cancelEditsBtn').on('click', function () {
    console.log('Cancel edits button clicked');
    cancelEdits();
  });

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
      // Use customDiscount if set, otherwise use dropdown value
      const discount = customDiscount !== null ? customDiscount : parseFloat($('#discount').val()) || 0;

      console.log(`Item: ${$checkbox.parent().text().trim()}, Price: ${price}, Quantity: ${quantity}, Discount: ${discount}%`);

      if (isNaN(price)) {
        console.warn(`Invalid price for item: ${$checkbox.parent().text().trim()}`);
        return true; // Skip to next item
      }
      if (isNaN(quantity) || quantity <= 0) {
        console.warn(`Invalid quantity (${quantity}) for item: ${$checkbox.parent().text().trim()}`);
        return true; // Skip to next item
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
      const itemName = $(this).parent().text().trim().split(' - $')[0];
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
    // Use customDiscount if set, otherwise use dropdown value
    const discount = customDiscount !== null ? customDiscount : parseFloat($('#discount').val()) || 0;
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
        url: 'https://discord.com/api/webhooks/1385235378822447206/bM0xYWsV6MftJEydlXuKy1YEEvJOamAvpFviopUik_7qN6b3ysfEmcu_1Na9z6-_126P',
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
      alert('Error submitting order. Check console for details.');
    });
  };

  window.resetForm = function () {
    console.log('resetForm() triggered');
    $('.menu-item').prop('checked', false);
    $('.quantity').val(1);
    $('#total, #commission').text('');
    $('#discount').val('0');
    customDiscount = null;
    console.log('Form reset');
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
      url: 'https://discord.com/api/webhooks/1385235711653052478/JqR9S91n2mFWE9BmLXsMNPjgudbR8fW6Ae-14l36fGepCpbN6MPDAS7Vre3nytWIQmmY',
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
      url: 'https://discord.com/api/webhooks/1385235711653052478/JqR9S91n2mFWE9BmLXsMNPjgudbR8fW6Ae-14l36fGepCpbN6MPDAS7Vre3nytWIQmmY',
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