const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatAmount = (value) => currencyFormatter.format(Number(value || 0));

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const openInvoicePrintWindow = ({
  invoice,
  booking,
  serviceItems,
  receiptDateText,
  hotelName = "KHÁCH SẠN QL HPT",
  hotelAddress = "Địa chỉ: 3667 Lhu edu vn",
}) => {
  if (!invoice) return false;

  const invoiceCode = invoice.code || `HD${String(invoice.id || "").padStart(6, "0")}`;
  const guestPhone = booking?.guestPhone || "--";
  const guestEmail = booking?.guestEmail || "--";
  const serviceRows =
    serviceItems?.length > 0
      ? serviceItems
          .map(
            (item) => `
              <div class="service-row">
                <div class="service-name">${escapeHtml(item.serviceName)}</div>
                <div class="service-center">${escapeHtml(item.quantity)}</div>
                <div class="service-right">${escapeHtml(formatAmount(item.unitPrice))}</div>
                <div class="service-right">${escapeHtml(
                  formatAmount(item.lineTotal || item.quantity * item.unitPrice),
                )}</div>
              </div>
            `,
          )
          .join("")
      : `<p class="empty-service">Không có dịch vụ</p>`;

  const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(invoiceCode)}</title>
    <style>
      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        background: #ffffff;
        color: #0f172a;
        font-family: "Segoe UI", Arial, Helvetica, sans-serif;
        font-kerning: normal;
        text-rendering: geometricPrecision;
      }

      .receipt {
        width: 100%;
        max-width: 820px;
        margin: 0 auto;
        background: #ffffff;
        padding: 28px 36px;
      }

      .center {
        text-align: center;
      }

      .hotel-name {
        margin: 0;
        font-size: 30px;
        font-weight: 900;
        letter-spacing: 0.12em;
      }

      .hotel-address {
        margin: 14px 0 0;
        font-size: 18px;
      }

      .dash {
        border-top: 2px dashed #111827;
        margin: 22px 0;
      }

      .section-title {
        margin: 0;
        text-align: center;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: 0.1em;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px 24px;
        margin-top: 24px;
        font-size: 18px;
      }

      .info-row,
      .amount-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .amount-block {
        margin-top: 20px;
        font-size: 18px;
      }

      .amount-strong {
        font-size: 20px;
        font-weight: 800;
      }

      .service-header,
      .service-row {
        display: grid;
        grid-template-columns: 2.2fr 0.6fr 1fr 1fr;
        gap: 14px;
      }

      .service-header {
        margin-top: 18px;
        font-size: 17px;
        font-weight: 800;
      }

      .service-list {
        margin-top: 14px;
        font-size: 17px;
      }

      .service-list > * + * {
        margin-top: 12px;
      }

      .service-center {
        text-align: center;
      }

      .service-right {
        text-align: right;
      }

      .empty-service {
        margin: 0;
        padding: 6px 0;
        text-align: center;
      }

      .grand-total {
        font-size: 28px;
        font-weight: 900;
      }

      .thanks {
        padding-top: 12px;
        text-align: center;
        font-size: 24px;
        font-weight: 800;
      }

      @media print {
        @page {
          size: auto;
          margin: 10mm;
        }

        .receipt {
          max-width: none;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="center">
        <h1 class="hotel-name">${escapeHtml(hotelName)}</h1>
        <p class="hotel-address">${escapeHtml(hotelAddress)}</p>
      </div>

      <div class="dash"></div>
      <p class="section-title">HÓA ĐƠN THANH TOÁN</p>

      <div class="info-grid">
        <div class="info-row"><span>Mã HĐ:</span><strong>${escapeHtml(invoiceCode)}</strong></div>
        <div class="info-row"><span>Ngày:</span><span>${escapeHtml(receiptDateText || "--")}</span></div>
        <div class="info-row"><span>Phòng:</span><strong>${escapeHtml(invoice.roomNumber || "--")}</strong></div>
        <div class="info-row"><span>Khách:</span><span>${escapeHtml(invoice.guestName || "--")}</span></div>
        <div class="info-row"><span>Điện thoại:</span><span>${escapeHtml(guestPhone)}</span></div>
        <div class="info-row"><span>Email:</span><span>${escapeHtml(guestEmail)}</span></div>
      </div>

      <div class="dash"></div>
      <p class="section-title">TIỀN PHÒNG</p>
      <div class="dash"></div>

      <div class="amount-block">
        <div class="amount-row"><span>Số ngày:</span><span>${escapeHtml(invoice.stayedDays)} ngày</span></div>
        <div class="amount-row"><span>Đơn giá:</span><span>${escapeHtml(formatAmount(invoice.roomRate))}</span></div>
        <div class="amount-row amount-strong"><span>Thành tiền:</span><span>${escapeHtml(
          formatAmount(invoice.subtotal),
        )}</span></div>
      </div>

      <div class="dash"></div>
      <p class="section-title">DỊCH VỤ</p>
      <div class="dash"></div>

      <div class="service-header">
        <span>Tên DV</span>
        <span class="service-center">SL</span>
        <span class="service-right">Giá</span>
        <span class="service-right">Tiền</span>
      </div>
      <div class="service-list">${serviceRows}</div>

      <div class="dash"></div>
      <div class="amount-row amount-strong"><span>Tổng DV:</span><span>${escapeHtml(
        formatAmount(invoice.totalServiceAmount),
      )}</span></div>

      <div class="dash"></div>
      <p class="section-title">GIẢM GIÁ</p>
      <div class="dash"></div>

      <div class="amount-row"><span>Voucher${invoice.voucher?.code ? ` (${escapeHtml(invoice.voucher.code)})` : ":"}</span><strong>- ${escapeHtml(
        formatAmount(invoice.discountAmount),
      )}</strong></div>

      <div class="dash"></div>
      <p class="section-title">TỔNG THANH TOÁN</p>
      <div class="dash"></div>

      <div class="amount-block">
        <div class="amount-row"><span>Tiền phòng:</span><span>${escapeHtml(formatAmount(invoice.subtotal))}</span></div>
        <div class="amount-row"><span>Tiền dịch vụ:</span><span>${escapeHtml(
          formatAmount(invoice.totalServiceAmount),
        )}</span></div>
        <div class="amount-row"><span>Giảm giá:</span><span>- ${escapeHtml(
          formatAmount(invoice.discountAmount),
        )}</span></div>
      </div>

      <div class="dash"></div>
      <div class="amount-row grand-total"><span>THÀNH TIỀN:</span><span>${escapeHtml(
        formatAmount(invoice.totalAmount),
      )}</span></div>
      <div class="dash"></div>

      <p class="thanks">Cảm ơn quý khách!</p>
      <div class="dash"></div>
    </div>
  </body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
    }, 500);
  };

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      cleanup();
      return;
    }

    const handleAfterPrint = () => {
      frameWindow.removeEventListener("afterprint", handleAfterPrint);
      cleanup();
    };

    frameWindow.addEventListener("afterprint", handleAfterPrint);
    frameWindow.focus();
    window.setTimeout(() => {
      frameWindow.print();
    }, 150);
  };

  document.body.appendChild(iframe);

  const frameDocument = iframe.contentDocument;
  if (!frameDocument) {
    cleanup();
    return false;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();
  return true;
};
