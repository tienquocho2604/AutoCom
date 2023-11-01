$(document).ready(() => {
	let currentMenu = null;

	// Hiển thị context menu
	$('#PORT_TABLE').on('contextmenu', 'tr', function (event) {
		event.preventDefault();

		let selectedPort = $(this);

		let comName = selectedPort.find('td:eq(1)').text();
		let contextMenu = document.getElementById('contextMenu');

		// Ẩn menu hiện tại nếu có
		if (currentMenu) {
			currentMenu.style.display = 'none';
			currentMenu = null;
		}

		contextMenu.style.display = 'block';
		const scrollX = window.scrollX || window.pageXOffset;
		const scrollY = window.scrollY || window.pageYOffset;
		const clientX = event.clientX + scrollX;
		const clientY = event.clientY + scrollY;
		const elementRect = this.getBoundingClientRect();
		const elementTop = elementRect.top + scrollY;
		const elementBottom = elementRect.bottom + scrollY;

		if (clientY < (elementTop + elementBottom) / 2) {
			// Hiển thị menu ở trên nếu click bên trên phần tử
			contextMenu.style.left = clientX + 'px';
			contextMenu.style.top = clientY + 'px';
		} else {
			// Hiển thị menu ở dưới nếu click bên dưới phần tử
			contextMenu.style.left = clientX + 'px';
			contextMenu.style.top = clientY - contextMenu.clientHeight + 'px';
		}

		currentMenu = contextMenu;

		$('.menu-item').off('click'); // Xóa sự kiện click cũ

		$('.menu-item').on('click', function () {
			let option = this.id;
			switch (option) {
				case 'refresh':
					communicate(socket, {
                        command: "reload"
                    })
					break;
				// case 'get-phone':
					
				// 	break;
				// case 'get-balance':
					
				// 	break;
			}

			// Ẩn context menu sau khi chọn
			contextMenu.style.display = 'none';
			currentMenu = null;
		});
	});

	// Ẩn context menu khi click ra bên ngoài
	$(document).on('click', function () {
		if (currentMenu) {
			currentMenu.style.display = 'none';
			currentMenu = null;
		}
	});

	$(document).on('contextmenu', function (event) {
		event.preventDefault();
		if (!$(event.target).closest('#PORT_TABLE').length) {
			let selectedPort = $(this);
			let contextMenu = document.getElementById('contextMenu2');

			// Ẩn menu hiện tại nếu có
			if (currentMenu) {
				currentMenu.style.display = 'none';
				currentMenu = null;
			}

			contextMenu.style.display = 'block';
			contextMenu.style.left = event.clientX + 'px';
			contextMenu.style.top = event.clientY + 'px';

			currentMenu = contextMenu;

			$('.menu-item').off('click'); // Xóa sự kiện click cũ

			$('.menu-item').on('click', function () {
				let option = this.id;
				switch (option) {
					case 'refresh':
						communicate(socket, {
                            portIndexs: [1],
                            command: "reloadPorts"
                        })
						break;
					// case 'get-phone':

					// 	break;
					// case 'get-balance':

					// 	break;
				}

				// Ẩn context menu sau khi chọn
				contextMenu.style.display = 'none';
				currentMenu = null;
			});
		}
	});

	$(document).on('click', 'td', function () {
		if (!$(this).find("input[type='checkbox']").length) {
			$('td').removeClass('selected-cell');
			$(this).addClass('selected-cell');
		}

		//copy
		var cellText = $(this).text();
		var input = $('<input>')
			.val(cellText)
			.css('position', 'absolute')
			.css('left', '-9999px');
		$('body').append(input);
		input.select();
		document.execCommand('copy');
		input.remove();
	});

	$(document).on('click', 'input[name="main_checkbox"]', function () {
		if (this.checked) {
			$('input[name="portCheckbox"]').each(function () {
				this.checked = true;
			});
		} else {
			$('input[name="portCheckbox"]').each(function () {
				this.checked = false;
			});
		}
	});

	$(document).on('change', 'input[name="portCheckbox"]', function () {
		if (
			$('input[name="portCheckbox"]').length ==
			$('input[name="portCheckbox"]:checked').length
		) {
			$('input[name="main_checkbox"]').prop('checked', true);
		} else {
			$('input[name="main_checkbox"]').prop('checked', false);
		}
	});

	$(function () {
		$('table').resizableColumns();
	});
});
