$(document).ready(() => {
    class PortModel {
        constructor(port) {
            this.comName = port.comName;
            this.numod = port.numod;
            this.imei = port.imei;
            this.msisdn = port.msisdn;
            this.operator = port.operator;
            this.iccid = port.iccid;
            this.smsCount = 0;
            this.signal = "-";
            this.balance = 0;
            this.status = port.status;
            this.state = port.state;
            this.statement = "Nhận dạng nhà mạng không thành công";
        }
    }

    let portData = [];

    for (let i = 1; i <= 30; i++) {
        let newPort = {
            comName: "COM" + i,
            numod: "Cổng số " + i,
            imei: "123456789_" + i,
            iccid: "987654321_" + i,
            operator: "Viettel " + i,
            msisdn: "0987654321" + i,
            modem: "Modem Type",
            state: "closed",
            status: "pending",
            retries: 0
        };

        let portModel = new PortModel(newPort);
        portData.push(portModel);
    }

    let table = document.getElementById("listComTable");

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    for (let i = 0; i < portData.length; i++) {
        let row = table.insertRow(-1);
        row.insertCell(0).innerHTML = "<input type='checkbox' name='portCheckbox'/>";
        row.insertCell(1).innerHTML = portData[i].comName;
        row.insertCell(2).innerHTML = portData[i].numod;
        row.insertCell(3).innerHTML = portData[i].imei;
        row.insertCell(4).innerHTML = portData[i].msisdn;
        row.insertCell(5).innerHTML = portData[i].operator;
        row.insertCell(6).innerHTML = portData[i].iccid;
        row.insertCell(7).innerHTML = portData[i].smsCount;
        row.insertCell(8).innerHTML = portData[i].signal;
        row.insertCell(9).innerHTML = portData[i].balance;
        row.insertCell(10).innerHTML = portData[i].status;
        row.insertCell(11).innerHTML = portData[i].state;
        row.insertCell(12).innerHTML = portData[i].statement;
    }

    let currentMenu = null;

    // Hiển thị context menu
    $("#listComTable").on("contextmenu", "tr", function(event) {
        event.preventDefault();

        let selectedPort = $(this);

        let comName = selectedPort.find("td:eq(1)").text();
        let contextMenu = document.getElementById("contextMenu");

        // Ẩn menu hiện tại nếu có
        if (currentMenu) {
            currentMenu.style.display = "none";
            currentMenu = null;
        }

        contextMenu.style.display = "block";
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        const clientX = event.clientX + scrollX;
        const clientY = event.clientY + scrollY;
        const elementRect = this.getBoundingClientRect();
        const elementTop = elementRect.top + scrollY;
        const elementBottom = elementRect.bottom + scrollY;

        if (clientY < (elementTop + elementBottom) / 2) {
            // Hiển thị menu ở trên nếu click bên trên phần tử
            contextMenu.style.left = clientX + "px";
            contextMenu.style.top = clientY + "px";
        } else {
            // Hiển thị menu ở dưới nếu click bên dưới phần tử
            contextMenu.style.left = clientX + "px";
            contextMenu.style.top = (clientY - contextMenu.clientHeight) + "px";
        }

        currentMenu = contextMenu;

        $(".menu-item").off("click"); // Xóa sự kiện click cũ

        $(".menu-item").on("click", function() {
            let option = this.id;
            switch (option) {
                case "refresh":
                    console.log("Làm mới");
                    alert("Làm mới");
                    break;
                case "get-phone":
                    console.log("Lấy số điện thoại");
                    alert("Lấy số điện thoại");
                    break;
                case "get-balance":
                    console.log("Lấy số dư");
                    alert("Lấy số dư");
                    break;
            }

            // Ẩn context menu sau khi chọn
            contextMenu.style.display = "none";
            currentMenu = null;
        });
    });

    // Ẩn context menu khi click ra bên ngoài
    $(document).on("click", function() {
        if (currentMenu) {
            currentMenu.style.display = "none";
            currentMenu = null;
        }
    });

    $(document).on("contextmenu", function(event) {
        event.preventDefault();
        if (!$(event.target).closest("#listComTable").length) {
            let selectedPort = portData.find(port => port.index === $(this).find("td:eq(1)").text());
            let contextMenu = document.getElementById("contextMenu2");

            // Ẩn menu hiện tại nếu có
            if (currentMenu) {
                currentMenu.style.display = "none";
                currentMenu = null;
            }

            contextMenu.style.display = "block";
            contextMenu.style.left = event.clientX + "px";
            contextMenu.style.top = event.clientY + "px";

            currentMenu = contextMenu;

            $(".menu-item").off("click"); // Xóa sự kiện click cũ

            $(".menu-item").on("click", function() {
                let option = this.id;
                switch (option) {
                    case "refresh":
                        console.log("Làm mới cổng đã chọn");
                        alert("Làm mới cổng đã chọn");
                        break;
                    case "get-phone":
                        console.log("Lấy số điện thoại cổng đã chọn");
                        alert("Lấy số điện thoại cổng đã chọn");
                        break;
                    case "get-balance":
                        console.log("Lấy số dư cổng đã chọn");
                        alert("Lấy số dư cổng đã chọn");
                        break;
                }

                // Ẩn context menu sau khi chọn
                contextMenu.style.display = "none";
                currentMenu = null;
            });
        }
    });

    $(document).on("click", "td", function() {
        if (!$(this).find("input[type='checkbox']").length) {
            $("td").removeClass("selected-cell");
            $(this).addClass("selected-cell");
        }

        //copy
        var cellText = $(this).text();
        var input = $("<input>").val(cellText).css("position", "absolute").css("left", "-9999px");
        $("body").append(input);
        input.select();
        document.execCommand("copy");
        input.remove();
    });

    $(document).on('click', 'input[name="main_checkbox"]', function() {
        if (this.checked) {
            $('input[name="portCheckbox"]').each(function() {
                this.checked = true;
            });
        } else {
            $('input[name="portCheckbox"]').each(function() {
                this.checked = false;
            });
        }
    });

    $(document).on('change', 'input[name="portCheckbox"]', function() {
        if ($('input[name="portCheckbox"]').length == $(
                'input[name="portCheckbox"]:checked').length) {
            $('input[name="main_checkbox"]').prop('checked', true);
        } else {
            $('input[name="main_checkbox"]').prop('checked', false);
        }
    });

    $(function() {
        $("table").resizableColumns();
    });
});